import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[STRIPE-WEBHOOK] ${step}${detailsStr}`);
};

// Map Stripe price IDs to plan slugs and tiers
const priceIdToPlan: Record<string, { tier: string; slug: string }> = {
  'price_1Sya3yEuyKN6OMe7YBMomGJK': { tier: 'Premium Mensal', slug: 'premium-monthly' },
  'price_1Sya4zEuyKN6OMe7y5jcyG7V': { tier: 'Premium Trimestral', slug: 'premium-quarterly' },
  'price_1Sya51EuyKN6OMe7cj3xHyCS': { tier: 'Premium Semestral', slug: 'premium-semiannual' },
  'price_1Sya69EuyKN6OMe7XLGIXK07': { tier: 'Premium Anual', slug: 'premium-yearly' },
};

function determinePlanFromPriceId(priceId: string): { tier: string; slug: string } {
  return priceIdToPlan[priceId] || { tier: 'Premium', slug: 'premium-monthly' };
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
  const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");

  if (!stripeKey || !webhookSecret) {
    logStep("ERROR", { message: "Missing STRIPE_SECRET_KEY or STRIPE_WEBHOOK_SECRET" });
    return new Response(JSON.stringify({ error: "Server configuration error" }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }

  const stripe = new Stripe(stripeKey, { apiVersion: "2023-10-16" });

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    { auth: { persistSession: false } }
  );

  try {
    const body = await req.text();
    const signature = req.headers.get("stripe-signature");

    if (!signature) {
      logStep("ERROR", { message: "No stripe-signature header" });
      return new Response(JSON.stringify({ error: "No signature" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      });
    }

    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      logStep("Signature verification failed", { message });
      return new Response(JSON.stringify({ error: `Webhook signature verification failed: ${message}` }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      });
    }

    logStep("Event received", { type: event.type, id: event.id });

    switch (event.type) {
      case "invoice.paid": {
        await handleInvoicePaid(event.data.object as Stripe.Invoice, stripe, supabaseClient);
        break;
      }
      case "customer.subscription.updated": {
        await handleSubscriptionUpdated(event.data.object as Stripe.Subscription, stripe, supabaseClient);
        break;
      }
      case "customer.subscription.deleted": {
        await handleSubscriptionDeleted(event.data.object as Stripe.Subscription, supabaseClient);
        break;
      }
      default:
        logStep("Unhandled event type", { type: event.type });
    }

    return new Response(JSON.stringify({ received: true }), {
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

/**
 * Handle invoice.paid event
 * Updates subscriber record with confirmed payment and subscription details
 */
async function handleInvoicePaid(
  invoice: Stripe.Invoice,
  stripe: Stripe,
  supabase: ReturnType<typeof createClient>
) {
  logStep("Processing invoice.paid", {
    invoiceId: invoice.id,
    customerId: invoice.customer,
    subscriptionId: invoice.subscription,
    amountPaid: invoice.amount_paid,
  });

  const customerId = typeof invoice.customer === 'string' ? invoice.customer : invoice.customer?.id;
  if (!customerId) {
    logStep("No customer ID on invoice, skipping");
    return;
  }

  // Get customer email
  const customer = await stripe.customers.retrieve(customerId);
  if (customer.deleted || !customer.email) {
    logStep("Customer deleted or no email", { customerId });
    return;
  }
  const email = customer.email;

  const subscriptionId = typeof invoice.subscription === 'string'
    ? invoice.subscription
    : invoice.subscription?.id;

  if (!subscriptionId) {
    logStep("No subscription on invoice (one-time payment?), skipping");
    return;
  }

  // Get subscription details
  const subscription = await stripe.subscriptions.retrieve(subscriptionId);
  const priceId = subscription.items.data[0]?.price?.id;
  const planInfo = priceId ? determinePlanFromPriceId(priceId) : { tier: 'Premium', slug: 'premium-monthly' };
  const subscriptionEnd = new Date(subscription.current_period_end * 1000).toISOString();

  logStep("Updating subscriber after payment", {
    email,
    subscriptionId,
    plan: planInfo,
    subscriptionEnd,
  });

  const { error } = await supabase.from("subscribers").upsert({
    email,
    user_id: await getUserIdByEmail(supabase, email),
    stripe_customer_id: customerId,
    stripe_subscription_id: subscriptionId,
    subscribed: true,
    subscription_tier: planInfo.tier,
    current_plan_slug: planInfo.slug,
    subscription_end: subscriptionEnd,
    cancel_at_period_end: subscription.cancel_at_period_end,
    updated_at: new Date().toISOString(),
  }, { onConflict: 'email' });

  if (error) {
    logStep("Error upserting subscriber", { error: error.message });
  } else {
    logStep("Subscriber updated successfully after invoice.paid");
  }
}

/**
 * Handle customer.subscription.updated event
 * Syncs plan changes, cancellation scheduling, and downgrades
 */
async function handleSubscriptionUpdated(
  subscription: Stripe.Subscription,
  stripe: Stripe,
  supabase: ReturnType<typeof createClient>
) {
  logStep("Processing subscription.updated", {
    subscriptionId: subscription.id,
    status: subscription.status,
    cancelAtPeriodEnd: subscription.cancel_at_period_end,
  });

  const customerId = typeof subscription.customer === 'string'
    ? subscription.customer
    : subscription.customer?.id;

  if (!customerId) {
    logStep("No customer ID on subscription, skipping");
    return;
  }

  const customer = await stripe.customers.retrieve(customerId);
  if (customer.deleted || !customer.email) {
    logStep("Customer deleted or no email", { customerId });
    return;
  }
  const email = customer.email;

  // Only process active or trialing subscriptions
  if (!['active', 'trialing'].includes(subscription.status)) {
    logStep("Subscription not active/trialing, skipping update", { status: subscription.status });
    return;
  }

  const priceId = subscription.items.data[0]?.price?.id;
  const planInfo = priceId ? determinePlanFromPriceId(priceId) : { tier: 'Premium', slug: 'premium-monthly' };
  const subscriptionEnd = new Date(subscription.current_period_end * 1000).toISOString();

  // Check for pending schedule (downgrade)
  let pendingDowngradeTo: string | null = null;
  let pendingDowngradeDate: string | null = null;

  if (subscription.schedule) {
    try {
      const schedule = await stripe.subscriptionSchedules.retrieve(subscription.schedule as string);
      if (schedule.phases && schedule.phases.length > 1) {
        const nextPhase = schedule.phases[schedule.phases.length - 1];
        const nextPriceId = nextPhase.items[0].price as string;
        const nextPlanInfo = determinePlanFromPriceId(nextPriceId);
        pendingDowngradeTo = nextPlanInfo.slug;
        pendingDowngradeDate = new Date(nextPhase.start_date * 1000).toISOString();
        logStep("Pending downgrade detected", { pendingDowngradeTo, pendingDowngradeDate });
      }
    } catch (e) {
      logStep("Error checking schedule", { error: String(e) });
    }
  }

  logStep("Updating subscriber after subscription change", {
    email,
    plan: planInfo,
    cancelAtPeriodEnd: subscription.cancel_at_period_end,
  });

  const { error } = await supabase.from("subscribers").upsert({
    email,
    user_id: await getUserIdByEmail(supabase, email),
    stripe_customer_id: customerId,
    stripe_subscription_id: subscription.id,
    subscribed: true,
    subscription_tier: planInfo.tier,
    current_plan_slug: planInfo.slug,
    subscription_end: subscriptionEnd,
    cancel_at_period_end: subscription.cancel_at_period_end,
    pending_downgrade_to: pendingDowngradeTo,
    pending_downgrade_date: pendingDowngradeDate,
    updated_at: new Date().toISOString(),
  }, { onConflict: 'email' });

  if (error) {
    logStep("Error upserting subscriber", { error: error.message });
  } else {
    logStep("Subscriber updated successfully after subscription.updated");
  }
}

/**
 * Handle customer.subscription.deleted event
 * Marks user as unsubscribed
 */
async function handleSubscriptionDeleted(
  subscription: Stripe.Subscription,
  supabase: ReturnType<typeof createClient>
) {
  logStep("Processing subscription.deleted", {
    subscriptionId: subscription.id,
  });

  // Find subscriber by stripe_subscription_id
  const { data: subscriber, error: findError } = await supabase
    .from("subscribers")
    .select("email, user_id, current_plan_slug")
    .eq("stripe_subscription_id", subscription.id)
    .maybeSingle();

  if (findError || !subscriber) {
    logStep("Subscriber not found for deleted subscription", {
      subscriptionId: subscription.id,
      error: findError?.message,
    });
    return;
  }

  logStep("Deactivating subscription", {
    email: subscriber.email,
    previousPlan: subscriber.current_plan_slug,
  });

  const { error } = await supabase.from("subscribers").update({
    subscribed: false,
    subscription_tier: null,
    subscription_end: null,
    current_plan_slug: null,
    previous_plan_slug: subscriber.current_plan_slug,
    stripe_subscription_id: null,
    cancel_at_period_end: false,
    pending_downgrade_to: null,
    pending_downgrade_date: null,
    updated_at: new Date().toISOString(),
  }).eq("email", subscriber.email);

  if (error) {
    logStep("Error deactivating subscriber", { error: error.message });
  } else {
    logStep("Subscriber deactivated successfully after subscription.deleted");
  }
}

/**
 * Helper: Get user_id from auth by email
 */
async function getUserIdByEmail(
  supabase: ReturnType<typeof createClient>,
  email: string
): Promise<string> {
  const { data } = await supabase
    .from("subscribers")
    .select("user_id")
    .eq("email", email)
    .maybeSingle();

  if (data?.user_id) return data.user_id;

  // Fallback: check profiles
  const { data: profiles } = await supabase
    .from("profiles")
    .select("user_id")
    .limit(1);

  // Return empty string as fallback - the upsert on email conflict will still work
  return data?.user_id || '';
}
