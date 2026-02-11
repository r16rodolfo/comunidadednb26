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
      .select("stripe_customer_id, stripe_subscription_id, current_plan_slug, subscription_end, email")
      .eq("user_id", user.id)
      .maybeSingle();

    if (subError || !subscriber) {
      throw new Error("No active subscription found");
    }

    const currentPlanSlug = subscriber.current_plan_slug || 'premium-monthly';
    const currentSortOrder = planSortOrders[currentPlanSlug] ?? 0;
    const newSortOrder = planSortOrders[newPlanSlug] ?? 0;
    const isUpgrade = newSortOrder > currentSortOrder;

    const hasStripe = !!subscriber.stripe_subscription_id && !!subscriber.stripe_customer_id;

    if (hasStripe) {
      // ---- STRIPE PATH ----
      const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
      if (!stripeKey) throw new Error("Missing STRIPE_SECRET_KEY");

      const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });
      const subscription = await stripe.subscriptions.retrieve(subscriber.stripe_subscription_id!);
      const subscriptionItemId = subscription.items.data[0]?.id;
      if (!subscriptionItemId) throw new Error("No subscription item found");

      logStep("Stripe plan change", { currentPlanSlug, newPlanSlug, isUpgrade });

      if (isUpgrade) {
        const updated = await stripe.subscriptions.update(subscriber.stripe_subscription_id!, {
          items: [{ id: subscriptionItemId, price: newPriceId }],
          proration_behavior: "always_invoice",
        });

        const subscriptionEnd = new Date(updated.current_period_end * 1000).toISOString();

        await supabase.from("subscribers").update({
          subscription_tier: newPlanInfo.tier,
          current_plan_slug: newPlanSlug,
          previous_plan_slug: currentPlanSlug,
          subscription_end: subscriptionEnd,
          pending_downgrade_to: null,
          pending_downgrade_date: null,
          updated_at: new Date().toISOString(),
        }).eq("user_id", user.id);

        logStep("Stripe upgrade completed", { newPlan: newPlanSlug });

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
        const currentPriceId = subscription.items.data[0]?.price?.id;

        const schedule = await stripe.subscriptionSchedules.create({
          from_subscription: subscriber.stripe_subscription_id!,
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

        await supabase.from("subscribers").update({
          pending_downgrade_to: newPlanSlug,
          pending_downgrade_date: effectiveDate,
          previous_plan_slug: currentPlanSlug,
          updated_at: new Date().toISOString(),
        }).eq("user_id", user.id);

        logStep("Stripe downgrade scheduled", { newPlan: newPlanSlug, effectiveDate });

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
    } else {
      // ---- PIX PATH ----
      logStep("PIX user plan change", { currentPlanSlug, newPlanSlug, isUpgrade });

      if (isUpgrade) {
        // PIX Upgrade: generate a PIX QR code for the prorated amount
        const apiKey = Deno.env.get("ABACATEPAY_API_KEY");
        if (!apiKey) throw new Error("ABACATEPAY_API_KEY is not set");

        // Fetch plans to calculate proration
        const { data: plans } = await supabase
          .from("plans")
          .select("slug, price_cents, name, interval")
          .in("slug", [currentPlanSlug, newPlanSlug]);

        const currentPlan = plans?.find((p: any) => p.slug === currentPlanSlug);
        const newPlan = plans?.find((p: any) => p.slug === newPlanSlug);
        if (!currentPlan || !newPlan) throw new Error("Plan not found");

        // Calculate prorated amount
        let amountCents = newPlan.price_cents;
        if (subscriber.subscription_end) {
          const subscriptionEnd = new Date(subscriber.subscription_end);
          const now = new Date();
          const daysRemaining = Math.max(0, Math.ceil((subscriptionEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
          const intervalDays: Record<string, number> = { monthly: 30, quarterly: 90, semiannual: 180, yearly: 365 };
          const totalDays = intervalDays[currentPlan.interval] || 30;
          const credit = Math.round((daysRemaining / totalDays) * currentPlan.price_cents);
          amountCents = Math.max(100, newPlan.price_cents - credit); // min 1 BRL
        }

        // Get profile for PIX customer data
        const { data: profile } = await supabase
          .from("profiles")
          .select("name, cpf, cellphone")
          .eq("user_id", user.id)
          .maybeSingle();

        const customerName = profile?.name || "Cliente";
        const customerCpf = (profile?.cpf?.replace(/\D/g, "")) || "00000000000";
        const customerPhone = (profile?.cellphone?.replace(/\D/g, "")) || "00000000000";

        const pixBody = {
          amount: amountCents,
          expiresIn: 1800,
          description: `Upgrade para ${newPlan.name}`,
          customer: {
            name: customerName,
            cellphone: customerPhone,
            email: user.email,
            taxId: customerCpf,
          },
          metadata: {
            userId: user.id,
            email: user.email,
            planSlug: newPlanSlug,
            type: "upgrade",
            previousPlanSlug: currentPlanSlug,
          },
        };

        logStep("Generating PIX QR code for upgrade", { amountCents });

        const response = await fetch("https://api.abacatepay.com/v1/pixQrCode/create", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`,
          },
          body: JSON.stringify(pixBody),
        });

        if (!response.ok) {
          const errorBody = await response.text();
          throw new Error(`AbacatePay error: ${response.status} - ${errorBody}`);
        }

        const result = await response.json();
        const qrData = result?.data || result;

        logStep("PIX upgrade QR code generated", { pixId: qrData.id });

        return new Response(JSON.stringify({
          success: true,
          type: "upgrade",
          paymentMethod: "pix",
          newPlan: newPlan.name,
          newPlanSlug,
          amountCents,
          pixData: {
            id: qrData.id,
            brCode: qrData.brCode,
            qrCodeBase64: qrData.qrCodeBase64,
            expiresAt: qrData.expiresAt,
          },
        }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200,
        });
      } else {
        // PIX Downgrade: just schedule in DB
        const effectiveDate = subscriber.subscription_end || new Date().toISOString();

        await supabase.from("subscribers").update({
          pending_downgrade_to: newPlanSlug,
          pending_downgrade_date: effectiveDate,
          previous_plan_slug: currentPlanSlug,
          updated_at: new Date().toISOString(),
        }).eq("user_id", user.id);

        // Get new plan name
        const { data: newPlan } = await supabase
          .from("plans")
          .select("name")
          .eq("slug", newPlanSlug)
          .single();

        logStep("PIX downgrade scheduled", { newPlan: newPlanSlug, effectiveDate });

        return new Response(JSON.stringify({
          success: true,
          type: "downgrade",
          newPlan: newPlan?.name || newPlanInfo.tier,
          newPlanSlug,
          effectiveDate,
        }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200,
        });
      }
    }
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    logStep("ERROR", { message: msg });
    return new Response(JSON.stringify({ error: msg }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500,
    });
  }
});
