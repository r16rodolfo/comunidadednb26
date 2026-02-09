import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";
import { resolvePlan } from "../_shared/plan-config.ts";
import { sendEmail } from "../_shared/email-sender.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[STRIPE-WEBHOOK] ${step}${detailsStr}`);
};

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

  const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });

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

  const subscription = await stripe.subscriptions.retrieve(subscriptionId);
  const priceId = subscription.items.data[0]?.price?.id;
  const planInfo = priceId ? resolvePlan(priceId) : { tier: 'Premium', slug: 'premium-monthly' };
  const subscriptionEnd = new Date(subscription.current_period_end * 1000).toISOString();

  logStep("Updating subscriber after payment", { email, subscriptionId, plan: planInfo, subscriptionEnd });

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

    // Determine if first subscription or renewal
    const { data: existingSub } = await supabase
      .from("subscribers")
      .select("previous_plan_slug")
      .eq("email", email)
      .maybeSingle();

    const isFirstSubscription = !existingSub?.previous_plan_slug;
    const amount = invoice.amount_paid ? (invoice.amount_paid / 100).toFixed(2) : undefined;
    const nextDate = subscriptionEnd ? new Date(subscriptionEnd).toLocaleDateString('pt-BR') : undefined;

    // Get user name from profiles
    const userName = await getUserNameByEmail(supabase, email);

    if (isFirstSubscription) {
      await sendEmail({
        to: email,
        type: 'subscription_confirmed',
        data: { name: userName, plan: planInfo.tier, amount, nextBillingDate: nextDate },
      });
    } else {
      await sendEmail({
        to: email,
        type: 'renewal_receipt',
        data: { name: userName, plan: planInfo.tier, amount, nextBillingDate: nextDate },
      });
    }
  }
}

/**
 * Handle customer.subscription.updated event
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

  if (!['active', 'trialing'].includes(subscription.status)) {
    logStep("Subscription not active/trialing, skipping update", { status: subscription.status });
    return;
  }

  const priceId = subscription.items.data[0]?.price?.id;
  const planInfo = priceId ? resolvePlan(priceId) : { tier: 'Premium', slug: 'premium-monthly' };
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
        const nextPlanInfo = resolvePlan(nextPriceId);
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

    // Send upgrade/downgrade email if plan changed
    if (pendingDowngradeTo) {
      const userName = await getUserNameByEmail(supabase, email);
      await sendEmail({
        to: email,
        type: 'downgrade',
        data: {
          name: userName,
          previousPlan: planInfo.tier,
          newPlan: pendingDowngradeTo,
          expirationDate: pendingDowngradeDate ? new Date(pendingDowngradeDate).toLocaleDateString('pt-BR') : undefined,
        },
      });
    }

    // Send cancellation email if cancel_at_period_end just set
    if (subscription.cancel_at_period_end) {
      const userName = await getUserNameByEmail(supabase, email);
      await sendEmail({
        to: email,
        type: 'subscription_cancelled',
        data: {
          name: userName,
          previousPlan: planInfo.tier,
          expirationDate: subscriptionEnd ? new Date(subscriptionEnd).toLocaleDateString('pt-BR') : undefined,
        },
      });
    }
  }
}

/**
 * Handle customer.subscription.deleted event
 */
async function handleSubscriptionDeleted(
  subscription: Stripe.Subscription,
  supabase: ReturnType<typeof createClient>
) {
  logStep("Processing subscription.deleted", { subscriptionId: subscription.id });

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

  logStep("Deactivating subscription", { email: subscriber.email, previousPlan: subscriber.current_plan_slug });

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

    // Send cancellation email
    if (subscriber.email) {
      const userName = await getUserNameByEmail(supabase, subscriber.email);
      await sendEmail({
        to: subscriber.email,
        type: 'subscription_cancelled',
        data: { name: userName, previousPlan: subscriber.current_plan_slug || 'Premium' },
      });
    }
  }
}

/**
 * Helper: Get user_id from subscribers or fallback
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

  return data?.user_id || '';
}

/**
 * Helper: Get user name from profiles table
 */
async function getUserNameByEmail(
  supabase: ReturnType<typeof createClient>,
  email: string
): Promise<string | undefined> {
  const userId = await getUserIdByEmail(supabase, email);
  if (!userId) return undefined;

  const { data } = await supabase
    .from("profiles")
    .select("name")
    .eq("user_id", userId)
    .maybeSingle();

  return data?.name || undefined;
}
