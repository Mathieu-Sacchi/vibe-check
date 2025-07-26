import React, { useState, useRef, useEffect } from 'react';
import { Github, Upload, Shield, Zap, Code, Brain, FileCheck, Timer, Search, Eye, AlertTriangle, CheckCircle, X } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { apiService, AnalysisResult, CriticalIssue } from '../services/api';
import toast from 'react-hot-toast';
import ProgressUI from '../components/ProgressUI';

const auditTypes = [
  { id: 'security', name: 'Security', icon: Shield, color: 'text-red-500' },
  { id: 'quality', name: 'Quality', icon: Code, color: 'text-blue-500' },
  { id: 'best-practices', name: 'Best Practices', icon: FileCheck, color: 'text-green-500' },
  { id: 'ai', name: 'AI Optimization', icon: Brain, color: 'text-purple-500' },
  { id: 'compliance', name: 'Compliance', icon: Shield, color: 'text-yellow-500' },
  { id: 'speed', name: 'Speed', icon: Timer, color: 'text-orange-500' },
  { id: 'seo', name: 'SEO', icon: Search, color: 'text-indigo-500' }
];

export const AuditPage: React.FC = () => {
  const [projectUrl, setProjectUrl] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [selectedAudit, setSelectedAudit] = useState<string | null>(null);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Debug: Log when analysis result changes
  useEffect(() => {
    if (analysisResult) {
      console.log('🖥️ Analysis result updated:', analysisResult);
    }
  }, [analysisResult]);

  const handleAnalyze = async () => {
    if (!projectUrl && !uploadedFile) {
      toast.error('Please provide a GitHub URL or upload a file');
      return;
    }

    console.log('🔍 Starting analysis...', { projectUrl, uploadedFile: uploadedFile?.name });
    setIsAnalyzing(true);
    setAnalysisResult(null); // Clear previous results

    try {
      let result: AnalysisResult;

      if (uploadedFile) {
        console.log('📦 Analyzing ZIP file:', uploadedFile.name);
        result = await apiService.analyzeZipFile(uploadedFile);
      } else {
        console.log('🔗 Analyzing GitHub repository:', projectUrl);
        result = await apiService.analyzeRepository(projectUrl);
      }
      
      console.log('✅ Analysis completed:', result);
      console.log('📊 Setting analysis result...');
      setAnalysisResult(result);
      console.log('🎉 Analysis result set, should show UI now');
      toast.success('Analysis completed successfully!');
    } catch (error) {
      console.error('❌ Analysis failed:', error);
      toast.error(error instanceof Error ? error.message : 'Analysis failed');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleProgressComplete = () => {
    console.log('🎯 Progress UI completed, should show results now');
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.type === 'application/zip' || file.name.endsWith('.zip')) {
        setUploadedFile(file);
        setProjectUrl(''); // Clear URL when file is uploaded
        toast.success('File uploaded successfully');
      } else {
        toast.error('Please upload a ZIP file');
      }
    }
  };

  const handleAuditClick = (auditId: string) => {
    setSelectedAudit(auditId);
  };

  const getIssuesByCategory = (category: string): CriticalIssue[] => {
    if (!analysisResult) return [];
    return analysisResult.critical_issues.filter(issue => 
      issue.category.toLowerCase().includes(category.toLowerCase())
    );
  };

  const getCategoryScore = (category: string): number => {
    if (!analysisResult) return 0;
    
    // Try new format first
    if (analysisResult.category_scores) {
      const score = analysisResult.category_scores[category.toLowerCase()];
      if (score !== undefined) return typeof score === 'string' ? parseInt(score) : score;
    }
    
    // Fallback to legacy format
    if (analysisResult.categories_analyzed) {
      const categoryAnalysis = analysisResult.categories_analyzed.find(cat => 
        cat.name.toLowerCase().includes(category.toLowerCase())
      );
      return categoryAnalysis?.score || 0;
    }
    
    return 0;
  };

  if (selectedAudit) {
    const audit = auditTypes.find(a => a.id === selectedAudit)!;
    const issues = getIssuesByCategory(audit.id);
    const score = getCategoryScore(audit.id);

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
              <h2 className="text-xl font-semibold">Issues Found ({issues.length})</h2>
              
              <div className="space-y-4">
                {issues.length > 0 ? (
                  issues.map((issue, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900">{issue.title}</h4>
                          <p className="text-sm text-gray-600 mt-1">{issue.description}</p>
                          <div className="flex items-center space-x-2 mt-2">
                            <span className={`px-2 py-1 text-xs rounded ${
                              issue.severity === 'critical' ? 'bg-red-100 text-red-800' :
                              issue.severity === 'high' ? 'bg-orange-100 text-orange-800' :
                              issue.severity === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-green-100 text-green-800'
                            }`}>
                              {issue.severity.charAt(0).toUpperCase() + issue.severity.slice(1)}
                            </span>
                            <span className="text-xs text-gray-500">
                              {issue.files_affected.join(', ')}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <CheckCircle className="h-12 w-12 mx-auto mb-4 text-green-500" />
                    <p>No issues found in this category!</p>
                  </div>
                )}
              </div>
            </Card>

            <Card className="space-y-6">
              <h2 className="text-xl font-semibold">AI-Generated Fixes</h2>
              
              <div className="space-y-4">
                {issues.length > 0 ? (
                  issues.map((issue, index) => (
                    <div key={index} className="bg-gray-50 rounded-lg p-4">
                      <h4 className="font-medium mb-2">Fix for: {issue.title}</h4>
                      <pre className="text-sm bg-black text-green-400 p-3 rounded overflow-x-auto">
                        {issue.cursor_prompt}
                      </pre>
                      <p className="text-sm text-gray-600 mt-2">{issue.recommendation}</p>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <CheckCircle className="h-12 w-12 mx-auto mb-4 text-green-500" />
                    <p>No fixes needed - all good!</p>
                  </div>
                )}
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

        {!analysisResult && !isAnalyzing && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
            <Card className="text-center space-y-6">
              <Github className="h-16 w-16 text-black mx-auto" />
              <div>
                <h3 className="text-xl font-semibold mb-2">Connect GitHub Repository</h3>
                <p className="text-gray-600 mb-4">Enter a public GitHub repository URL</p>
                <Input
                  placeholder="https://github.com/username/repository"
                  value={projectUrl}
                  onChange={(e) => setProjectUrl(e.target.value)}
                  className="mb-4"
                />
                <Button 
                  onClick={handleAnalyze} 
                  disabled={!projectUrl}
                  className="flex items-center space-x-2 mx-auto"
                >
                  <Github className="h-5 w-5" />
                  <span>Analyze Repository</span>
                </Button>
              </div>
            </Card>

            <Card className="text-center space-y-6">
              <Upload className="h-16 w-16 text-black mx-auto" />
              <div>
                <h3 className="text-xl font-semibold mb-2">Upload Project Files</h3>
                <p className="text-gray-600 mb-4">Upload a ZIP file of your project</p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".zip"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <Button 
                  variant="outline" 
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center space-x-2 mx-auto mb-4"
                >
                  <Upload className="h-5 w-5" />
                  <span>Select ZIP File</span>
                </Button>
                {uploadedFile && (
                  <div className="text-sm text-green-600">
                    ✓ {uploadedFile.name}
                  </div>
                )}
                <Button 
                  onClick={handleAnalyze} 
                  disabled={!uploadedFile}
                  className="flex items-center space-x-2 mx-auto"
                >
                  <Upload className="h-5 w-5" />
                  <span>Analyze Files</span>
                </Button>
              </div>
            </Card>
          </div>
        )}

        <ProgressUI isAnalyzing={isAnalyzing} onComplete={handleProgressComplete} />

        {analysisResult && (
          <div className="space-y-8">
            <Card className="bg-white border-l-4 border-l-black">
              <div className="flex items-start space-x-4">
                <Github className="h-8 w-8 text-black flex-shrink-0 mt-1" />
                <div className="flex-1">
                  <h3 className="text-xl font-semibold">{analysisResult.source}</h3>
                  <p className="text-gray-600 mt-1">{analysisResult.summary}</p>
                  <div className="flex items-center space-x-4 mt-3 text-sm text-gray-500">
                    <span>• {analysisResult.filesAnalyzed || 0} files analyzed</span>
                    <span>• Score: {analysisResult.overall_score}/100</span>
                    <span>• {analysisResult.critical_issues.length} issues found</span>
                  </div>
                </div>
              </div>
            </Card>

            <div className="space-y-6">
              <h2 className="text-2xl font-bold">Analysis Results</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {auditTypes.map((audit) => {
                  const issues = getIssuesByCategory(audit.id);
                  const score = getCategoryScore(audit.id);
                  
                  return (
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
                        <span className={`text-sm font-medium px-2 py-1 rounded ${
                          issues.length > 0 ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                        }`}>
                          {issues.length} issues
                        </span>
                      </div>
                      
                      <div className="text-sm text-gray-600">
                        {issues.length > 0 ? (
                          `${issues[0].title}${issues.length > 1 ? ` and ${issues.length - 1} more...` : ''}`
                        ) : (
                          'No issues found'
                        )}
                      </div>
                      
                      <Button variant="outline" className="w-full mt-4" size="sm">
                        View Details
                      </Button>
                    </Card>
                  );
                })}
              </div>
            </div>

            {analysisResult.critical_issues.length > 0 && (
              <Card className="bg-red-50 border border-red-200">
                <div className="flex items-start space-x-4">
                  <AlertTriangle className="h-6 w-6 text-red-500 flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="text-lg font-semibold text-red-800">Critical Issues Found</h3>
                    <p className="text-red-700 mt-1">
                      {analysisResult.critical_issues.filter(issue => issue.severity === 'critical').length} critical issues require immediate attention.
                    </p>
                  </div>
                </div>
              </Card>
            )}
          </div>
        )}
      </div>
    </div>
  );
};