// Simple script to create a test driver in the database
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Supabase URL or Key is missing. Please check your .env.local file.');
  process.exit(1);
}

console.log('Using Supabase URL:', supabaseUrl);

const supabase = createClient(supabaseUrl, supabaseKey);

async function createTestDriver() {
  try {
    console.log('Creating a test driver...');
    
    const testDriver = {
      company_id: 1, // Default company ID
      name: 'Test Driver',
      email: 'testdriver@example.com',
      phone: '555-123-4567',
      license: 'DL12345678',
      status: 'active',
      type: 'company',
      employment_type: 'W2',
      join_date: new Date().toISOString().split('T')[0],
      pay_rate: 0.55,
      pay_rate_type: 'per_mile',
      tax_withholding_percent: 15,
      has_benefits: true
    };
    
    const { data, error } = await supabase
      .from('drivers')
      .insert([testDriver])
      .select();
    
    if (error) {
      console.error('Error creating test driver:', error);
      return;
    }
    
    console.log('Test driver created successfully:', data[0]);
  } catch (err) {
    console.error('Unexpected error:', err);
  }
}

createTestDriver();
