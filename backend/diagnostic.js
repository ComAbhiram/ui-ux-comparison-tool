// Railway deployment diagnostic script
import { createClient } from '@supabase/supabase-js';
import pkg from 'pg';
const { Pool } = pkg;

console.log('=== Railway Deployment Diagnostics ===');
console.log('Node.js version:', process.version);
console.log('Environment:', process.env.NODE_ENV);
console.log('Port:', process.env.PORT);

// Check required environment variables
const requiredEnvVars = [
  'DATABASE_URL',
  'SUPABASE_URL', 
  'SUPABASE_SERVICE_ROLE_KEY',
  'JWT_SECRET',
  'PORT',
  'FRONTEND_URL'
];

console.log('\n=== Environment Variables Check ===');
for (const envVar of requiredEnvVars) {
  const value = process.env[envVar];
  if (value) {
    console.log(`✓ ${envVar}: ${envVar === 'JWT_SECRET' || envVar === 'SUPABASE_SERVICE_ROLE_KEY' ? '[HIDDEN]' : value.substring(0, 50)}...`);
  } else {
    console.log(`✗ ${envVar}: MISSING`);
  }
}

// Test database connection
console.log('\n=== Database Connection Test ===');
try {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });
  
  const client = await pool.connect();
  console.log('✓ Database connection successful');
  
  const result = await client.query('SELECT NOW() as current_time');
  console.log('✓ Database query successful:', result.rows[0].current_time);
  
  client.release();
  await pool.end();
} catch (error) {
  console.log('✗ Database connection failed:', error.message);
}

// Test Supabase connection
console.log('\n=== Supabase Connection Test ===');
try {
  const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );
  
  const { data, error } = await supabase.from('users').select('count').limit(1);
  if (error) {
    console.log('✗ Supabase connection failed:', error.message);
  } else {
    console.log('✓ Supabase connection successful');
  }
} catch (error) {
  console.log('✗ Supabase connection failed:', error.message);
}

console.log('\n=== Diagnostics Complete ===');
process.exit(0);