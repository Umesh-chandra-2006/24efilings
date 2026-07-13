import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://jblhzdtqrhfeawycecql.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpibGh6ZHRxcmhmZWF3eWNlY3FsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIwNzQzMzEsImV4cCI6MjA3NzY1MDMzMX0.a7agmNDE0aQl9gCt6SMuZdbp-KKVSm7Balojc6mQXyE";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: false,
    autoRefreshToken: false
  }
});

async function run() {
  const email = `superadmin_temp_${Math.floor(Math.random() * 100000)}@example.com`;
  const password = "SuperSecurePassword123!";
  const name = "Temp Super Admin";

  console.log(`Attempting to sign up temp user: ${email}`);
  
  try {
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
          role: 'Super Admin',
        }
      }
    });

    if (authError) {
      throw new Error(`Auth sign-up failed: ${authError.message}`);
    }

    const session = authData.session;
    if (!session) {
      console.log("Sign up succeeded, but email confirmation is probably required. We cannot sign in automatically.");
      const { data: profiles } = await supabase.from('profiles').select('*');
      console.log("Profiles found with anon key:", profiles?.length);
      return;
    }

    console.log("Sign up successful. User ID:", authData.user?.id);

    const client = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: {
        headers: {
          Authorization: `Bearer ${session.access_token}`
        }
      }
    });

    const { data: profiles, error: pError } = await client.from('profiles').select('*');
    if (pError) console.error("Error fetching profiles:", pError.message);
    else console.log("\n=== PROFILES ===\n", JSON.stringify(profiles, null, 2));

    const { data: leads, error: lError } = await client.from('leads').select('*');
    if (lError) console.error("Error fetching leads:", lError.message);
    else console.log("\n=== LEADS ===\n", JSON.stringify(leads, null, 2));

    const { data: customers, error: cError } = await client.from('customers').select('*');
    if (cError) console.error("Error fetching customers:", cError.message);
    else console.log("\n=== CUSTOMERS ===\n", JSON.stringify(customers, null, 2));

  } catch (err) {
    console.error("Execution failed:", err.message || err);
  }
}

run();
