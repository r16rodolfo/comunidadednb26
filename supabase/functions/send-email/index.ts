import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";
import { sendEmail, type EmailType, type EmailData } from "../_shared/email-sender.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const logStep = (step: string, details?: unknown) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : "";
  console.log(`[SEND-EMAIL] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function invoked");

    // Auth: accept service-role calls (internal) and authenticated admin users
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(
        JSON.stringify({ error: "Missing authorization header" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 401 },
      );
    }

    const token = authHeader.replace("Bearer ", "");

    // Decode JWT payload to check role claim (service_role vs authenticated user)
    let jwtPayload: Record<string, unknown> = {};
    try {
      const payloadBase64 = token.split(".")[1];
      jwtPayload = JSON.parse(atob(payloadBase64));
    } catch {
      return new Response(
        JSON.stringify({ error: "Invalid token format" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 401 },
      );
    }

    const isServiceRole = jwtPayload.role === "service_role";

    if (!isServiceRole) {
      // For non-service-role calls, verify user is authenticated and is admin
      const supabaseClient = createClient(
        Deno.env.get("SUPABASE_URL") ?? "",
        Deno.env.get("SUPABASE_ANON_KEY") ?? "",
        { global: { headers: { Authorization: authHeader } } },
      );
      const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
      if (userError || !userData.user) {
        return new Response(
          JSON.stringify({ error: "Authentication failed" }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 401 },
        );
      }

      const userId = userData.user.id;
      const adminClient = createClient(
        Deno.env.get("SUPABASE_URL") ?? "",
        Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
        { auth: { persistSession: false } },
      );
      const { data: isAdmin } = await adminClient.rpc("has_role", { _user_id: userId, _role: "admin" });
      if (!isAdmin) {
        return new Response(
          JSON.stringify({ error: "Forbidden: admin role required" }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 403 },
        );
      }
      logStep("Authenticated as admin user", { userId });
    } else {
      logStep("Authenticated as service role");
    }

    const { to, type, data } = (await req.json()) as {
      to: string;
      type: EmailType;
      data: EmailData;
    };

    if (!to || !type) {
      return new Response(
        JSON.stringify({ error: "Missing required fields: to, type" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 },
      );
    }

    logStep("Sending email", { to, type });
    const result = await sendEmail({ to, type, data });

    if (!result.success) {
      return new Response(
        JSON.stringify({ error: result.error }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 },
      );
    }

    return new Response(
      JSON.stringify({ success: true }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 },
    );
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    logStep("ERROR", { message: msg });
    return new Response(
      JSON.stringify({ error: msg }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 },
    );
  }
});
