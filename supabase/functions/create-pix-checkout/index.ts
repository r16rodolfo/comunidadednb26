import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const logStep = (step: string, details?: unknown) => {
  const d = details ? ` - ${JSON.stringify(details)}` : "";
  console.log(`[CREATE-PIX-CHECKOUT] ${step}${d}`);
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

    // Get plan info from request
    const { planId, returnUrl } = await req.json();
    if (!planId) throw new Error("planId is required");

    // Fetch plan from database
    const { data: plan, error: planError } = await supabaseAdmin
      .from("plans")
      .select("name, price_cents, slug")
      .eq("slug", planId)
      .eq("is_active", true)
      .single();

    if (planError || !plan) throw new Error(`Plan not found: ${planId}`);
    logStep("Plan resolved from DB", { slug: plan.slug, name: plan.name, priceCents: plan.price_cents });

    const origin = returnUrl || req.headers.get("origin") || "http://localhost:3000";

    // Get user name from profiles
    const { data: profile } = await supabaseAdmin
      .from("profiles")
      .select("name")
      .eq("user_id", user.id)
      .single();

    const customerName = profile?.name || user.email.split("@")[0];

    // Create AbacatePay billing
    const abacateResponse = await fetch("https://api.abacatepay.com/v1/billing/create", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        frequency: "ONE_TIME",
        methods: ["PIX"],
        products: [
          {
            externalId: plan.slug,
            name: plan.name,
            description: `Assinatura ${plan.name}`,
            quantity: 1,
            price: plan.price_cents,
          },
        ],
        returnUrl: `${origin}/subscription?cancelled=true`,
        completionUrl: `${origin}/subscription?success=true&method=pix`,
        customer: {
          name: customerName,
          email: user.email,
          cellphone: "00000000000",
          taxId: "00000000000",
        },
      }),
    });

    if (!abacateResponse.ok) {
      const errorBody = await abacateResponse.text();
      logStep("AbacatePay error", { status: abacateResponse.status, body: errorBody });
      throw new Error(`AbacatePay API error: ${abacateResponse.status} - ${errorBody}`);
    }

    const abacateData = await abacateResponse.json();
    logStep("AbacatePay billing created", abacateData);

    const paymentUrl = abacateData?.data?.url || abacateData?.url || abacateData?.data?.payment_url;

    if (!paymentUrl) {
      logStep("ERROR: No payment URL found in response", abacateData);
      throw new Error("AbacatePay did not return a payment URL");
    }

    return new Response(
      JSON.stringify({ url: paymentUrl }),
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
