import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Code, LogOut, User } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../ui/Button';

export const Header: React.FC = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <header className="border-b border-gray-200 bg-white">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-2">
            <Code className="h-8 w-8" />
            <span className="text-2xl font-bold">VibeCheckr</span>
          </Link>

          <nav className="flex items-center space-x-6">
            {user ? (
              <>
                <Link to="/profile" className="text-gray-700 hover:text-black transition-colors flex items-center space-x-1">
                  <User className="h-4 w-4" />
                  <span>Profile</span>
                </Link>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleSignOut}
                  className="flex items-center space-x-1"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Sign Out</span>
                </Button>
              </>
            ) : (
              <div className="flex items-center space-x-4">
                <Link
                  to="/signin"
                  className="text-gray-700 hover:text-black transition-colors"
                >
                  Sign In
                </Link>
              </div>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
};