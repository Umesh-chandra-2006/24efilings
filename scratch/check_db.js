import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://jblhzdtqrhfeawycecql.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpibGh6ZHRxcmhmZWF3eWNlY3FsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIwNzQzMzEsImV4cCI6MjA3NzY1MDMzMX0.a7agmNDE0aQl9gCt6SMuZdbp-KKVSm7Balojc6mQXyE";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function main() {
    try {
        console.log("Checking services...");
        const { data: services, error: servicesErr } = await supabase.from('services').select('*');
        if (servicesErr) {
            console.error("Error fetching services:", servicesErr);
        } else {
            console.log(`Found ${services?.length || 0} services:`, services);
        }

        console.log("Checking sub_services...");
        const { data: subServices, error: subServicesErr } = await supabase.from('sub_services').select('*');
        if (subServicesErr) {
            console.error("Error fetching sub_services:", subServicesErr);
        } else {
            console.log(`Found ${subServices?.length || 0} sub_services:`, subServices);
        }
    } catch (e) {
        console.error("Error running script:", e);
    }
}

main();
