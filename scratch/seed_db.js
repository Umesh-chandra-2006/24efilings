import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://jblhzdtqrhfeawycecql.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpibGh6ZHRxcmhmZWF3eWNlY3FsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIwNzQzMzEsImV4cCI6MjA3NzY1MDMzMX0.a7agmNDE0aQl9gCt6SMuZdbp-KKVSm7Balojc6mQXyE";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const SERVICES_DATA = [
  {
    name: 'STARTUP',
    sub_services: [
      { name: 'Partnership Firm', price: 1999 },
      { name: 'Proprietorship Firm', price: 999 },
      { name: 'Public Limited Company', price: 14999 },
      { name: 'Private Limited Company', price: 5999 },
      { name: 'OPC, One Person Company', price: 4999 },
      { name: 'LLP, Limited Liability Partnership', price: 3999 },
      { name: 'Trust Registration', price: 7999 },
      { name: 'Indian Subsidiary', price: 19999 },
      { name: 'Producer Company', price: 12999 },
      { name: 'Section 8 Company', price: 9999 }
    ]
  },
  {
    name: 'Licenses & Registrations',
    sub_services: [
      { name: 'Startup India', price: 2999 },
      { name: 'Drug License', price: 11999 },
      { name: 'Trade License', price: 1999 },
      { name: 'FSSAI License', price: 2999 },
      { name: 'Fire License', price: 4999 },
      { name: 'PF Registration', price: 1499 },
      { name: 'ESI Registration', price: 1499 },
      { name: 'TAN Registration', price: 499 },
      { name: 'PAN Registration', price: 199 },
      { name: '12A Registration', price: 4999 },
      { name: '80G Registration', price: 4999 },
      { name: 'ISO Registration', price: 2999 },
      { name: 'Digital Signature', price: 999 },
      { name: 'Darpan Registration', price: 2499 },
      { name: 'Barcode Registration', price: 4999 },
      { name: 'Udyam Registration', price: 499 },
      { name: 'Shop Act Registration', price: 999 },
      { name: 'IEC (Import Export Code)', price: 1499 },
      { name: 'Halal License & Certification', price: 7999 },
      { name: 'Professional Tax Registration', price: 1499 }
    ]
  },
  {
    name: 'IP & TRADEMARK',
    sub_services: [
      { name: 'Trademark Registration', price: 1999 },
      { name: 'Trademark Objection', price: 2999 },
      { name: 'Trademark Renewal', price: 4999 },
      { name: 'TRADEMARK HIRING', price: 999 },
      { name: 'Copyright Registration', price: 4999 },
      { name: 'Patent Registration', price: 19999 },
      { name: 'Design Registration', price: 5999 },
      { name: 'Logo Design', price: 1499 }
    ]
  },
  {
    name: 'GST Registrations',
    sub_services: [
      { name: 'GST Registration', price: 499 },
      { name: 'GST Return Filing', price: 299 },
      { name: 'GST LUT Form', price: 499 },
      { name: 'GST Revocation', price: 1499 },
      { name: 'GST Notice', price: 999 },
      { name: 'GST Amendment', price: 499 },
      { name: 'GST Cancellation', price: 499 }
    ]
  },
  {
    name: 'Income Registrations',
    sub_services: [
      { name: 'Income Tax E-Filing', price: 499 },
      { name: 'ITR-1 Return Filing', price: 499 },
      { name: 'ITR-2 Return Filing', price: 999 },
      { name: 'ITR-3 Return Filing', price: 1999 },
      { name: 'ITR-4 Return Filing', price: 1499 },
      { name: 'ITR-5 Return Filing', price: 2499 },
      { name: 'ITR-6 Return Filing', price: 4999 },
      { name: 'ITR-7 Return Filing', price: 4999 },
      { name: '15CA - 15CB Filing', price: 2499 },
      { name: 'TDS Return Filing', price: 999 },
      { name: 'Income Tax Notice', price: 1499 }
    ]
  },
  {
    name: 'MCA Compliances',
    sub_services: [
      { name: 'Demat of Shares', price: 2999 },
      { name: 'LLP Compliance', price: 3999 },
      { name: 'OPC Compliance', price: 3999 },
      { name: 'Company Compliance', price: 7999 },
      { name: 'Proprietorship to Pvt Ltd Company', price: 6999 },
      { name: 'Convert Partnership into LLP Company', price: 5999 },
      { name: 'Convert Private into Public Limited Company', price: 12999 },
      { name: 'Convert Private into OPC Company', price: 4999 },
      { name: 'Winding Up - LLP', price: 7999 },
      { name: 'Winding Up - Company', price: 14999 },
      { name: 'ADT-1 Filing', price: 999 },
      { name: 'DPT-3 Filing', price: 1499 },
      { name: 'LLP Form 11 Filing', price: 999 },
      { name: 'Dormant Status Filing', price: 2999 },
      { name: 'Annual Compliance Services', price: 9999 }
    ]
  },
  {
    name: 'Legal Services',
    sub_services: [
      { name: 'Lawyers Specialization', price: 0 },
      { name: 'Finance Lawyers', price: 0 },
      { name: 'Cheque Bounce Lawyers', price: 0 },
      { name: 'Civil Lawyers', price: 0 },
      { name: 'Consumer Protection Lawyers', price: 0 },
      { name: 'Contract Lawyers', price: 0 },
      { name: 'Corporate Lawyers', price: 0 },
      { name: 'Criminal Lawyers', price: 0 },
      { name: 'Cyber Crime Lawyers', price: 0 },
      { name: 'Property Lawyers', price: 0 },
      { name: 'Divorce Lawyers', price: 0 },
      { name: 'Family Lawyers', price: 0 },
      { name: 'GST Lawyers', price: 0 },
      { name: 'Intellectual Property Lawyers', price: 0 },
      { name: 'Labour Lawyers', price: 0 },
      { name: 'Money Recovery Lawyers', price: 0 },
      { name: 'Motor Accident Lawyers', price: 0 },
      { name: 'Muslim Law Lawyers', price: 0 }
    ]
  },
  {
    name: 'Legal Documents',
    sub_services: [
      { name: 'Free Legal Documents', price: 0 },
      { name: 'All Legal Documents', price: 0 },
      { name: 'Rental Agreement', price: 299 },
      { name: 'Commercial Rental Agreement', price: 999 },
      { name: 'Experience Letter', price: 199 },
      { name: 'Appointment Letter', price: 299 },
      { name: 'Affidavit Format', price: 99 },
      { name: 'Power Of Attorney', price: 499 },
      { name: 'Income Certificate', price: 199 },
      { name: 'No Objection Certificate', price: 199 },
      { name: 'Salary Slip', price: 99 },
      { name: 'Resignation Letter', price: 99 },
      { name: 'Legal Heir Certificate', price: 999 },
      { name: 'Relieving Letter', price: 99 },
      { name: 'Bonafide Certificate', price: 99 },
      { name: 'Partnership Deed', price: 999 },
      { name: 'GST Invoice', price: 99 },
      { name: 'Authorised Signatory In GST', price: 199 },
      { name: 'Delivery Challan', price: 99 },
      { name: 'Offer Letter', price: 199 },
      { name: 'Consent Letter For GST Registration', price: 199 },
      { name: 'Rent Receipt', price: 99 }
    ]
  },
  {
    name: 'Company Changes',
    sub_services: [
      { name: 'Director Change', price: 1999 },
      { name: 'Remove Director', price: 1999 },
      { name: 'MOA Amendment', price: 2999 },
      { name: 'AOA Amendment', price: 2999 },
      { name: 'Share Transfer', price: 2499 },
      { name: 'DIN eKYC Filing', price: 499 },
      { name: 'DIN Reactivation', price: 1999 },
      { name: 'Name Change - Company', price: 4999 },
      { name: 'Registered Office Change', price: 2999 },
      { name: 'Commencement (INC-2A)', price: 999 },
      { name: 'Authorized Capital Increase', price: 3999 }
    ]
  }
];

