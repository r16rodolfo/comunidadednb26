import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[NOXPAY-CREATE-PIX] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_ANON_KEY") ?? ""
  );

  try {
    logStep("Function started");

    const authHeader = req.headers.get("Authorization")!;
    const token = authHeader.replace("Bearer ", "");
    const { data } = await supabase.auth.getUser(token);
    const user = data.user;
    if (!user?.email) throw new Error("User not authenticated");
    logStep("User authenticated", { userId: user.id, email: user.email });

    const { planSlug, amount } = await req.json();
    if (!planSlug || !amount || amount <= 0) {
      throw new Error("planSlug and amount are required");
    }
    logStep("PIX request", { planSlug, amount });

    const noxpayApiKey = Deno.env.get("NOXPAY_API_KEY");
    if (!noxpayApiKey) throw new Error("NOXPAY_API_KEY not configured");

    // Generate unique code for this payment
    const code = `DNB_${user.id.substring(0, 8)}_${Date.now()}`;

    // Get the origin for webhook URL
    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const webhookUrl = `${supabaseUrl}/functions/v1/noxpay-webhook`;

    // Create PIX payment via NoxPay API with timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 25000); // 25s timeout

    let noxResponse: Response;
    try {
      noxResponse = await fetch("https://api2.noxpay.io/payment", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "api-key": noxpayApiKey,
        },
        body: JSON.stringify({
          method: "PIX",
          code,
          amount,
          webhook_url: webhookUrl,
          client_name: user.user_metadata?.name || user.email,
          client_document: user.user_metadata?.cpf || undefined,
        }),
        signal: controller.signal,
      });
    } catch (fetchError) {
      clearTimeout(timeoutId);
      const msg = fetchError instanceof Error ? fetchError.message : String(fetchError);
      logStep("NoxPay fetch failed", { error: msg });
      if (msg.includes("abort") || msg.includes("timed out") || msg.includes("timeout")) {
        throw new Error("NoxPay API não respondeu a tempo. Tente novamente em alguns minutos.");
      }
      throw new Error(`Erro de conexão com NoxPay: ${msg}`);
    }
    clearTimeout(timeoutId);

    if (!noxResponse.ok) {
      const errorText = await noxResponse.text();
      logStep("NoxPay API error", { status: noxResponse.status, body: errorText });
      throw new Error(`NoxPay API error: ${noxResponse.status}`);
    }

    // Defensive parsing - check content type before JSON parse
    const contentType = noxResponse.headers.get("content-type") || "";
    let noxData: any;
    if (contentType.includes("application/json")) {
      noxData = await noxResponse.json();
    } else {
      const rawText = await noxResponse.text();
      logStep("NoxPay returned non-JSON response", { contentType, body: rawText.substring(0, 500) });
      throw new Error("NoxPay retornou uma resposta inesperada. Tente novamente.");
    }
    logStep("NoxPay payment created", { txid: noxData.txid, status: noxData.Status });

    // Save payment record using service role to bypass RLS for insert
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    const { error: insertError } = await supabaseAdmin.from("nox_payments").insert({
      user_id: user.id,
      plan_slug: planSlug,
      amount,
      txid: noxData.txid,
      code,
      status: noxData.Status || "WAITING_PAYMENT",
      qr_code: noxData.QRCode || null,
      qr_code_text: noxData.QRCodeText || null,
    });

    if (insertError) {
      logStep("Error saving payment", { error: insertError.message });
      throw new Error("Failed to save payment record");
    }

    return new Response(JSON.stringify({
      txid: noxData.txid,
      qrCode: noxData.QRCode,
      qrCodeText: noxData.QRCodeText,
      status: noxData.Status,
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
