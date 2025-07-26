import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { RepositorySelector } from '../components/RepositorySelector';
import { GitHubRepo } from '../services/githubAuth';

export const RepositorySelectionPage: React.FC = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect to landing page if not authenticated
    if (!loading && !user) {
      navigate('/');
    }
  }, [user, loading, navigate]);

  const handleRepositorySelect = (repo: GitHubRepo) => {
    // Store selected repository in localStorage or context
    localStorage.setItem('selectedRepository', JSON.stringify(repo));
    
    // Navigate to audit page with repository info
    navigate('/audit', { 
      state: { 
        repository: repo,
        source: 'github'
      } 
    });
  };

  const handleCancel = () => {
    navigate('/audit');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect via useEffect
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <RepositorySelector
        onRepositorySelect={handleRepositorySelect}
        onCancel={handleCancel}
      />
    </div>
  );
};
