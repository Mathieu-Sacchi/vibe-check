export interface User {
  id: string;
  email: string;
  created_at: string;
}

export interface Project {
  id: string;
  user_id: string;
  name: string;
  github_url: string;
  description?: string;
  created_at: string;
}

export interface AuditResult {
  id: string;
  project_id: string;
  audit_type: 'security' | 'quality' | 'best-practices' | 'ai' | 'compliance' | 'speed' | 'seo';
  issues_count: number;
  details: any;
  fixes: string;
  is_paid: boolean;
  created_at: string;
}

export interface Payment {
  id: string;
  user_id: string;
  project_id: string;
  amount: number;
  status: 'pending' | 'completed' | 'failed';
  stripe_session_id: string;
  created_at: string;
}

export interface AuthContextType {
  user: User | null;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  loading: boolean;
}