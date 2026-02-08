import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

/** Grace period in days for PIX (non-Stripe) subscriptions before downgrade */
const GRACE_PERIOD_DAYS = 3;

const logStep = (step: string, details?: unknown) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : "";
  console.log(`[BILLING-CHECK] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    { auth: { persistSession: false } },
  );

  try {
    logStep("Billing check started");
    const now = new Date();

    // ─── 1. Fetch all active subscribers whose subscription_end has passed ───
    const { data: expiredSubs, error: fetchError } = await supabase
      .from("subscribers")
      .select("id, email, user_id, subscribed, subscription_end, current_plan_slug, stripe_subscription_id, cancel_at_period_end, updated_at")
      .eq("subscribed", true)
      .not("subscription_end", "is", null)
      .lt("subscription_end", now.toISOString());

    if (fetchError) {
      logStep("Error fetching expired subscribers", { error: fetchError.message });
      throw new Error(fetchError.message);
    }

    logStep("Expired subscribers found", { count: expiredSubs?.length ?? 0 });

    if (!expiredSubs || expiredSubs.length === 0) {
      logStep("No expired subscriptions to process");
      return new Response(
        JSON.stringify({ processed: 0, downgraded: 0, inGrace: 0 }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 },
      );
    }

    let downgraded = 0;
    let inGrace = 0;
    let errors = 0;

    for (const sub of expiredSubs) {
      try {
        const subscriptionEnd = new Date(sub.subscription_end);
        const daysSinceExpiry = Math.floor(
          (now.getTime() - subscriptionEnd.getTime()) / (1000 * 60 * 60 * 24),
        );

        // ─── Stripe subscriptions: Stripe webhooks should handle these,
        //     but if webhook was missed and it's been >1 day, process downgrade.
        //     For non-Stripe (PIX) subs, apply the 3-day grace period.
        const isStripe = !!sub.stripe_subscription_id;
        const graceDays = isStripe ? 1 : GRACE_PERIOD_DAYS;

        if (daysSinceExpiry < graceDays) {
          logStep("Subscriber in grace period", {
            email: sub.email,
            daysSinceExpiry,
            graceDays,
            isStripe,
          });
          inGrace++;
          continue;
        }

        // ─── 2. Process downgrade ───
        logStep("Downgrading subscriber", {
          email: sub.email,
          previousPlan: sub.current_plan_slug,
          daysSinceExpiry,
          isStripe,
        });

        // 2a. Update subscribers table → deactivate
        const { error: updateError } = await supabase
          .from("subscribers")
          .update({
            subscribed: false,
            subscription_tier: null,
            subscription_end: null,
            current_plan_slug: null,
            previous_plan_slug: sub.current_plan_slug,
            stripe_subscription_id: isStripe ? sub.stripe_subscription_id : null,
            cancel_at_period_end: false,
            pending_downgrade_to: null,
            pending_downgrade_date: null,
            updated_at: now.toISOString(),
          })
          .eq("id", sub.id);

        if (updateError) {
          logStep("Error updating subscriber", { email: sub.email, error: updateError.message });
          errors++;
          continue;
        }

        // 2b. Downgrade user role to 'free' (remove premium role)
        if (sub.user_id) {
          const { error: roleError } = await supabase
            .from("user_roles")
            .update({ role: "free" })
            .eq("user_id", sub.user_id);

          if (roleError) {
            logStep("Error downgrading user role", { userId: sub.user_id, error: roleError.message });
          } else {
            logStep("User role downgraded to free", { userId: sub.user_id });
          }

          // 2c. Send notification to the user
          await supabase.from("notifications").insert({
            user_id: sub.user_id,
            title: "Assinatura expirada",
            message: `Sua assinatura ${sub.current_plan_slug ?? "Premium"} expirou. Renove para continuar com acesso completo.`,
            type: "warning",
            icon: "alert-triangle",
            action_label: "Renovar agora",
            action_href: "/assinatura",
          });
        }

        downgraded++;
        logStep("Subscriber downgraded successfully", { email: sub.email });
      } catch (subError) {
        const msg = subError instanceof Error ? subError.message : String(subError);
        logStep("Error processing subscriber", { email: sub.email, error: msg });
        errors++;
      }
    }

    // ─── 3. Handle cancel_at_period_end subscribers (safety net) ───
    //     These should be caught above, but just in case let's also
    //     look for subscribers marked cancel_at_period_end that passed expiry.
    const { data: cancelledSubs, error: cancelError } = await supabase
      .from("subscribers")
      .select("id, email, user_id, current_plan_slug, subscription_end")
      .eq("subscribed", true)
      .eq("cancel_at_period_end", true)
      .not("subscription_end", "is", null)
      .lt("subscription_end", now.toISOString());

    if (!cancelError && cancelledSubs && cancelledSubs.length > 0) {
      logStep("Found cancel_at_period_end subscribers past expiry", { count: cancelledSubs.length });

      for (const sub of cancelledSubs) {
        const { error: deactivateError } = await supabase
          .from("subscribers")
          .update({
            subscribed: false,
            subscription_tier: null,
            subscription_end: null,
            current_plan_slug: null,
            previous_plan_slug: sub.current_plan_slug,
            cancel_at_period_end: false,
            pending_downgrade_to: null,
            pending_downgrade_date: null,
            updated_at: now.toISOString(),
          })
          .eq("id", sub.id);

        if (!deactivateError && sub.user_id) {
          await supabase
            .from("user_roles")
            .update({ role: "free" })
            .eq("user_id", sub.user_id);

          await supabase.from("notifications").insert({
            user_id: sub.user_id,
            title: "Assinatura cancelada",
            message: "Sua assinatura foi encerrada conforme solicitado. Você pode renovar a qualquer momento.",
            type: "info",
            icon: "info",
            action_label: "Ver planos",
            action_href: "/assinatura",
          });
          downgraded++;
        }
      }
    }

    const summary = {
      processed: expiredSubs.length,
      downgraded,
      inGrace,
      errors,
      timestamp: now.toISOString(),
    };

    logStep("Billing check completed", summary);

    return new Response(JSON.stringify(summary), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("FATAL ERROR", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
