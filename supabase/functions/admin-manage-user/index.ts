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
    const supabaseAnon = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? ""
    );

    const authHeader = req.headers.get("Authorization")!;
    const token = authHeader.replace("Bearer ", "");
    const { data: userData } = await supabaseAnon.auth.getUser(token);
    if (!userData.user) throw new Error("Not authenticated");

    const { data: isAdmin } = await supabaseAnon.rpc("has_role", {
      _user_id: userData.user.id,
      _role: "admin",
    });
    if (!isAdmin) throw new Error("Unauthorized: admin role required");

    const { action, user_id, role } = await req.json();

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    if (action === "update_role") {
      const validRoles = ["free", "premium", "gestor", "admin"];
      if (!validRoles.includes(role)) throw new Error("Invalid role");
      if (!user_id) throw new Error("user_id is required");

      // Prevent admin from changing their own role
      if (user_id === userData.user.id) {
        throw new Error("Cannot change your own role");
      }

      const { error } = await supabaseAdmin
        .from("user_roles")
        .update({ role })
        .eq("user_id", user_id);

      if (error) throw new Error(error.message);

      return new Response(
        JSON.stringify({ success: true }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (action === "delete_user") {
      if (!user_id) throw new Error("user_id is required");

      // Prevent admin from deleting themselves
      if (user_id === userData.user.id) {
        throw new Error("Cannot delete your own account");
      }

      // Try to delete auth user; if "User not found", clean up orphaned records
      const { error } = await supabaseAdmin.auth.admin.deleteUser(user_id);
      if (error && !error.message.includes("User not found")) {
        throw new Error(error.message);
      }

      // Clean up profile and role records (in case auth cascade didn't fire)
      await supabaseAdmin.from("user_roles").delete().eq("user_id", user_id);
      await supabaseAdmin.from("profiles").delete().eq("user_id", user_id);

      return new Response(
        JSON.stringify({ success: true }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    throw new Error("Invalid action. Use 'update_role' or 'delete_user'");
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    return new Response(
      JSON.stringify({ error: msg }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});
