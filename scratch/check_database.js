
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://jblhzdtqrhfeawycecql.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpibGh6ZHRxcmhmZWF3eWNlY3FsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIwNzQzMzEsImV4cCI6MjA3NzY1MDMzMX0.a7agmNDE0aQl9gCt6SMuZdbp-KKVSm7Balojc6mQXyE";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function check() {
  console.log("--- Diagnostic Check ---");
  const { data: leads, error: lError } = await supabase.from('leads').select('id');
  if (lError) {
    console.log("Leads Query Error:", lError.message);
  } else {
    console.log("Leads found (via Anon):", leads ? leads.length : 0);
  }

  const { data: customers, error: cError } = await supabase.from('customers').select('id');
  if (cError) {
    console.log("Customers Query Error:", cError.message);
  } else {
    console.log("Customers found (via Anon):", customers ? customers.length : 0);
  }
}

check();
