// Test authentication flow
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://bauubgvserrebuvwcxil.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJhdXViZ3ZzZXJyZWJ1dndjeGlsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM1MjEyNTMsImV4cCI6MjA2OTA5NzI1M30.waUuWa1Wj7kyyvYXJ63_y1uIA4GA5SSpqyTTWUfN6Jo';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testAuth() {
  console.log('🔐 Testing authentication setup...\n');
  
  try {
    // Test if we can get current session (should be null)
    const { data: session, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) {
      console.log('❌ Session error:', sessionError.message);
    } else {
      console.log('✅ Auth service is working');
      console.log('📝 Current session:', session.session ? 'Logged in' : 'Not logged in');
    }
    
    // Test sign up (with a test email - this will fail but shows if auth is configured)
    console.log('\n🧪 Testing sign up capability...');
    const { data, error } = await supabase.auth.signUp({
      email: 'test@example.com',
      password: 'testpassword123'
    });
    
    if (error) {
      if (error.message.includes('email_address_invalid') || error.message.includes('email')) {
        console.log('⚠️  Email auth needs configuration in Supabase dashboard');
        console.log('   Go to Authentication > Settings > Email');
      } else {
        console.log('ℹ️  Auth response:', error.message);
      }
    } else {
      console.log('✅ Sign up test successful');
    }
    
  } catch (err) {
    console.log('❌ Auth test failed:', err.message);
  }
  
  console.log('\n🎉 Authentication test complete!');
}

testAuth();
