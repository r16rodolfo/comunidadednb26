import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";
import { planPricesBRL } from "../_shared/plan-config.ts";

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

    // Get plan info
    const { planId, returnUrl } = await req.json();
    if (!planId) throw new Error("planId is required");

    const planInfo = planPricesBRL[planId];
    if (!planInfo) throw new Error(`Unknown plan: ${planId}`);
    logStep("Plan resolved", { planId, ...planInfo });

    const origin = returnUrl || req.headers.get("origin") || "http://localhost:3000";

    // Get user name from profiles
    const { data: profile } = await supabaseClient
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
            externalId: planId,
            name: planInfo.name,
            description: `Assinatura ${planInfo.name}`,
            quantity: 1,
            price: planInfo.priceCents,
          },
        ],
        returnUrl: `${origin}/subscription?cancelled=true`,
        completionUrl: `${origin}/subscription?success=true&method=pix`,
        customer: {
          name: customerName,
          email: user.email,
        },
      }),
    });

    if (!abacateResponse.ok) {
      const errorBody = await abacateResponse.text();
      logStep("AbacatePay error", { status: abacateResponse.status, body: errorBody });
      throw new Error(`AbacatePay API error: ${abacateResponse.status} - ${errorBody}`);
    }

    const abacateData = await abacateResponse.json();
    logStep("AbacatePay billing created", { id: abacateData.data?.id, url: abacateData.data?.url });

    return new Response(
      JSON.stringify({ url: abacateData.data?.url }),
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
