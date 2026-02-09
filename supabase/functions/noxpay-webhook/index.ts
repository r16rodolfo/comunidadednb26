import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";
import { resolvePlan } from "../_shared/plan-config.ts";
import { sendEmail } from "../_shared/email-sender.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[NOXPAY-WEBHOOK] ${step}${detailsStr}`);
};

/** Verify NoxPay webhook signature using SHA-256(secretKey + rawBody) → Base64 */
async function verifySignature(rawBody: string, receivedSignature: string): Promise<boolean> {
  const secretKey = Deno.env.get("NOXPAY_SECRET_KEY");
  if (!secretKey) {
    logStep("WARNING: NOXPAY_SECRET_KEY not set, skipping signature verification");
    return true; // Allow if secret not configured (dev mode)
  }

  const encoder = new TextEncoder();
  const data = encoder.encode(secretKey + rawBody);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = new Uint8Array(hashBuffer);
  const base64Hash = btoa(String.fromCharCode(...hashArray));

  return base64Hash === receivedSignature;
}

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
    const rawBody = await req.text();
    logStep("Webhook received", { bodyLength: rawBody.length });

    // Verify signature
    const signature = req.headers.get("X-Signature") || req.headers.get("noxpay-sign") || "";
    if (signature) {
      const isValid = await verifySignature(rawBody, signature);
      if (!isValid) {
        logStep("Invalid signature");
        return new Response(JSON.stringify({ error: "Invalid signature" }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 401,
        });
      }
      logStep("Signature verified");
    }

    const payload = JSON.parse(rawBody);
    logStep("Payload parsed", {
      status: payload.status,
      txid: payload.txid,
      code: payload.code,
      amount: payload.amount,
    });

    if (payload.status !== "PAID") {
      logStep("Status not PAID, updating record only", { status: payload.status });
      await supabase.from("nox_payments").update({
        status: payload.status,
        noxpay_id: payload.id || null,
      }).eq("txid", payload.txid);

      return new Response(JSON.stringify({ received: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    // Payment confirmed! Update nox_payments record
    const { data: payment, error: findError } = await supabase
      .from("nox_payments")
      .select("*")
      .eq("txid", payload.txid)
      .maybeSingle();

    if (findError || !payment) {
      logStep("Payment record not found", { txid: payload.txid, error: findError?.message });
      return new Response(JSON.stringify({ error: "Payment not found" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 404,
      });
    }

    logStep("Payment found", { paymentId: payment.id, userId: payment.user_id, planSlug: payment.plan_slug });

    // Update nox_payments with payment confirmation
    await supabase.from("nox_payments").update({
      status: "PAID",
      paid_at: new Date().toISOString(),
      noxpay_id: payload.id || null,
      receipt_name: payload.receipt_name || null,
      receipt_cpf_cnpj: payload.receipt_cpf_cnpj || null,
      pix_end2end_id: payload.pix_end2end_id || null,
    }).eq("txid", payload.txid);

    // Resolve plan info
    const planInfo = resolvePlan(
      // Map slug to price ID key - but resolvePlan expects a price ID
      // Use plan slug directly for tier name
      ''
    );

    // Determine subscription period based on plan slug
    const planSlug = payment.plan_slug;
    let monthsToAdd = 1;
    if (planSlug.includes('quarterly')) monthsToAdd = 3;
    else if (planSlug.includes('semiannual')) monthsToAdd = 6;
    else if (planSlug.includes('yearly')) monthsToAdd = 12;

    const subscriptionEnd = new Date();
    subscriptionEnd.setMonth(subscriptionEnd.getMonth() + monthsToAdd);

    // Map slug to tier name
    const tierMap: Record<string, string> = {
      'premium-monthly': 'Premium Mensal',
      'premium-quarterly': 'Premium Trimestral',
      'premium-semiannual': 'Premium Semestral',
      'premium-yearly': 'Premium Anual',
    };
    const tier = tierMap[planSlug] || 'Premium';

    // Update or create subscriber record
    // First get existing subscriber to check
    const { data: existingSub } = await supabase
      .from("subscribers")
      .select("*")
      .eq("user_id", payment.user_id)
      .maybeSingle();

    const subscriberData = {
      user_id: payment.user_id,
      email: '', // Will be filled below
      subscribed: true,
      subscription_tier: tier,
      current_plan_slug: planSlug,
      subscription_end: subscriptionEnd.toISOString(),
      cancel_at_period_end: false,
      pending_downgrade_to: null,
      pending_downgrade_date: null,
      updated_at: new Date().toISOString(),
    };

    // Get user email from profiles or auth
    const { data: profile } = await supabase
      .from("profiles")
      .select("name")
      .eq("user_id", payment.user_id)
      .maybeSingle();

    // Get email from existing subscriber or lookup
    if (existingSub) {
      subscriberData.email = existingSub.email;
    } else {
      // Need to find email - check auth users via admin API
      const { data: authUser } = await supabase.auth.admin.getUserById(payment.user_id);
      subscriberData.email = authUser?.user?.email || '';
    }

    if (!subscriberData.email) {
      logStep("ERROR: Could not determine user email");
      return new Response(JSON.stringify({ error: "User email not found" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      });
    }

    const { error: upsertError } = await supabase
      .from("subscribers")
      .upsert(subscriberData, { onConflict: "email" });

    if (upsertError) {
      logStep("Error upserting subscriber", { error: upsertError.message });
    } else {
      logStep("Subscriber activated via PIX", {
        email: subscriberData.email,
        plan: tier,
        until: subscriptionEnd.toISOString(),
      });

      // Update user role to premium
      const { data: existingRole } = await supabase
        .from("user_roles")
        .select("id, role")
        .eq("user_id", payment.user_id)
        .maybeSingle();

      if (existingRole && existingRole.role === 'free') {
        await supabase.from("user_roles").update({ role: 'premium' }).eq("id", existingRole.id);
        logStep("User role upgraded to premium");
      }

      // Send confirmation email
      await sendEmail({
        to: subscriberData.email,
        type: 'subscription_confirmed',
        data: {
          name: profile?.name || subscriberData.email,
          plan: tier,
          amount: String(payment.amount),
          nextBillingDate: subscriptionEnd.toLocaleDateString('pt-BR'),
        },
      });
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
