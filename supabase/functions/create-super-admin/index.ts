import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

// Add type declaration for Deno to resolve "Cannot find name 'Deno'" error
// in TypeScript environments that don't have Deno's global types.
declare const Deno: any;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // This is needed if you're planning to invoke your function from a browser.
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!supabaseUrl || !serviceKey) {
      throw new Error('Server configuration error: Missing Supabase URL or Service Role Key. Please set these as secrets in your Supabase Function settings.');
    }

    const { email: rawEmail, password, name } = await req.json();
    const email = rawEmail ? rawEmail.replace(/\s/g, '').trim().toLowerCase() : '';

    if (!email || !password || !name) {
      return new Response(JSON.stringify({ error: 'Email, password, and name are required.' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      });
    }

    const supabaseAdmin = createClient(supabaseUrl, serviceKey);

    // CRITICAL SECURITY CHECK: Only allow creation if NO Super Admins exist.
    const { data: existingSuperAdmins, error: checkError } = await supabaseAdmin
      .from('profiles')
      .select('id')
      .eq('role', 'Super Admin')
      .limit(1);

    if (checkError) throw new Error(`Database check failed: ${checkError.message}`);

    if (existingSuperAdmins && existingSuperAdmins.length > 0) {
      return new Response(JSON.stringify({ error: 'A Super Admin account already exists. Cannot create another.' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 403, // Forbidden
      });
    }

    // Now, proceed with creation since no Super Admin exists.
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: email,
      password: password,
      email_confirm: true,
    });

    if (authError) throw authError;
    if (!authData.user) throw new Error('Auth user creation failed.');

    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .upsert({
        id: authData.user.id,
        name: name,
        email: email,
        role: 'Super Admin',
        is_active: true,
      });

    if (profileError) {
      // Rollback auth user if profile creation fails
      await supabaseAdmin.auth.admin.deleteUser(authData.user.id);
      throw new Error(`Profile creation failed: ${profileError.message}. User creation was rolled back.`);
    }

    return new Response(JSON.stringify({ message: 'Super Admin account created successfully. Please check your email for verification.' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});