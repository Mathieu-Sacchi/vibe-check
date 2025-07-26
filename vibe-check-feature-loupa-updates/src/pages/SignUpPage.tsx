import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Code, Github, Upload } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card } from '../components/ui/Card';

export const SignUpPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { signUp, user, loading } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const source = searchParams.get('source');

  // Get dynamic content based on source
  const getSourceContent = () => {
    switch (source) {
      case 'github':
        return {
          icon: <Github className="h-8 w-8" />,
          title: 'Connect your GitHub account',
          subtitle: 'Create an account to analyze your GitHub repositories'
        };
      case 'upload':
        return {
          icon: <Upload className="h-8 w-8" />,
          title: 'Upload your code files',
          subtitle: 'Create an account to upload and analyze your code'
        };
      default:
        return {
          icon: <Code className="h-8 w-8" />,
          title: 'Create your account',
          subtitle: 'Start analyzing your code today'
        };
    }
  };

  const sourceContent = getSourceContent();

  // Redirect if user is already authenticated
  useEffect(() => {
    if (!loading && user) {
      navigate('/audit');
    }
  }, [user, loading, navigate]);

  const isValidEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!isValidEmail(email)) {
      setError('Please enter a valid email address');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setIsSubmitting(true);

    try {
      await signUp(email, password);
      setError('');
      
      // Wait a moment for auth state to update
      setTimeout(() => {
        // Check if user is now logged in (no email confirmation required)
        const checkAuthAndRedirect = async () => {
          const { data: { session } } = await supabase.auth.getSession();
          if (session?.user) {
            // User is logged in, redirect to audit page
            navigate('/audit');
          } else {
            // Email confirmation required
            alert('Account created successfully! Please check your email for confirmation, then you can sign in.');
            navigate('/signin');
          }
        };
        checkAuthAndRedirect();
      }, 1000);
      
    } catch (err: any) {
      console.error('Signup error:', err);
      if (err.message.includes('Supabase email configuration')) {
        setError('Authentication service configuration issue. Please contact support or try again later.');
      } else {
        setError(err.message || 'Failed to create account');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-6">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <Link to="/" className="flex items-center justify-center space-x-2 mb-6">
            <Code className="h-8 w-8" />
            <span className="text-2xl font-bold">VibeCheckr</span>
          </Link>
          <div className="flex justify-center mb-4">
            {sourceContent.icon}
          </div>
          <h2 className="text-3xl font-bold">{sourceContent.title}</h2>
          <p className="text-gray-600 mt-2">{sourceContent.subtitle}</p>
        </div>

        <Card>
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                {error}
              </div>
            )}

            <Input
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="Enter your email"
            />

            <Input
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="Create a password"
            />

            <Input
              label="Confirm Password"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              placeholder="Confirm your password"
            />

            <Button 
              type="submit" 
              className="w-full"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Creating Account...' : 'Create Account'}
            </Button>
          </form>

          <div className="mt-6 text-center space-y-4">
            {source === 'upload' && (
              <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded-lg text-sm">
                💡 <strong>Tip:</strong> You can also{' '}
                <Link to="/" className="underline font-semibold">
                  connect your GitHub account
                </Link>{' '}
                for instant access without creating a password.
              </div>
            )}
            <p className="text-gray-600">
              Already have an account?{' '}
              <Link to="/signin" className="text-black font-semibold hover:underline">
                Sign in
              </Link>
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
};