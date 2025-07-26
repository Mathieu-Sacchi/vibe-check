// Database setup script for VibeCheckr
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://bauubgvserrebuvwcxil.supabase.co';
const supabaseServiceKey = 'your-service-role-key'; // We'll need this for admin operations
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJhdXViZ3ZzZXJyZWJ1dndjeGlsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM1MjEyNTMsImV4cCI6MjA2OTA5NzI1M30.waUuWa1Wj7kyyvYXJ63_y1uIA4GA5SSpqyTTWUfN6Jo';

// Create Supabase client for testing
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Test connection
async function testConnection() {
  try {
    const { data, error } = await supabase.from('profiles').select('count');
    if (error) {
      console.log('Tables not yet created, this is expected:', error.message);
    } else {
      console.log('✅ Database connection successful');
    }
  } catch (err) {
    console.error('❌ Connection failed:', err.message);
  }
}

// Run the test
testConnection();
