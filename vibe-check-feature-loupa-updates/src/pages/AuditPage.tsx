import React, { useState } from 'react';
import { Github, Upload, Shield, Zap, Code, Brain, FileCheck, Timer, Search, Eye } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Input } from '../components/ui/Input';

const auditTypes = [
  { id: 'security', name: 'Security', icon: Shield, color: 'text-red-500', issues: 12 },
  { id: 'quality', name: 'Quality', icon: Code, color: 'text-blue-500', issues: 8 },
  { id: 'best-practices', name: 'Best Practices', icon: FileCheck, color: 'text-green-500', issues: 15 },
  { id: 'ai', name: 'AI Optimization', icon: Brain, color: 'text-purple-500', issues: 6 },
  { id: 'compliance', name: 'Compliance', icon: Shield, color: 'text-yellow-500', issues: 4 },
  { id: 'speed', name: 'Speed', icon: Timer, color: 'text-orange-500', issues: 9 },
  { id: 'seo', name: 'SEO', icon: Search, color: 'text-indigo-500', issues: 7 }
];

export const AuditPage: React.FC = () => {
  const [projectUrl, setProjectUrl] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [hasResults, setHasResults] = useState(false);
  const [selectedAudit, setSelectedAudit] = useState<string | null>(null);

  const handleAnalyze = async () => {
    setIsAnalyzing(true);
    // Simulate analysis
    setTimeout(() => {
      setIsAnalyzing(false);
      setHasResults(true);
    }, 3000);
  };

  const handleAuditClick = (auditId: string) => {
    setSelectedAudit(auditId);
  };

  if (selectedAudit) {
    const audit = auditTypes.find(a => a.id === selectedAudit)!;
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex items-center space-x-4 mb-8">
            <Button 
              variant="outline" 
              onClick={() => setSelectedAudit(null)}
            >
              ← Back to Results
            </Button>
            <h1 className="text-3xl font-bold flex items-center space-x-2">
              <audit.icon className={`h-8 w-8 ${audit.color}`} />
              <span>{audit.name} Analysis</span>
            </h1>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Card className="space-y-6">
              <h2 className="text-xl font-semibold">Issues Found ({audit.issues})</h2>
              
              <div className="space-y-4">
                {Array.from({ length: audit.issues }, (_, i) => (
                  <div key={i} className="border border-gray-200 rounded-lg p-4 relative">
                    <div className="absolute inset-0 bg-white/80 backdrop-blur-sm rounded-lg flex items-center justify-center">
                      <div className="text-center space-y-2">
                        <Eye className="h-6 w-6 text-gray-400 mx-auto" />
                        <p className="text-sm text-gray-600">Upgrade to view detailed issues</p>
                      </div>
                    </div>
                    <div className="blur-sm">
                      <h4 className="font-medium text-gray-900">Issue #{i + 1}</h4>
                      <p className="text-sm text-gray-600 mt-1">Critical security vulnerability detected in authentication module...</p>
                      <div className="flex items-center space-x-2 mt-2">
                        <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded">Critical</span>
                        <span className="text-xs text-gray-500">Line 42-45</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            <Card className="space-y-6">
              <h2 className="text-xl font-semibold">AI-Generated Fixes</h2>
              
              <div className="relative">
                <div className="absolute inset-0 bg-white/80 backdrop-blur-sm rounded-lg flex items-center justify-center z-10">
                  <div className="text-center space-y-4">
                    <Eye className="h-8 w-8 text-gray-400 mx-auto" />
                    <div>
                      <p className="font-medium text-gray-900">Ready-to-use fixes available</p>
                      <p className="text-sm text-gray-600">Upgrade to copy-paste solutions</p>
                    </div>
                    <Button>Unlock Fixes - $9.99</Button>
                  </div>
                </div>
                
                <div className="blur-sm space-y-4">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-medium mb-2">Fix for Issue #1</h4>
                    <pre className="text-sm bg-black text-green-400 p-3 rounded overflow-x-auto">
{`// Replace insecure authentication
function authenticateUser(token) {
  // Validate JWT with proper secret
  return jwt.verify(token, process.env.JWT_SECRET);
}`}
                    </pre>
                  </div>
                  
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-medium mb-2">Fix for Issue #2</h4>
                    <pre className="text-sm bg-black text-green-400 p-3 rounded overflow-x-auto">
{`// Add input validation
const schema = joi.object({
  email: joi.string().email().required(),
  password: joi.string().min(8).required()
});`}
                    </pre>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="text-center space-y-8 mb-12">
          <h1 className="text-4xl font-bold">Analyze Your Project</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Connect your GitHub repository or upload your code files to get comprehensive analysis
          </p>
        </div>

        {!hasResults && !isAnalyzing && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
            <Card className="text-center space-y-6">
              <Github className="h-16 w-16 text-black mx-auto" />
              <div>
                <h3 className="text-xl font-semibold mb-2">Connect GitHub Repository</h3>
                <p className="text-gray-600 mb-4">Authorize VibeCheckr to analyze your repository</p>
                <Button className="flex items-center space-x-2 mx-auto">
                  <Github className="h-5 w-5" />
                  <span>Connect GitHub</span>
                </Button>
              </div>
            </Card>

            <Card className="text-center space-y-6">
              <Upload className="h-16 w-16 text-black mx-auto" />
              <div>
                <h3 className="text-xl font-semibold mb-2">Upload Project Files</h3>
                <p className="text-gray-600 mb-4">Drag and drop your project folder or select files</p>
                <Button variant="outline" className="flex items-center space-x-2 mx-auto">
                  <Upload className="h-5 w-5" />
                  <span>Upload Files</span>
                </Button>
              </div>
            </Card>
          </div>
        )}

        {!hasResults && !isAnalyzing && (
          <Card className="max-w-2xl mx-auto">
            <div className="space-y-6">
              <h3 className="text-xl font-semibold text-center">Or analyze a public repository</h3>
              <div className="flex space-x-4">
                <Input
                  placeholder="https://github.com/username/repository"
                  value={projectUrl}
                  onChange={(e) => setProjectUrl(e.target.value)}
                  className="flex-1"
                />
                <Button onClick={handleAnalyze} disabled={!projectUrl}>
                  Analyze
                </Button>
              </div>
            </div>
          </Card>
        )}

        {isAnalyzing && (
          <Card className="max-w-2xl mx-auto text-center space-y-6">
            <div className="animate-spin h-16 w-16 border-4 border-gray-200 border-t-black rounded-full mx-auto"></div>
            <div>
              <h3 className="text-xl font-semibold">Analyzing Your Project</h3>
              <p className="text-gray-600">Our AI is examining your code for issues...</p>
            </div>
          </Card>
        )}

        {hasResults && (
          <div className="space-y-8">
            <Card className="bg-white border-l-4 border-l-black">
              <div className="flex items-start space-x-4">
                <Github className="h-8 w-8 text-black flex-shrink-0 mt-1" />
                <div className="flex-1">
                  <h3 className="text-xl font-semibold">react-todo-app</h3>
                  <p className="text-gray-600 mt-1">A modern React application for task management with TypeScript and Tailwind CSS</p>
                  <div className="flex items-center space-x-4 mt-3 text-sm text-gray-500">
                    <span>• 52 files analyzed</span>
                    <span>• 3,247 lines of code</span>
                    <span>• Last updated 2 hours ago</span>
                  </div>
                </div>
              </div>
            </Card>

            <div className="space-y-6">
              <h2 className="text-2xl font-bold">Analysis Results</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {auditTypes.map((audit) => (
                  <Card 
                    key={audit.id} 
                    hover 
                    className="cursor-pointer transition-all duration-200 hover:border-black"
                    onClick={() => handleAuditClick(audit.id)}
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <audit.icon className={`h-6 w-6 ${audit.color}`} />
                        <h3 className="font-semibold">{audit.name}</h3>
                      </div>
                      <span className="bg-red-100 text-red-800 text-sm font-medium px-2 py-1 rounded">
                        {audit.issues} issues
                      </span>
                    </div>
                    
                    <div className="relative">
                      <div className="absolute inset-0 bg-white/80 backdrop-blur-sm rounded flex items-center justify-center">
                        <Eye className="h-5 w-5 text-gray-400" />
                      </div>
                      <div className="blur-sm text-sm text-gray-600">
                        Critical security vulnerabilities found in authentication modules. Immediate attention required...
                      </div>
                    </div>
                    
                    <Button variant="outline" className="w-full mt-4" size="sm">
                      View Details
                    </Button>
                  </Card>
                ))}
              </div>
            </div>

            <Card className="text-center space-y-6 bg-gray-900 text-white">
              <h3 className="text-2xl font-bold">Unlock Complete Analysis</h3>
              <p className="text-gray-300 max-w-2xl mx-auto">
                Get detailed explanations, line-by-line fixes, and priority recommendations for all {auditTypes.reduce((sum, audit) => sum + audit.issues, 0)} issues found in your project.
              </p>
              <Button size="lg" className="bg-white text-black hover:bg-gray-100">
                Unlock for $9.99
              </Button>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};