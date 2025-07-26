// Test database connection and tables
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://bauubgvserrebuvwcxil.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJhdXViZ3ZzZXJyZWJ1dndjeGlsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM1MjEyNTMsImV4cCI6MjA2OTA5NzI1M30.waUuWa1Wj7kyyvYXJ63_y1uIA4GA5SSpqyTTWUfN6Jo';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testDatabase() {
  console.log('🔍 Testing database setup...\n');
  
  // Test each table
  const tables = ['profiles', 'projects', 'audit_results', 'payments'];
  
  for (const table of tables) {
    try {
      const { data, error } = await supabase
        .from(table)
        .select('*')
        .limit(1);
      
      if (error) {
        console.log(`❌ ${table}: ${error.message}`);
      } else {
        console.log(`✅ ${table}: Table exists and accessible`);
      }
    } catch (err) {
      console.log(`❌ ${table}: ${err.message}`);
    }
  }
  
  console.log('\n🎉 Database setup test complete!');
}

testDatabase();
