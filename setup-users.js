// Direct user creation in Supabase with correct password
const { createClient } = require('@supabase/supabase-js');
const bcrypt = require('bcrypt');

// Use these in Railway deployment
const supabaseUrl = 'https://gybzidbnkccnjcctczwf.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd5YnppZGJua2NjbmpjY3RjendmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MzQ1ODk3NywiZXhwIjoyMDc5MDM0OTc3fQ.N2rLX3q24OaTv5DQM2THlrp_vOoBjZ4zP5n4i_zt7YA';

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function createTestUsers() {
  try {
    console.log('Creating test users...');
    
    const adminPassword = await bcrypt.hash('admin123', 10);
    const testPassword = await bcrypt.hash('test123', 10);
    
    const usersToCreate = [
      {
        id: 'user-admin-' + Date.now(),
        name: 'Admin User',
        email: 'admin@example.com',
        password: adminPassword,
        role: 'Admin',
        status: 'Active',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Admin',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: 'user-test-' + (Date.now() + 1),
        name: 'Test User',
        email: 'test@example.com',
        password: testPassword,
        role: 'Developer',
        status: 'Active',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Test',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    ];
    
    const { data, error } = await supabase
      .from('users')
      .insert(usersToCreate)
      .select();
    
    if (error) {
      console.error('Error creating users:', error);
    } else {
      console.log('✅ Users created successfully:');
      data.forEach(user => {
        console.log(`   - ${user.name} (${user.email})`);
      });
      console.log('\n📝 Login credentials:');
      console.log('   Admin: admin@example.com / admin123');
      console.log('   Test:  test@example.com / test123');
    }
  } catch (err) {
    console.error('Exception:', err.message);
  }
}

if (require.main === module) {
  createTestUsers();
}

module.exports = { createTestUsers };