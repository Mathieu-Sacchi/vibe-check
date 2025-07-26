import React, { useState, useEffect } from 'react';
import { Shield, Upload, Github, Copy, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import axios from 'axios';
import toast, { Toaster } from 'react-hot-toast';

interface Issue {
  category: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  file: string;
  description: string;
  recommendation: string;
  cursor_prompt: string;
}

interface AnalysisResult {
  score: number;
  summary: string;
  issues: Issue[];
  analyzedAt: string;
  source: string;
}

function App() {
  const [githubUrl, setGithubUrl] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Persistent logging - these logs will stay in console
  useEffect(() => {
    console.log('🔧 VibeCheck App Component Mounted');
    console.log('📊 Current State:', { githubUrl, selectedFile: selectedFile?.name, isAnalyzing, result: !!result, error });
    
    // Add a global flag to prevent component unmounting during development
    (window as any).__VIBECHECK_MOUNTED__ = true;
    
    return () => {
      console.log('🔧 VibeCheck App Component Unmounted');
      (window as any).__VIBECHECK_MOUNTED__ = false;
    };
  }, []);

  useEffect(() => {
    if (result) {
      console.log('✅ RESULT RECEIVED - Score:', result.score, 'Issues:', result.issues.length);
      console.log('🎯 RENDERING RESULTS - Score:', result.score);
      console.log('📋 Full Result:', JSON.stringify(result, null, 2));
    }
  }, [result]);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type === 'application/zip') {
      setSelectedFile(file);
      setGithubUrl('');
      setError(null);
      console.log('📁 File selected:', file.name);
    } else {
      toast.error('Please select a valid ZIP file');
      console.log('❌ Invalid file type selected');
    }
  };

  const handleGithubUrlChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setGithubUrl(event.target.value);
    setSelectedFile(null);
    setError(null);
    console.log('🔗 GitHub URL changed:', event.target.value);
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success('Copied to clipboard!');
      console.log('📋 Copied to clipboard:', text.substring(0, 50) + '...');
    } catch (err) {
      toast.error('Failed to copy to clipboard');
      console.log('❌ Failed to copy to clipboard');
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'high':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical':
        return <XCircle className="w-5 h-5 text-red-600" />;
      case 'high':
        return <AlertTriangle className="w-5 h-5 text-orange-600" />;
      case 'medium':
        return <AlertTriangle className="w-5 h-5 text-yellow-600" />;
      case 'low':
        return <CheckCircle className="w-5 h-5 text-blue-600" />;
      default:
        return <AlertTriangle className="w-5 h-5 text-gray-600" />;
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const analyze = async (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
    }
    
    if (!githubUrl && !selectedFile) {
      setError('Please provide a GitHub URL or upload a ZIP file');
      console.log('❌ No input provided for analysis');
      return;
    }

    setIsAnalyzing(true);
    setError(null);
    setResult(null);

    console.log('🚀 Starting analysis...');
    console.log('📊 Analysis inputs:', { githubUrl, selectedFile: selectedFile?.name });

    try {
      const formData = new FormData();
      
      if (selectedFile) {
        console.log('📁 Using uploaded file:', selectedFile.name);
        formData.append('repo', selectedFile);
      } else {
        console.log('🔗 Using GitHub URL:', githubUrl);
        formData.append('githubUrl', githubUrl);
      }

      console.log('📡 Sending request to backend...');
      const response = await axios.post('http://localhost:4000/analyze', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        timeout: 120000,
        validateStatus: function (status) {
          return status < 500;
        }
      });

      console.log('✅ Backend response received:', response.status);
      console.log('📋 Response data:', JSON.stringify(response.data, null, 2));
      
      setResult(response.data);
      console.log('💾 Result state set successfully');
      
      toast.success('Analysis completed successfully!');
      console.log('🎉 Success toast shown');
      
    } catch (err: any) {
      console.log('❌ Analysis error occurred:', err);
      console.log('🔍 Error details:', {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status
      });
      
      const errorMessage = err.response?.data?.message || err.message || 'Analysis failed';
      setError(errorMessage);
      toast.error(`Analysis failed: ${errorMessage}`);
      console.log('💥 Error toast shown');
    } finally {
      setIsAnalyzing(false);
      console.log('🏁 Analysis process completed');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      <Toaster position="top-right" />
      
      {/* Header */}
      <div className="bg-white/10 backdrop-blur-sm border-b border-white/20">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center space-x-3">
            <Shield className="w-8 h-8 text-white" />
            <h1 className="text-2xl font-bold text-white">VibeCheck</h1>
            <span className="text-white/70 text-sm">Security Analysis Tool</span>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Analysis Form */}
        <form onSubmit={(e) => e.preventDefault()} className="bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 p-8 mb-8">
          <h2 className="text-xl font-semibold text-white mb-6">Analyze Repository</h2>
          
          <div className="space-y-6">
            {/* GitHub URL Input */}
            <div>
              <label className="block text-white/90 text-sm font-medium mb-2">
                <Github className="w-4 h-4 inline mr-2" />
                GitHub Repository URL
              </label>
              <input
                type="url"
                value={githubUrl}
                onChange={handleGithubUrlChange}
                placeholder="https://github.com/username/repository"
                className="w-full px-4 py-3 bg-white/20 border border-white/30 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                disabled={isAnalyzing || !!selectedFile}
              />
            </div>

            {/* Divider */}
            <div className="flex items-center space-x-4">
              <div className="flex-1 h-px bg-white/20"></div>
              <span className="text-white/60 text-sm">OR</span>
              <div className="flex-1 h-px bg-white/20"></div>
            </div>

            {/* File Upload */}
            <div>
              <label className="block text-white/90 text-sm font-medium mb-2">
                <Upload className="w-4 h-4 inline mr-2" />
                Upload ZIP File
              </label>
              <div className="relative">
                <input
                  type="file"
                  accept=".zip"
                  onChange={handleFileSelect}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  disabled={isAnalyzing || !!githubUrl}
                />
                <div className="w-full px-4 py-3 bg-white/20 border border-white/30 rounded-xl text-white/70 border-dashed hover:bg-white/25 transition-colors">
                  {selectedFile ? selectedFile.name : 'Click to select ZIP file'}
                </div>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-500/20 border border-red-500/30 rounded-xl p-4">
                <p className="text-red-200">{error}</p>
              </div>
            )}

            {/* Analyze Button */}
            <button
              onClick={analyze}
              disabled={isAnalyzing || (!githubUrl && !selectedFile)}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-gray-600 disabled:to-gray-600 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 flex items-center justify-center space-x-2 disabled:cursor-not-allowed"
            >
              {isAnalyzing ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>Analyzing...</span>
                </>
              ) : (
                <>
                  <Shield className="w-5 h-5" />
                  <span>Analyze Repository</span>
                </>
              )}
            </button>
          </div>
        </form>

        {/* Analysis Results */}
        {result && (
          <div className="space-y-6">
            {/* Score Card */}
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 p-8">
              <div className="text-center">
                <div className={`text-6xl font-bold mb-2 ${getScoreColor(result.score)}`}>
                  {result.score}
                </div>
                <div className="text-white/60 text-sm mb-4">Security Score / 100</div>
                <div className="text-white/90 text-lg">{result.summary}</div>
                <div className="text-white/60 text-sm mt-2">
                  Analyzed: {new Date(result.analyzedAt).toLocaleString()}
                </div>
                <div className="text-white/60 text-sm">
                  Source: {result.source}
                </div>
              </div>
            </div>

            {/* Issues List */}
            {result.issues.length > 0 && (
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 p-8">
                <h3 className="text-xl font-semibold text-white mb-6">
                  Issues Found ({result.issues.length})
                </h3>
                
                <div className="space-y-4">
                  {result.issues.map((issue, index) => (
                    <div
                      key={index}
                      className="bg-white/10 border border-white/20 rounded-xl p-6 hover:bg-white/15 transition-colors"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          {getSeverityIcon(issue.severity)}
                          <span className="text-white font-medium">{issue.file}</span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getSeverityColor(issue.severity)}`}>
                            {issue.severity.toUpperCase()}
                          </span>
                          <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium border border-blue-200">
                            {issue.category}
                          </span>
                        </div>
                      </div>
                      
                      <div className="space-y-3">
                        <div>
                          <h4 className="text-white/90 font-medium mb-1">Description</h4>
                          <p className="text-white/70 text-sm">{issue.description}</p>
                        </div>
                        
                        <div>
                          <h4 className="text-white/90 font-medium mb-1">Recommendation</h4>
                          <p className="text-white/70 text-sm">{issue.recommendation}</p>
                        </div>
                        
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="text-white/90 font-medium">Cursor Prompt</h4>
                            <button
                              onClick={() => copyToClipboard(issue.cursor_prompt)}
                              className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-lg text-xs font-medium flex items-center space-x-1 transition-colors"
                            >
                              <Copy className="w-3 h-3" />
                              <span>Copy</span>
                            </button>
                          </div>
                          <div className="bg-black/30 rounded-lg p-3 font-mono text-sm text-green-300">
                            {issue.cursor_prompt}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {result.issues.length === 0 && (
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 p-8 text-center">
                <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">No Issues Found</h3>
                <p className="text-white/70">Your repository appears to be secure and well-maintained!</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default App; 