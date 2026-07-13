const fs = require('fs');

const path = 'e:\\24efiling-crm\\lib\\supabaseClient.ts';
let content = fs.readFileSync(path, 'utf8');

// Insert cities table before activities
if (!content.includes('cities: {')) {
  const citiesTable = `
      cities: {
        Row: {
          id: string
          city_name: string
          city_code: string
          state: string | null
          status: boolean
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          city_name: string
          city_code: string
          state?: string | null
          status?: boolean
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          city_name?: string
          city_code?: string
          state?: string | null
          status?: boolean
          created_at?: string | null
          updated_at?: string | null
        }
      }`;
  content = content.replace('activities: {', citiesTable + '\n      activities: {');
}

// Add city_id and city_name to specific tables
const tablesToUpdate = ['branches', 'profiles', 'leads', 'customers'];

tablesToUpdate.forEach(table => {
  const regexRow = new RegExp(`(${table}: \\{[\\s\\S]*?Row: \\{[\\s\\S]*?)(is_active:.*?|role:.*?|status:.*?)(\\n)`, 'g');
  content = content.replace(regexRow, '$1$2$3          city_id: string | null\n          city_name: string | null\n');

  const regexInsert = new RegExp(`(${table}: \\{[\\s\\S]*?Insert: \\{[\\s\\S]*?)(is_active\\?:.*?|role\\?:.*?|status\\?:.*?)(\\n)`, 'g');
  content = content.replace(regexInsert, '$1$2$3          city_id?: string | null\n          city_name?: string | null\n');

  const regexUpdate = new RegExp(`(${table}: \\{[\\s\\S]*?Update: \\{[\\s\\S]*?)(is_active\\?:.*?|role\\?:.*?|status\\?:.*?)(\\n)`, 'g');
  content = content.replace(regexUpdate, '$1$2$3          city_id?: string | null\n          city_name?: string | null\n');
});

fs.writeFileSync(path, content);
console.log('Updated supabaseClient.ts');
