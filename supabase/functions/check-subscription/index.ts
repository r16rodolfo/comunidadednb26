import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";
import { priceIdToPlan, determinePlanFromPrice } from "../_shared/plan-config.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CHECK-SUBSCRIPTION] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    { auth: { persistSession: false } }
  );

  try {
    logStep("Function started");

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY is not set");
    logStep("Stripe key verified");

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header provided");

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError) throw new Error(`Authentication error: ${userError.message}`);
    const user = userData.user;
    if (!user?.email) throw new Error("User not authenticated or email not available");
    logStep("User authenticated", { userId: user.id, email: user.email });

    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });
    const customers = await stripe.customers.list({ email: user.email, limit: 1 });

    if (customers.data.length === 0) {
      logStep("No customer found, updating unsubscribed state");
      await supabaseClient.from("subscribers").upsert({
        email: user.email,
        user_id: user.id,
        stripe_customer_id: null,
        subscribed: false,
        subscription_tier: null,
        subscription_end: null,
        current_plan_slug: null,
        stripe_subscription_id: null,
        cancel_at_period_end: false,
        pending_downgrade_to: null,
        pending_downgrade_date: null,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'email' });

      return new Response(JSON.stringify({ subscribed: false }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    const customerId = customers.data[0].id;
    logStep("Found Stripe customer", { customerId });

    // Check active subscriptions
    const subscriptions = await stripe.subscriptions.list({
      customer: customerId,
      status: "active",
      limit: 1,
    });

    const hasActiveSub = subscriptions.data.length > 0;
    let subscriptionTier = null;
    let subscriptionEnd = null;
    let currentPlanSlug = null;
    let stripeSubscriptionId = null;
    let cancelAtPeriodEnd = false;
    let pendingDowngradeTo = null;
    let pendingDowngradeDate = null;

    if (hasActiveSub) {
      const subscription = subscriptions.data[0];
      stripeSubscriptionId = subscription.id;
      const endTimestamp = Number(subscription.current_period_end);
      if (endTimestamp && !isNaN(endTimestamp)) {
        subscriptionEnd = new Date(endTimestamp * 1000).toISOString();
      }
      cancelAtPeriodEnd = subscription.cancel_at_period_end;
      logStep("Active subscription found", { subscriptionId: subscription.id, endDate: subscriptionEnd, cancelAtPeriodEnd });

      // Determine tier from price ID (preferred) or fallback to amount/interval
      const priceId = subscription.items.data[0].price.id;
      const knownPlan = priceIdToPlan[priceId];

      if (knownPlan) {
        subscriptionTier = knownPlan.tier;
        currentPlanSlug = knownPlan.slug;
        logStep("Determined plan from price ID", { priceId, ...knownPlan });
      } else {
        const price = await stripe.prices.retrieve(priceId);
        const amount = price.unit_amount || 0;
        const interval = price.recurring?.interval || 'month';
        const intervalCount = price.recurring?.interval_count || 1;
        const planInfo = determinePlanFromPrice(amount, interval, intervalCount);
        subscriptionTier = planInfo.tier;
        currentPlanSlug = planInfo.slug;
        logStep("Determined plan from amount/interval (fallback)", { priceId, amount, interval, intervalCount, ...planInfo });
      }

      // Check for pending schedule (downgrade)
      if (subscription.schedule) {
        try {
          const schedule = await stripe.subscriptionSchedules.retrieve(subscription.schedule as string);
          if (schedule.phases && schedule.phases.length > 1) {
            const nextPhase = schedule.phases[schedule.phases.length - 1];
            const nextPriceId = nextPhase.items[0].price as string;
            const nextPrice = await stripe.prices.retrieve(nextPriceId);
            const nextInterval = nextPrice.recurring?.interval || 'month';
            const nextIntervalCount = nextPrice.recurring?.interval_count || 1;
            const nextPlanInfo = determinePlanFromPrice(nextPrice.unit_amount || 0, nextInterval, nextIntervalCount);
            pendingDowngradeTo = nextPlanInfo.slug;
            const startTs = Number(nextPhase.start_date);
            pendingDowngradeDate = (startTs && !isNaN(startTs)) ? new Date(startTs * 1000).toISOString() : null;
            logStep("Pending downgrade found", { pendingDowngradeTo, pendingDowngradeDate });
          }
        } catch (e) {
          logStep("Error checking schedule", { error: String(e) });
        }
      }
    } else {
      logStep("No active subscription found");
    }

    // Upsert subscriber data
    await supabaseClient.from("subscribers").upsert({
      email: user.email,
      user_id: user.id,
      stripe_customer_id: customerId,
      subscribed: hasActiveSub,
      subscription_tier: subscriptionTier,
      subscription_end: subscriptionEnd,
      current_plan_slug: currentPlanSlug,
      stripe_subscription_id: stripeSubscriptionId,
      cancel_at_period_end: cancelAtPeriodEnd,
      pending_downgrade_to: pendingDowngradeTo,
      pending_downgrade_date: pendingDowngradeDate,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'email' });

    logStep("Updated database", { subscribed: hasActiveSub, subscriptionTier });

    return new Response(JSON.stringify({
      subscribed: hasActiveSub,
      subscription_tier: subscriptionTier,
      subscription_end: subscriptionEnd,
      current_plan_slug: currentPlanSlug,
      cancel_at_period_end: cancelAtPeriodEnd,
      pending_downgrade_to: pendingDowngradeTo,
      pending_downgrade_date: pendingDowngradeDate,
      stripe_subscription_id: stripeSubscriptionId,
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
