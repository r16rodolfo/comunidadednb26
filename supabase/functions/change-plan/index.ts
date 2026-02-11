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
  console.log(`[CHANGE-PLAN] ${step}${detailsStr}`);
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
      .select("stripe_customer_id, stripe_subscription_id, current_plan_slug")
      .eq("user_id", user.id)
      .maybeSingle();

    if (subError || !subscriber?.stripe_subscription_id || !subscriber?.stripe_customer_id) {
      throw new Error("No active subscription found");
    }

    const currentPlanSlug = subscriber.current_plan_slug || 'premium-monthly';
    const currentSortOrder = planSortOrders[currentPlanSlug] ?? 0;
    const newSortOrder = planSortOrders[newPlanSlug] ?? 0;
    const isUpgrade = newSortOrder > currentSortOrder;

    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });
    const subscription = await stripe.subscriptions.retrieve(subscriber.stripe_subscription_id);
    const subscriptionItemId = subscription.items.data[0]?.id;
    if (!subscriptionItemId) throw new Error("No subscription item found");

    logStep("Plan change", { currentPlanSlug, newPlanSlug, isUpgrade });

    if (isUpgrade) {
      // Upgrade: immediate change with proration
      const updated = await stripe.subscriptions.update(subscriber.stripe_subscription_id, {
        items: [{ id: subscriptionItemId, price: newPriceId }],
        proration_behavior: "always_invoice",
      });

      const subscriptionEnd = new Date(updated.current_period_end * 1000).toISOString();

      // Update DB immediately for upgrade
      await supabase.from("subscribers").update({
        subscription_tier: newPlanInfo.tier,
        current_plan_slug: newPlanSlug,
        previous_plan_slug: currentPlanSlug,
        subscription_end: subscriptionEnd,
        pending_downgrade_to: null,
        pending_downgrade_date: null,
        updated_at: new Date().toISOString(),
      }).eq("user_id", user.id);

      logStep("Upgrade completed", { newPlan: newPlanSlug });

      return new Response(JSON.stringify({
        success: true,
        type: "upgrade",
        newPlan: newPlanInfo.tier,
        newPlanSlug,
        effectiveDate: new Date().toISOString(),
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200,
      });
    } else {
      // Downgrade: schedule for end of period
      const currentPriceId = subscription.items.data[0]?.price?.id;

      const schedule = await stripe.subscriptionSchedules.create({
        from_subscription: subscriber.stripe_subscription_id,
      });

      await stripe.subscriptionSchedules.update(schedule.id, {
        phases: [
          {
            items: [{ price: currentPriceId!, quantity: 1 }],
            start_date: schedule.phases[0].start_date,
            end_date: schedule.phases[0].end_date,
          },
          {
            items: [{ price: newPriceId, quantity: 1 }],
            iterations: 1,
          },
        ],
      });

      const effectiveDate = new Date(schedule.phases[0].end_date * 1000).toISOString();

      // Update DB with pending downgrade
      await supabase.from("subscribers").update({
        pending_downgrade_to: newPlanSlug,
        pending_downgrade_date: effectiveDate,
        previous_plan_slug: currentPlanSlug,
        updated_at: new Date().toISOString(),
      }).eq("user_id", user.id);

      logStep("Downgrade scheduled", { newPlan: newPlanSlug, effectiveDate });

      return new Response(JSON.stringify({
        success: true,
        type: "downgrade",
        newPlan: newPlanInfo.tier,
        newPlanSlug,
        effectiveDate,
      }), {
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
