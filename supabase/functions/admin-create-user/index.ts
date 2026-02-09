import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Verify the caller is an admin
    const supabaseAnon = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? ""
    );

    const authHeader = req.headers.get("Authorization")!;
    const token = authHeader.replace("Bearer ", "");
    const { data: userData } = await supabaseAnon.auth.getUser(token);
    if (!userData.user) throw new Error("Not authenticated");

    // Check admin role
    const { data: roleData } = await supabaseAnon.rpc("has_role", {
      _user_id: userData.user.id,
      _role: "admin",
    });
    if (!roleData) throw new Error("Unauthorized: admin role required");

    const { name, email, password, role } = await req.json();
    if (!name || !email || !password) {
      throw new Error("name, email and password are required");
    }

    const validRoles = ["free", "premium", "gestor", "admin"];
    const userRole = validRoles.includes(role) ? role : "free";

    // Create user with admin client
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { name },
    });

    if (createError) throw new Error(createError.message);

    // Update role if not free (trigger already creates 'free' role)
    if (userRole !== "free" && newUser.user) {
      await supabaseAdmin
        .from("user_roles")
        .update({ role: userRole })
        .eq("user_id", newUser.user.id);
    }

    return new Response(
      JSON.stringify({ success: true, userId: newUser.user?.id }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    );
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    return new Response(
      JSON.stringify({ error: msg }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});
