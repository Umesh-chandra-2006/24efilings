import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://jblhzdtqrhfeawycecql.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpibGh6ZHRxcmhmZWF3eWNlY3FsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIwNzQzMzEsImV4cCI6MjA3NzY1MDMzMX0.a7agmNDE0aQl9gCt6SMuZdbp-KKVSm7Balojc6mQXyE";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function main() {
    try {
        console.log("--- CITIES ---");
        const { data: cities, error: errCities } = await supabase.from('cities').select('*');
        if (errCities) console.error(errCities);
        else console.log(cities);

        console.log("--- BRANCHES ---");
        const { data: branches, error: errBranches } = await supabase.from('branches').select('*');
        if (errBranches) console.error(errBranches);
        else console.log(branches);

        console.log("--- USERS (PROFILES) WITH AMEERPET OR HYDERABAD ---");
        const { data: profiles, error: errProfiles } = await supabase.from('profiles').select('id, email, name, role, city_name, branch_name, branch_id, city_id');
        if (errProfiles) console.error(errProfiles);
        else console.log(profiles);
    } catch (e) {
        console.error(e);
    }
}
main();
