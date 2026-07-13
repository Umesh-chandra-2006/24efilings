import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://jblhzdtqrhfeawycecql.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpibGh6ZHRxcmhmZWF3eWNlY3FsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIwNzQzMzEsImV4cCI6MjA3NzY1MDMzMX0.a7agmNDE0aQl9gCt6SMuZdbp-KKVSm7Balojc6mQXyE";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function main() {
    const email = `temp_tester_${Date.now()}@24efiling.com`;
    const password = `TestPass123!`;

    try {
        console.log(`Signing up temporary authenticated user: ${email}...`);
        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    name: 'Temp Tester',
                    role: 'Super Admin'
                }
            }
        });

        if (signUpError) {
            console.error("Sign up error:", signUpError.message);
            // Try to just sign in with an existing user if signup failed or is restricted
        }

        console.log(`Logging in as ${email}...`);
        const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
            email,
            password
        });

        if (signInError) throw signInError;
        console.log("Logged in successfully! Token:", signInData.session?.access_token ? "OK" : "NO");

        // Use the authenticated client to fetch cities
        console.log("--- CITIES ---");
        const { data: cities, error: errCities } = await supabase.from('cities').select('*');
        if (errCities) console.error(errCities);
        else console.log(cities);

        console.log("--- BRANCHES ---");
        const { data: branches, error: errBranches } = await supabase.from('branches').select('*');
        if (errBranches) console.error(errBranches);
        else console.log(branches);

        console.log("--- PROFILES ---");
        // Check if we can view profiles (only view own profile unless Super Admin, let's see)
        const { data: profiles, error: errProfiles } = await supabase.from('profiles').select('*');
        if (errProfiles) console.error(errProfiles);
        else console.log(profiles);

        // Clean up
        await supabase.auth.signOut();
    } catch (e) {
        console.error("Error executing script:", e);
    }
}

main();
