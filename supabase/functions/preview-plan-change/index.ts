import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";
import { planPriceIds, resolvePlan } from "../_shared/plan-config.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[PREVIEW-PLAN-CHANGE] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
  if (!stripeKey) {
    return new Response(JSON.stringify({ error: "Missing STRIPE_SECRET_KEY" }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500,
    });
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    { auth: { persistSession: false } }
  );

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header");

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabase.auth.getUser(token);
    if (userError || !userData.user) throw new Error("Authentication failed");
    const user = userData.user;
    logStep("User authenticated", { userId: user.id });

    const { newPlanSlug } = await req.json();
    if (!newPlanSlug || !planPriceIds[newPlanSlug]) {
      throw new Error(`Invalid plan slug: ${newPlanSlug}`);
    }

    const newPriceId = planPriceIds[newPlanSlug];
    const newPlanInfo = resolvePlan(newPriceId);

    // Get subscriber info
    const { data: subscriber, error: subError } = await supabase
      .from("subscribers")
      .select("stripe_customer_id, stripe_subscription_id")
      .eq("user_id", user.id)
      .maybeSingle();

    if (subError || !subscriber?.stripe_subscription_id || !subscriber?.stripe_customer_id) {
      throw new Error("No active subscription found");
    }

    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });

    const subscription = await stripe.subscriptions.retrieve(subscriber.stripe_subscription_id);
    const subscriptionItemId = subscription.items.data[0]?.id;
    if (!subscriptionItemId) throw new Error("No subscription item found");

    logStep("Creating invoice preview", { newPriceId, subscriptionItemId });

    const preview = await stripe.invoices.createPreview({
      customer: subscriber.stripe_customer_id,
      subscription: subscriber.stripe_subscription_id,
      subscription_items: [{ id: subscriptionItemId, price: newPriceId }],
      subscription_proration_behavior: "always_invoice",
    });

    const credit = preview.lines.data
      .filter((l: any) => l.amount < 0)
      .reduce((sum: number, l: any) => sum + l.amount, 0);

    const result = {
      amountDue: preview.amount_due,
      credit: Math.abs(credit),
      total: preview.total,
      currency: preview.currency,
      newPlanName: newPlanInfo.tier,
      newPlanSlug,
      effectiveDate: new Date(subscription.current_period_end * 1000).toISOString(),
    };

    logStep("Preview generated", result);

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200,
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    logStep("ERROR", { message: msg });
    return new Response(JSON.stringify({ error: msg }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500,
    });
  }
});
