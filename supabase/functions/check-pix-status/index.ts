import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const apiKey = Deno.env.get("ABACATEPAY_API_KEY");
    if (!apiKey) throw new Error("ABACATEPAY_API_KEY is not set");

    const { pixId } = await req.json();
    if (!pixId) throw new Error("pixId is required");

    const response = await fetch(
      `https://api.abacatepay.com/v1/pixQrCode/check?id=${encodeURIComponent(pixId)}`,
      {
        method: "GET",
        headers: { Authorization: `Bearer ${apiKey}` },
      },
    );

    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(`AbacatePay error: ${response.status} - ${errorBody}`);
    }

    const result = await response.json();
    const data = result?.data || result;

    return new Response(
      JSON.stringify({ status: data.status, expiresAt: data.expiresAt }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 },
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return new Response(
      JSON.stringify({ error: message }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 },
    );
  }
});
