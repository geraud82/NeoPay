// Simple script to check if there are any drivers in the database
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Supabase URL or Key is missing. Please check your .env.local file.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkDrivers() {
  try {
    console.log('Checking for drivers in the database...');
    console.log('Using Supabase URL:', supabaseUrl);
    
    const { data, error } = await supabase
      .from('drivers')
      .select('*');
    
    if (error) {
      console.error('Error fetching drivers:', error);
      return;
    }
    
    console.log('Number of drivers found:', data.length);
    if (data.length > 0) {
      console.log('First driver:', data[0]);
    } else {
      console.log('No drivers found in the database.');
    }
  } catch (err) {
    console.error('Unexpected error:', err);
  }
}

checkDrivers();
