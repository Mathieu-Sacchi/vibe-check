import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Code, CheckCircle, AlertCircle, Loader } from 'lucide-react';
import { Card } from '../components/ui/Card';

export const AuthCallbackPage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const source = searchParams.get('source');

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // Wait a moment for Supabase to process OAuth callback
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Get the current session
        const { data, error } = await supabase.auth.getSession();
        
        console.log('Callback - Session data:', data);
        console.log('Callback - Error:', error);
        console.log('Callback - URL:', window.location.href);
        
        if (error) {
          console.error('Auth callback error:', error);
          setError(error.message);
          setLoading(false);
          return;
        }

        if (data.session?.user) {
          console.log('Callback - User found:', data.session.user);
          setSuccess(true);
          setLoading(false);
          
          // Wait a moment to show success, then redirect
          setTimeout(() => {
            if (source === 'github') {
              // GitHub OAuth users are fully authenticated - go directly to audit page
              navigate('/audit');
            } else {
              // For other OAuth sources (if any), also go to audit page
              navigate('/audit');
            }
          }, 1500);
        } else {
          // No session - OAuth failed or was cancelled
          if (source === 'github') {
            // For GitHub OAuth, redirect back to landing page with error
            setError('GitHub authentication was cancelled or failed');
            setLoading(false);
            setTimeout(() => {
              navigate('/');
            }, 3000);
          } else {
            // For other cases, redirect to signup
            navigate('/signup?source=' + (source || 'oauth'));
          }
        }
      } catch (err: any) {
        console.error('Callback handling error:', err);
        setError(err.message || 'Authentication failed');
        setLoading(false);
      }
    };

    handleAuthCallback();
  }, [navigate, source]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="text-center p-8 max-w-md">
          <div className="flex justify-center mb-4">
            <Code className="h-12 w-12 text-black" />
          </div>
          <h2 className="text-2xl font-bold mb-4">VibeCheckr</h2>
          <div className="flex justify-center mb-4">
            <Loader className="h-8 w-8 animate-spin text-gray-600" />
          </div>
          <p className="text-gray-600">Completing authentication...</p>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="text-center p-8 max-w-md">
          <div className="flex justify-center mb-4">
            <AlertCircle className="h-12 w-12 text-red-500" />
          </div>
          <h2 className="text-2xl font-bold mb-4">Authentication Failed</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => navigate('/')}
            className="bg-black text-white px-6 py-2 rounded-lg hover:bg-gray-800 transition-colors"
          >
            Back to Home
          </button>
        </Card>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="text-center p-8 max-w-md">
          <div className="flex justify-center mb-4">
            <CheckCircle className="h-12 w-12 text-green-500" />
          </div>
          <h2 className="text-2xl font-bold mb-4">Welcome to VibeCheckr!</h2>
          <p className="text-gray-600">
            {source === 'github' 
              ? 'GitHub connected successfully. Taking you to your dashboard...'
              : 'Authentication successful. Redirecting to your dashboard...'
            }
          </p>
        </Card>
      </div>
    );
  }

  return null;
};
