# GitHub OAuth Setup for VibeCheckr

## 1. Create GitHub OAuth App

1. Go to GitHub Settings > Developer settings > OAuth Apps
2. Click "New OAuth App"
3. Fill in:
   - **Application name**: VibeCheckr
   - **Homepage URL**: http://localhost:5173 (for development)
   - **Authorization callback URL**: https://bauubgvserrebuvwcxil.supabase.co/auth/v1/callback
4. Click "Register application"
5. Copy the **Client ID** and **Client Secret**

## 2. Configure Supabase GitHub Provider

1. Go to Supabase Dashboard > Authentication > Providers
2. Find "GitHub" and click to configure
3. Enable GitHub provider
4. Enter your GitHub Client ID and Client Secret
5. Add scopes: `user:email,read:user,repo` (to read user info and repositories)
6. Save configuration

## 3. Update Site URL

1. Go to Authentication > Settings
2. Set Site URL to: `http://localhost:5173`
3. Add redirect URLs:
   - `http://localhost:5173`
   - `http://localhost:5173/auth/callback`

## 4. Test OAuth Flow

After setup, the GitHub OAuth will work with the code I'm implementing.

## GitHub App Permissions Needed

For repository access, we need:
- `user:email` - Get user email
- `read:user` - Get user profile
- `repo` - Access to repositories (for analysis)

## Production Setup

For production, update:
- Homepage URL: https://yourdomain.com
- Callback URL: https://bauubgvserrebuvwcxil.supabase.co/auth/v1/callback
- Site URL: https://yourdomain.com
