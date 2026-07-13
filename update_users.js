import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://jblhzdtqrhfeawycecql.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpibGh6ZHRxcmhmZWF3eWNlY3FsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIwNzQzMzEsImV4cCI6MjA3NzY1MDMzMX0.a7agmNDE0aQl9gCt6SMuZdbp-KKVSm7Balojc6mQXyE";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function run() {
  try {
    const { data: cities, error: cErr } = await supabase.from('cities').select('*');
    if (cErr) throw cErr;
    console.log("Cities:", cities);
    
    const { data: branches, error: bErr } = await supabase.from('branches').select('*');
    if (bErr) throw bErr;
    console.log("Branches:", branches);
    
    const city = cities.find(c => c.city_name.toLowerCase().includes('hyderabad'));
    if (!city) throw new Error("City not found");
    const city_id = city.id;
    
    const branch = branches.find(b => b.city_id === city_id && b.name.toLowerCase().includes('lb nagar'));
    if (!branch) throw new Error("Branch not found");
    const branch_id = branch.id;

    // Find all users except Jhansi
    const { data: users, error: uErr } = await supabase.from('profiles').select('*').neq('name', 'Jhansi');
    if (uErr) throw uErr;
    
    console.log(`Found ${users.length} users. Target branch: ${branch_id}`);
    
    for (const user of users) {
       const { error: updErr } = await supabase.from('profiles').update({ city_name: 'Hyderabad', branch_id: branch_id }).eq('id', user.id);
       if (updErr) console.error("Error updating user", user.name, updErr);
    }
    console.log("Successfully updated past users to LB Nagar branch!");
  } catch (err) {
    console.error(err);
  }
}
run();
