-- Disable email confirmation for development
-- Run this in your Supabase SQL Editor

-- This allows users to sign up and be immediately logged in without email confirmation
-- Note: This is for development only. In production, you should enable email confirmation for security.

-- Update auth settings to disable email confirmation
UPDATE auth.config 
SET email_confirm = false 
WHERE id = 1;

-- Alternative approach: You can also do this in the Supabase dashboard:
-- Go to Authentication > Settings > Email
-- Uncheck "Enable email confirmations"
