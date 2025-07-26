import React, { useState, useEffect } from 'react';
import { Search, Calendar, Lock, Globe } from 'lucide-react';
import { GitHubAuthService, GitHubRepo } from '../services/githubAuth';
import { Button } from './ui/Button';
import { Card } from './ui/Card';

interface RepositorySelectorProps {
  onRepositorySelect: (repo: GitHubRepo) => void;
  onCancel?: () => void;
}

export const RepositorySelector: React.FC<RepositorySelectorProps> = ({
  onRepositorySelect,
  onCancel
}) => {
  const [repositories, setRepositories] = useState<GitHubRepo[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadRepositories();
  }, []);

  const loadRepositories = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const accessToken = await GitHubAuthService.getAccessToken();
      if (!accessToken) {
        setError('No GitHub access token found. Please reconnect your GitHub account.');
        return;
      }

      const repos = await GitHubAuthService.getUserRepositories(accessToken);
      setRepositories(repos);
    } catch (err) {
      console.error('Error loading repositories:', err);
      setError('Failed to load repositories. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const filteredRepositories = repositories.filter(repo =>
    repo.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    repo.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <Card className="p-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading your repositories...</p>
          </div>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <Card className="p-8">
          <div className="text-center">
            <p className="text-red-600 mb-4">{error}</p>
            <div className="space-x-4">
              <Button onClick={loadRepositories}>Try Again</Button>
              {onCancel && (
                <Button variant="outline" onClick={onCancel}>
                  Cancel
                </Button>
              )}
            </div>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Select Repository to Analyze
        </h2>
        <p className="text-gray-600">
          Choose a repository from your GitHub account to perform code analysis.
        </p>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <input
            type="text"
            placeholder="Search repositories..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Repository List */}
      <div className="space-y-4">
        {filteredRepositories.length === 0 ? (
          <Card className="p-8">
            <div className="text-center text-gray-500">
              {searchTerm ? 'No repositories match your search.' : 'No repositories found.'}
            </div>
          </Card>
        ) : (
          filteredRepositories.map((repo) => (
            <Card key={repo.id} className="p-6 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {repo.name}
                    </h3>
                    {repo.private ? (
                      <Lock className="h-4 w-4 text-gray-400" />
                    ) : (
                      <Globe className="h-4 w-4 text-gray-400" />
                    )}
                  </div>
                  
                  {repo.description && (
                    <p className="text-gray-600 mb-3">{repo.description}</p>
                  )}
                  
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    {repo.language && (
                      <div className="flex items-center gap-1">
                        <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                        <span>{repo.language}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      <span>Updated {formatDate(repo.updated_at)}</span>
                    </div>
                  </div>
                </div>
                
                <div className="ml-4">
                  <Button
                    onClick={() => onRepositorySelect(repo)}
                    className="whitespace-nowrap"
                  >
                    Analyze Repository
                  </Button>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>

      {/* Cancel Button */}
      {onCancel && (
        <div className="mt-6 text-center">
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        </div>
      )}
    </div>
  );
};
