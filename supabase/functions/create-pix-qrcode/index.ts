import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const logStep = (step: string, details?: unknown) => {
  const d = details ? ` - ${JSON.stringify(details)}` : "";
  console.log(`[CREATE-PIX-QRCODE] ${step}${d}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_ANON_KEY") ?? "",
  );

  const supabaseAdmin = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
  );

  try {
    logStep("Function started");

    const apiKey = Deno.env.get("ABACATEPAY_API_KEY");
    if (!apiKey) throw new Error("ABACATEPAY_API_KEY is not set");

    // Authenticate user
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header provided");

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError) throw new Error(`Authentication error: ${userError.message}`);
    const user = userData.user;
    if (!user?.email) throw new Error("User not authenticated or email not available");
    logStep("User authenticated", { userId: user.id, email: user.email });

    const { planId } = await req.json();
    if (!planId) throw new Error("planId is required");

    // Fetch plan from database
    const { data: plan, error: planError } = await supabaseAdmin
      .from("plans")
      .select("name, price_cents, slug")
      .eq("slug", planId)
      .eq("is_active", true)
      .single();

    if (planError || !plan) throw new Error(`Plan not found: ${planId}`);
    logStep("Plan resolved", { slug: plan.slug, name: plan.name, priceCents: plan.price_cents });

    // Fetch profile
    const { data: profile } = await supabaseAdmin
      .from("profiles")
      .select("name, cpf, cellphone")
      .eq("user_id", user.id)
      .maybeSingle();

    const customerName = profile?.name || "Cliente";
    const customerCpf = profile?.cpf?.replace(/\D/g, "") || "00000000000";
    const customerPhone = profile?.cellphone?.replace(/\D/g, "") || "00000000000";

    // Call AbacatePay pixQrCode create
    const body: Record<string, unknown> = {
      amount: plan.price_cents,
      expiresIn: 1800, // 30 minutes
      description: `Assinatura ${plan.name}`,
      customer: {
        name: customerName,
        cellphone: customerPhone,
        email: user.email,
        taxId: customerCpf,
      },
      metadata: {
        userId: user.id,
        email: user.email,
        planSlug: plan.slug,
      },
    };

    logStep("Calling AbacatePay pixQrCode/create", { amount: plan.price_cents });

    const response = await fetch("https://api.abacatepay.com/v1/pixQrCode/create", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      logStep("AbacatePay error", { status: response.status, body: errorBody });
      throw new Error(`AbacatePay API error: ${response.status} - ${errorBody}`);
    }

    const result = await response.json();
    logStep("AbacatePay pixQrCode created", result);

    const qrData = result?.data || result;

    return new Response(
      JSON.stringify({
        id: qrData.id,
        brCode: qrData.brCode,
        qrCodeBase64: qrData.qrCodeBase64,
        expiresAt: qrData.expiresAt,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 },
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    logStep("ERROR", { message });
    return new Response(
      JSON.stringify({ error: message }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 },
    );
  }
});
