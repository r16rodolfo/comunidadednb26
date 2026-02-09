import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[NOXPAY-CHECK-STATUS] ${step}${detailsStr}`);
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
    const authHeader = req.headers.get("Authorization")!;
    const token = authHeader.replace("Bearer ", "");
    const { data } = await supabase.auth.getUser(token);
    const user = data.user;
    if (!user) throw new Error("User not authenticated");

    const { txid } = await req.json();
    if (!txid) throw new Error("txid is required");

    const noxpayApiKey = Deno.env.get("NOXPAY_API_KEY");
    if (!noxpayApiKey) throw new Error("NOXPAY_API_KEY not configured");

    // Check status via NoxPay API
    const noxResponse = await fetch(`https://api2.noxpay.io/payment/${txid}`, {
      method: "GET",
      headers: { "api-key": noxpayApiKey },
    });

    if (!noxResponse.ok) {
      const errorText = await noxResponse.text();
      logStep("NoxPay status check error", { status: noxResponse.status, body: errorText });
      throw new Error(`NoxPay API error: ${noxResponse.status}`);
    }

    const noxData = await noxResponse.json();
    logStep("Status checked", { txid, status: noxData.Status });

    return new Response(JSON.stringify({ status: noxData.Status }), {
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
