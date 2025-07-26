import axios from 'axios';

const API_BASE_URL = 'http://127.0.0.1:4000';

export interface AnalysisResult {
  overall_score: number;
  methodology: string;
  summary: string;
  critical_issues: CriticalIssue[];
  category_scores: { [key: string]: string | number };
  cross_cutting_insights: string[];
  specialist_agreement: {
    conflicting_recommendations: any[];
    reinforcing_findings: string[];
  };
  next_steps: string[];
  analyzedAt: string;
  source: string;
  filesAnalyzed?: number;
  totalFiles?: number;
  analysisCompleteness?: string;
  analysis_method?: string;
  individualResults?: any;
  // Legacy fields for backward compatibility
  score?: number;
  categories_analyzed?: CategoryAnalysis[];
  positive_findings?: string[];
}

export interface CriticalIssue {
  category: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  title: string;
  description: string;
  files_affected: string[];
  line_ranges: number[][];
  impact: string;
  recommendation: string;
  cursor_prompt: string;
}

export interface CategoryAnalysis {
  name: string;
  score: number;
  issues_found: number;
  top_concern: string;
}

export interface NextStep {
  priority?: 'immediate' | 'high' | 'medium' | 'low';
  actions?: string | string[];
}

class ApiService {
  private api = axios.create({
    baseURL: API_BASE_URL,
    timeout: 120000, // 2 minutes
  });

  async analyzeRepository(githubUrl: string): Promise<AnalysisResult> {
    try {
      const response = await this.api.post('/analyze', {
        githubUrl,
        type: 'github'
      });
      return response.data;
    } catch (error) {
      console.error('Analysis failed:', error);
      throw new Error('Failed to analyze repository. Please try again.');
    }
  }

  async analyzeUploadedFiles(files: File[]): Promise<AnalysisResult> {
    try {
      // Backend only accepts single file with 'repo' field name
      if (files.length === 0) {
        throw new Error('No files provided');
      }
      
      const formData = new FormData();
      formData.append('repo', files[0]); // Use first file only

      const response = await this.api.post('/analyze', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      console.error('Analysis failed:', error);
      throw new Error('Failed to analyze uploaded files. Please try again.');
    }
  }

  async analyzeZipFile(zipFile: File): Promise<AnalysisResult> {
    try {
      console.log('🔄 Starting ZIP file analysis...', zipFile.name, zipFile.size);
      const formData = new FormData();
      formData.append('repo', zipFile);

      console.log('🚀 Sending request to backend...');
      const response = await this.api.post('/analyze', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      console.log('✅ Analysis response received:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('❌ Analysis failed:', error);
      if (error.response) {
        console.error('Error response:', error.response.data);
        console.error('Error status:', error.response.status);
      }
      throw new Error('Failed to analyze ZIP file. Please try again.');
    }
  }
}

export const apiService = new ApiService(); 