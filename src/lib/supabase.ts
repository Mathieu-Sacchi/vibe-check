import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://bauubgvserrebuvwcxil.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJhdXViZ3ZzZXJyZWJ1dndjeGlsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM1MjEyNTMsImV4cCI6MjA2OTA5NzI1M30.waUuWa1Wj7kyyvYXJ63_y1uIA4GA5SSpqyTTWUfN6Jo';

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

// Create Supabase client (will work with placeholders for development)
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    flowType: 'pkce'
  }
});

// Export a flag to check if Supabase is properly configured
export const isSupabaseConfigured = true;