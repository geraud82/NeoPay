// Simple script to check if the Supabase URL is valid
const https = require('https');
require('dotenv').config({ path: '.env.local' });

// Try the other Supabase URL from .env.local.example
const supabaseUrl = 'https://zqyldrmmrenwpbazwavf.supabase.co';
if (!supabaseUrl) {
  console.error('Supabase URL is missing. Please check your .env.local file.');
  process.exit(1);
}

console.log('Checking Supabase URL:', supabaseUrl);

// Extract the hostname from the URL
const url = new URL(supabaseUrl);
const hostname = url.hostname;

console.log('Hostname:', hostname);

// Make a simple HTTP request to check if the hostname is valid
const req = https.get(`https://${hostname}`, (res) => {
  console.log('Status code:', res.statusCode);
  console.log('Headers:', res.headers);
  
  res.on('data', (chunk) => {
    console.log('Response data:', chunk.toString());
  });
  
  res.on('end', () => {
    console.log('Response ended');
  });
});

req.on('error', (error) => {
  console.error('Error making request:', error.message);
});

req.end();