async function main() {
  const email = `seeder_${Date.now()}@24efiling.com`;
  const password = `SeederPass123!`;

  try {
    console.log(`Creating seeder user: ${email}...`);
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name: 'DB Seeder',
          role: 'Super Admin'
        }
      }
    });

    if (signUpError) {
      throw signUpError;
    }

    const user = signUpData.user;
    if (!user) throw new Error("Sign up succeeded but no user returned");

    console.log(`User created. Logging in...`);
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (signInError) throw signInError;
    console.log(`Logged in successfully! Promoting profile role to Super Admin...`);

    const { error: updateError } = await supabase
      .from('profiles')
      .update({ role: 'Super Admin' })
      .eq('id', user.id);

    if (updateError) throw updateError;
    console.log(`Promoted to Super Admin. Seeding services...`);

    for (const service of SERVICES_DATA) {
      console.log(`Seeding service: ${service.name}...`);
      const { data: sData, error: sError } = await supabase
        .from('services')
        .insert({ name: service.name, is_active: true })
        .select()
        .single();

      if (sError) {
        console.error(`Error inserting service ${service.name}:`, sError.message);
        continue;
      }

      const serviceId = sData.id;
      const subServicesToInsert = service.sub_services.map(sub => ({
        service_id: serviceId,
        name: sub.name,
        price: sub.price,
        is_active: true,
        required_documents: []
      }));

      const { error: subError } = await supabase
        .from('sub_services')
        .insert(subServicesToInsert);

      if (subError) {
        console.error(`Error inserting subservices for ${service.name}:`, subError.message);
      } else {
        console.log(`Successfully seeded subservices for ${service.name}`);
      }
    }

    console.log("Seeding complete! Cleaning up session...");
    await supabase.auth.signOut();
    console.log("All done!");

  } catch (e) {
    console.error("Seeding failed:", e);
  }
}

main();
