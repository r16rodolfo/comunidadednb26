import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";
import { planPriceIds, planSortOrders, resolvePlan } from "../_shared/plan-config.ts";

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
      .select("stripe_customer_id, stripe_subscription_id, current_plan_slug, subscription_end")
      .eq("user_id", user.id)
      .maybeSingle();

    if (subError || !subscriber) {
      throw new Error("No active subscription found");
    }

    const hasStripe = !!subscriber.stripe_subscription_id && !!subscriber.stripe_customer_id;

    if (hasStripe) {
      // ---- STRIPE PATH: use Stripe invoice preview ----
      const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
      if (!stripeKey) throw new Error("Missing STRIPE_SECRET_KEY");

      const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });
      const subscription = await stripe.subscriptions.retrieve(subscriber.stripe_subscription_id!);
      const subscriptionItemId = subscription.items.data[0]?.id;
      if (!subscriptionItemId) throw new Error("No subscription item found");

      logStep("Creating Stripe invoice preview", { newPriceId, subscriptionItemId });

      const preview = await stripe.invoices.createPreview({
        customer: subscriber.stripe_customer_id!,
        subscription: subscriber.stripe_subscription_id!,
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
        paymentMethod: "stripe" as const,
      };

      logStep("Stripe preview generated", result);
      return new Response(JSON.stringify(result), {
        headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200,
      });
    } else {
      // ---- PIX PATH: manual proration calculation ----
      logStep("PIX user detected, calculating manual proration");

      const currentPlanSlug = subscriber.current_plan_slug || 'premium-monthly';

      // Get both plans from DB
      const { data: plans, error: plansError } = await supabase
        .from("plans")
        .select("slug, price_cents, name, interval")
        .in("slug", [currentPlanSlug, newPlanSlug]);

      if (plansError || !plans || plans.length < 2) {
        throw new Error("Could not fetch plan details");
      }

      const currentPlan = plans.find((p: any) => p.slug === currentPlanSlug);
      const newPlan = plans.find((p: any) => p.slug === newPlanSlug);
      if (!currentPlan || !newPlan) throw new Error("Plan not found");

      // Calculate remaining days and credit
      const subscriptionEnd = subscriber.subscription_end
        ? new Date(subscriber.subscription_end)
        : null;

      let credit = 0;
      let daysRemaining = 0;
      let totalDays = 1;

      if (subscriptionEnd) {
        const now = new Date();
        daysRemaining = Math.max(0, Math.ceil((subscriptionEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
        
        // Estimate total days based on interval
        const intervalDays: Record<string, number> = {
          monthly: 30, quarterly: 90, semiannual: 180, yearly: 365,
        };
        totalDays = intervalDays[currentPlan.interval] || 30;

        // Credit = (remaining days / total days) * current plan price
        credit = Math.round((daysRemaining / totalDays) * currentPlan.price_cents);
      }

      // For upgrade: amount due = new plan price - credit
      const amountDue = Math.max(0, newPlan.price_cents - credit);

      const result = {
        amountDue,
        credit,
        total: newPlan.price_cents,
        currency: "brl",
        newPlanName: newPlan.name,
        newPlanSlug,
        effectiveDate: subscriptionEnd?.toISOString() || new Date().toISOString(),
        paymentMethod: "pix" as const,
        daysRemaining,
        currentPlanPrice: currentPlan.price_cents,
        newPlanPrice: newPlan.price_cents,
      };

      logStep("PIX preview generated", result);
      return new Response(JSON.stringify(result), {
        headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200,
      });
    }
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    logStep("ERROR", { message: msg });
    return new Response(JSON.stringify({ error: msg }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500,
    });
  }
});
