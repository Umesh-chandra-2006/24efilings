
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://jblhzdtqrhfeawycecql.supabase.co";
// ERROR: We need the SERVICE_ROLE_KEY to bypass RLS and see what is truly in the DB.
// I will try to find it in the environment variables or just use the ANON key but if RLS is broken for Anon, this confirms RLS is the issue.
// However, to know if data *exists*, I need strict access.
// Since I can't read the service key from your env easily without `Deno.env` (browser/node diffs), 
// I will assume the user has access to the Supabase Dashboard as well.
// But for *me* to debug, I'll use the Anon Key. If this returns [] and I *know* I just created something, then RLS is blocking it (or it wasn't created).
// Wait, I can try to use the Edge Function secret if I knew it.
// Let's just try Anon first. If I see 0 leads, it might be RLS.

const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpibGh6ZHRxcmhmZWF3eWNlY3FsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIwNzQzMzEsImV4cCI6MjA3NzY1MDMzMX0.a7agmNDE0aQl9gCt6SMuZdbp-KKVSm7Balojc6mQXyE";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function inspectDB() {
    console.log("--- Inspecting DB (Client Role) ---");

    // 1. Check Profiles
    const { data: profiles, error: pError } = await supabase.from('profiles').select('*');
    console.log(`Profiles found: ${profiles?.length || 0}`);
    if (pError) console.error("Profile Error:", pError.message);
    if (profiles) console.log("Profiles:", profiles.map(p => ({ email: p.email, role: p.role, id: p.id })));

    // 2. Check Leads
    const { data: leads, error: lError } = await supabase.from('leads').select('*');
    console.log(`Leads found: ${leads?.length || 0}`);
    if (lError) console.error("Leads Error:", lError.message);

}

inspectDB();
