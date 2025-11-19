import dotenv from 'dotenv';
import { testConnection } from './supabase.js';

dotenv.config();

const testDatabaseConnection = async () => {
  console.log('🔍 Testing database connection...');
  console.log('📋 Configuration:');
  console.log(`   Host: ${process.env.DB_HOST || 'Not set'}`);
  console.log(`   Port: ${process.env.DB_PORT || 'Not set'}`);
  console.log(`   Database: ${process.env.DB_NAME || 'Not set'}`);
  console.log(`   User: ${process.env.DB_USER || 'Not set'}`);
  console.log(`   Password: ${process.env.DB_PASSWORD ? '***' : 'Not set'}`);
  console.log(`   Supabase URL: ${process.env.SUPABASE_URL || 'Not set'}`);
  console.log(`   Supabase Key: ${process.env.SUPABASE_ANON_KEY ? '***' : 'Not set'}`);
  console.log('');
  
  const success = await testConnection();
  
  if (success) {
    console.log('🎉 Database connection test passed!');
    console.log('✅ Your Supabase configuration is working correctly.');
  } else {
    console.log('❌ Database connection test failed!');
    console.log('💡 Please check your .env file and Supabase configuration.');
    console.log('📖 Refer to SUPABASE_SETUP.md for detailed instructions.');
  }
  
  process.exit(success ? 0 : 1);
};

testDatabaseConnection();