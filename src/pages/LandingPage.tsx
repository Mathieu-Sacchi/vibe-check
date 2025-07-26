import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Shield, Zap, Code, CheckCircle, Github, Upload } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { GitHubAuthService } from '../services/githubAuth';
import { useAuth } from '../contexts/AuthContext';

export const LandingPage: React.FC = () => {
  const [isConnectingGitHub, setIsConnectingGitHub] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  // Redirect authenticated users to audit page
  useEffect(() => {
    if (user) {
      navigate('/audit');
    }
  }, [user, navigate]);

  const handleGitHubConnect = async () => {
    setIsConnectingGitHub(true);
    try {
      const result = await GitHubAuthService.signInWithGitHub();
      if (!result.success) {
        alert('Failed to connect GitHub: ' + result.error);
      }
      // OAuth will redirect to callback page, so no need to handle success here
    } catch (error) {
      console.error('GitHub connection error:', error);
      alert('Failed to connect GitHub. Please try again.');
    } finally {
      setIsConnectingGitHub(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-6 py-20">
        <div className="text-center space-y-8">
          <h1 className="text-6xl font-bold text-black leading-tight">
            Analyze Your Code.<br />
            <span className="text-gray-600">Fix Everything.</span>
          </h1>
          
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Automatically detect security vulnerabilities, code quality issues, and compliance problems 
            in your projects. Get ready-to-use fixes powered by AI.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6 pt-8">
            <div className="flex items-center space-x-4">
              <Button 
                size="lg" 
                className="flex items-center space-x-2"
                onClick={handleGitHubConnect}
                disabled={isConnectingGitHub}
              >
                <Github className="h-5 w-5" />
                <span>{isConnectingGitHub ? 'Connecting...' : 'Connect GitHub'}</span>
              </Button>
              
              <span className="text-gray-400">or</span>
              
              <Link to="/signup?source=upload">
                <Button variant="outline" size="lg" className="flex items-center space-x-2">
                  <Upload className="h-5 w-5" />
                  <span>Upload Files</span>
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="max-w-7xl mx-auto px-6 py-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <Card hover className="text-center space-y-4">
            <div className="flex justify-center">
              <Shield className="h-12 w-12 text-black" />
            </div>
            <h3 className="text-xl font-semibold">Security First</h3>
            <p className="text-gray-600">
              Detect vulnerabilities, exposed credentials, and security anti-patterns 
              before they reach production.
            </p>
          </Card>

          <Card hover className="text-center space-y-4">
            <div className="flex justify-center">
              <Zap className="h-12 w-12 text-black" />
            </div>
            <h3 className="text-xl font-semibold">Lightning Fast</h3>
            <p className="text-gray-600">
              Get comprehensive analysis results in seconds, not hours. 
              Our AI-powered engine processes code at incredible speed.
            </p>
          </Card>

          <Card hover className="text-center space-y-4">
            <div className="flex justify-center">
              <Code className="h-12 w-12 text-black" />
            </div>
            <h3 className="text-xl font-semibold">Ready-to-Use Fixes</h3>
            <p className="text-gray-600">
              Don't just find problems—fix them. Copy-paste solutions 
              directly into your codebase and move forward.
            </p>
          </Card>
        </div>
      </section>

      {/* Audit Types */}
      <section className="max-w-7xl mx-auto px-6 py-20">
        <div className="text-center space-y-12">
          <h2 className="text-4xl font-bold">Complete Code Analysis</h2>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { name: 'Security', description: 'Vulnerabilities & threats' },
              { name: 'Quality', description: 'Code smells & bugs' },
              { name: 'Best Practices', description: 'Standards & patterns' },
              { name: 'AI Optimization', description: 'Performance insights' },
              { name: 'Compliance', description: 'Regulatory standards' },
              { name: 'Speed', description: 'Performance metrics' },
              { name: 'SEO', description: 'Search optimization' },
              { name: 'Accessibility', description: 'WCAG compliance' }
            ].map((audit, index) => (
              <Card key={index} hover className="text-center space-y-2">
                <CheckCircle className="h-8 w-8 text-black mx-auto" />
                <h4 className="font-semibold">{audit.name}</h4>
                <p className="text-sm text-gray-600">{audit.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="max-w-4xl mx-auto px-6 py-20">
        <div className="text-center space-y-12">
          <h2 className="text-4xl font-bold">Frequently Asked Questions</h2>
          
          <div className="space-y-6 text-left">
            {[
              {
                question: 'How does VibeCheckr analyze my code?',
                answer: 'We use advanced AI models combined with industry-standard static analysis tools to examine your codebase for security vulnerabilities, quality issues, and compliance problems.'
              },
              {
                question: 'Is my code kept private and secure?',
                answer: 'Absolutely. We never store your source code permanently. Analysis happens in isolated environments and all data is encrypted in transit.'
              },
              {
                question: 'What programming languages are supported?',
                answer: 'We support all major programming languages including JavaScript, TypeScript, Python, Java, C#, Go, Rust, and many more.'
              },
              {
                question: 'How accurate are the fixes provided?',
                answer: 'Our AI-generated fixes are tested against thousands of real-world scenarios. However, we always recommend reviewing changes before applying them to production code.'
              }
            ].map((faq, index) => (
              <Card key={index} className="space-y-3">
                <h4 className="font-semibold text-lg">{faq.question}</h4>
                <p className="text-gray-600">{faq.answer}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-7xl mx-auto px-6 py-20">
        <Card className="text-center space-y-8 bg-gray-50">
          <h2 className="text-4xl font-bold">Ready to improve your code?</h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Join thousands of developers who trust VibeCheckr to keep their code secure, clean, and compliant.
          </p>
          <Link to="/signup?source=cta">
            <Button size="lg">Start Free Analysis</Button>
          </Link>
        </Card>
      </section>
    </div>
  );
};