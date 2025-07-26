import { supabase } from '../lib/supabase';

export interface GitHubUser {
  id: number;
  login: string;
  name: string;
  email: string;
  avatar_url: string;
}

export interface GitHubRepo {
  id: number;
  name: string;
  full_name: string;
  description: string;
  html_url: string;
  language: string;
  private: boolean;
  updated_at: string;
}

export class GitHubAuthService {
  /**
   * Initiate GitHub OAuth flow
   * This will open a popup window for GitHub authentication
   */
  static async signInWithGitHub(): Promise<{ success: boolean; user?: any; error?: string }> {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'github',
        options: {
          scopes: 'read:user user:email',
          redirectTo: `${window.location.origin}/auth/callback?source=github`
        }
      });

      if (error) {
        console.error('GitHub OAuth error:', error);
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (err: any) {
      console.error('GitHub OAuth failed:', err);
      return { success: false, error: err.message || 'GitHub authentication failed' };
    }
  }

  /**
   * Get GitHub user repositories
   */
  static async getUserRepositories(accessToken: string): Promise<GitHubRepo[]> {
    try {
      const response = await fetch('https://api.github.com/user/repos?sort=updated&per_page=50', {
        headers: {
          'Authorization': `token ${accessToken}`,
          'Accept': 'application/vnd.github.v3+json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch repositories');
      }

      const repos = await response.json();
      return repos.map((repo: any) => ({
        id: repo.id,
        name: repo.name,
        full_name: repo.full_name,
        description: repo.description,
        html_url: repo.html_url,
        language: repo.language,
        private: repo.private,
        updated_at: repo.updated_at
      }));
    } catch (error) {
      console.error('Error fetching repositories:', error);
      return [];
    }
  }

  /**
   * Get GitHub user profile
   */
  static async getUserProfile(accessToken: string): Promise<GitHubUser | null> {
    try {
      const response = await fetch('https://api.github.com/user', {
        headers: {
          'Authorization': `token ${accessToken}`,
          'Accept': 'application/vnd.github.v3+json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch user profile');
      }

      const user = await response.json();
      return {
        id: user.id,
        login: user.login,
        name: user.name,
        email: user.email,
        avatar_url: user.avatar_url
      };
    } catch (error) {
      console.error('Error fetching user profile:', error);
      return null;
    }
  }

  /**
   * Check if current user has GitHub connected
   */
  static async isGitHubConnected(): Promise<boolean> {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      return session?.user?.app_metadata?.provider === 'github';
    } catch (error) {
      console.error('Error checking GitHub connection:', error);
      return false;
    }
  }
}
