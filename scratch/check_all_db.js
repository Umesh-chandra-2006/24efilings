import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://jblhzdtqrhfeawycecql.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpibGh6ZHRxcmhmZWF3eWNlY3FsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIwNzQzMzEsImV4cCI6MjA3NzY1MDMzMX0.a7agmNDE0aQl9gCt6SMuZdbp-KKVSm7Balojc6mQXyE";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function main() {
    try {
        const tables = ['profiles', 'leads', 'customers', 'services', 'sub_services', 'notifications', 'user_activities', 'tasks'];
        for (const table of tables) {
            const { data, error, count } = await supabase.from(table).select('*', { count: 'exact' });
            if (error) {
                console.error(`Error fetching ${table}:`, error.message);
            } else {
                console.log(`Table ${table} has ${count} records. Sample:`, data.slice(0, 1));
            }
        }
    } catch (e) {
        console.error("Error running script:", e);
    }
}

main();
