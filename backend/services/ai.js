const Anthropic = require('@anthropic-ai/sdk');
const fs = require('fs').promises;
const path = require('path');

let anthropicClient = null;

// Master System Prompt for Claude
const MASTER_SYSTEM_PROMPT = `VibeCheck Master Code Auditor

You are a comprehensive code auditor that analyzes repositories for security, quality, performance, architecture, and compliance issues.

⸻

🎯 Analysis Framework

Conduct analysis in these phases, leveraging full codebase context:
	1.	Security Scan - Vulnerabilities, exposed secrets, authentication issues
	2.	Architecture Review - Structure, dependencies, design patterns
	3.	Performance Analysis - Bottlenecks, inefficient operations, resource usage
	4.	Quality Assessment - Maintainability, testing coverage, code complexity
	5.	Frontend Optimization - Bundle size, loading performance, caching (if applicable)
	6.	SEO & Accessibility - Meta tags, semantic HTML, accessibility (if applicable)
	7.	Compliance Check - Licensing, PII handling, regulatory requirements
	8.	Deployment Readiness - Configuration management, environment handling

⸻

🎯 Scoring Rubric
	•	90-100: Production-ready
	•	70-89: Good with minor improvements
	•	50-69: Moderate issues
	•	30-49: Significant problems
	•	0-29: Critical risks

Weighting:
	•	Security: 40%
	•	Performance & Architecture: 25%
	•	Quality & Testing: 20%
	•	Compliance & SEO: 15%

⸻

🎯 Analysis Instructions
	1.	Detect project type automatically (backend, frontend, fullstack, mobile, library)
	2.	Adjust category coverage based on project type
	3.	Focus on security-sensitive and critical business logic
	4.	Cross-link issues where relevant (e.g., performance vs security tradeoffs)
	5.	Note skipped categories and explain why

⸻

✅ Output Format

Return ONLY a JSON object:

{
"score": 0-100,
"project_type": "backend|frontend|fullstack|mobile|library|other",
"summary": "2-3 sentence overview",
"critical_issues": [
{
"category": "security|performance|quality|compliance|architecture",
"severity": "critical|high|medium|low",
"title": "Brief issue title",
"description": "Detailed explanation",
"files_affected": ["file1.js"],
"line_ranges": [[10,15]],
"impact": "Business/technical impact",
"recommendation": "Actionable fix",
"cursor_prompt": "Copy-pasteable fix instruction for Cursor IDE"
}
],
"categories_analyzed": [
{
"name": "security|performance|quality|frontend|seo|compliance|architecture",
"score": 0-100,
"issues_found": 5,
"top_concern": "Main issue for this category"
}
],
"positive_findings": [
"Good practices worth noting"
],
"next_steps": [
"Prioritized recommended actions"
]
}
	•	No markdown, no explanations outside JSON
	•	If analysis is partial (large repo), include "analysis_completeness": "partial"`;

function getAnthropicClient() {
  if (!anthropicClient) {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey || apiKey === 'your_anthropic_api_key_here') {
      throw new Error('ANTHROPIC_API_KEY environment variable is required for AI analysis');
    }
    anthropicClient = new Anthropic({ apiKey });
  }
  return anthropicClient;
}

async function callClaude(systemPrompt, userMessage, temperature = 0.1) {
  const client = getAnthropicClient();
  
  try {
    const response = await client.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 4000,
      temperature: temperature,
      system: systemPrompt,
      messages: [
        {
          role: 'user',
          content: userMessage
        }
      ]
    });

    return response.content[0].text.trim();
  } catch (error) {
    console.error('Claude API error:', error);
    throw error;
  }
}

async function parseJSONResponse(response) {
  try {
    // Try to extract JSON from the response
    let jsonStart = response.indexOf('{');
    let jsonEnd = response.lastIndexOf('}') + 1;
    
    if (jsonStart === -1 || jsonEnd === 0) {
      throw new Error('No JSON brackets found in response');
    }
    
    const jsonContent = response.substring(jsonStart, jsonEnd);
    console.log('Extracted JSON:', jsonContent);
    
    return JSON.parse(jsonContent);
  } catch (parseError) {
    console.log('JSON parse error:', parseError.message);
    throw new Error('Invalid JSON format in Claude response');
  }
}

async function retryWithJSONFix(originalResponse, systemPrompt, userMessage) {
  console.log('Retrying with JSON fix prompt...');
  
  const fixPrompt = `Your previous response was invalid JSON. Return ONLY valid JSON in the exact format specified.

Original response: ${originalResponse}

Please provide ONLY the JSON object, no other text or explanations.`;
  
  const retryResponse = await callClaude(systemPrompt, fixPrompt, 0.0);
  return parseJSONResponse(retryResponse);
}

async function analyzeFile(filePath, fileContent) {
  const relativePath = path.relative(process.cwd(), filePath);
  const chunkedContent = fileContent.length > 3000 ? 
    fileContent.substring(0, 3000) + '\n\n[Content truncated - file too large]' : 
    fileContent;
  
  const userMessage = `Analyze this file as part of the repository audit:

File: ${relativePath}
Content:
${chunkedContent}

Provide a focused analysis of this specific file for security, quality, and performance issues.`;

  try {
    const response = await callClaude(MASTER_SYSTEM_PROMPT, userMessage);
    return await parseJSONResponse(response);
  } catch (error) {
    if (error.message.includes('Invalid JSON')) {
      return await retryWithJSONFix(response, MASTER_SYSTEM_PROMPT, userMessage);
    }
    throw error;
  }
}

async function analyzeRepo(files) {
  console.log(`🔍 Starting Claude analysis of ${files.length} files...`);
  
  try {
    // Single-pass analysis: Read top 3 files and analyze together
    const topFiles = files.slice(0, 3); // Analyze only top 3 files
    const fileContents = [];
    
    for (const filePath of topFiles) {
      try {
        console.log(`📄 Reading file: ${path.basename(filePath)}`);
        const content = await fs.readFile(filePath, 'utf8');
        const chunkedContent = content.length > 2000 ? 
          content.substring(0, 2000) + '\n\n[Content truncated - file too large]' : 
          content;
        
        fileContents.push({
          file: path.relative(process.cwd(), filePath),
          content: chunkedContent
        });
      } catch (error) {
        console.log(`⚠️ Failed to read ${filePath}:`, error.message);
      }
    }
    
    // Single comprehensive analysis
    console.log('🧠 Performing comprehensive analysis...');
    
    const analysisMessage = `Analyze these code files for a comprehensive repository audit:

${fileContents.map(f => `File: ${f.file}\nContent:\n${f.content}`).join('\n\n---\n\n')}

Provide a complete analysis including:
1. Overall security score and critical issues
2. Project type classification
3. Category breakdown (security, performance, quality, etc.)
4. Positive findings and recommendations
5. Prioritized next steps

Focus on the most critical findings and provide actionable insights.`;

    const response = await callClaude(MASTER_SYSTEM_PROMPT, analysisMessage);
    const finalAnalysis = await parseJSONResponse(response);
    
    // Add metadata
    finalAnalysis.analyzedAt = new Date().toISOString();
    finalAnalysis.filesAnalyzed = fileContents.length;
    finalAnalysis.totalFiles = files.length;
    finalAnalysis.analysisCompleteness = files.length > 3 ? 'partial' : 'complete';
    
    console.log('✅ Claude analysis completed successfully');
    return finalAnalysis;
    
  } catch (error) {
    console.error('❌ Claude analysis failed:', error);
    
    // Handle specific error types
    if (error.message.includes('AuthenticationError') || error.message.includes('API key')) {
      return {
        score: 75,
        project_type: 'unknown',
        summary: 'Analysis completed with basic checks (Anthropic API key not configured)',
        critical_issues: [{
          category: 'configuration',
          severity: 'medium',
          title: 'API Key Not Configured',
          description: 'Anthropic API key not configured for advanced AI analysis',
          files_affected: ['N/A'],
          line_ranges: [],
          impact: 'Limited analysis capabilities',
          recommendation: 'Add your Anthropic API key to the .env file for enhanced analysis',
          cursor_prompt: 'Configure Anthropic API key in backend/.env file: ANTHROPIC_API_KEY=your_actual_api_key_here'
        }],
        categories_analyzed: [],
        positive_findings: [],
        next_steps: ['Configure Anthropic API key for enhanced analysis'],
        analyzedAt: new Date().toISOString()
      };
    }
    
    // Generic fallback
    return {
      score: 50,
      project_type: 'unknown',
      summary: 'AI analysis failed, manual review recommended',
      critical_issues: [{
        category: 'system',
        severity: 'medium',
        title: 'Analysis Unavailable',
        description: 'Claude AI analysis unavailable due to technical issues',
        files_affected: ['N/A'],
        line_ranges: [],
        impact: 'Limited automated analysis',
        recommendation: 'Perform manual code review',
        cursor_prompt: 'Review this codebase for security vulnerabilities and code quality issues'
      }],
      categories_analyzed: [],
      positive_findings: [],
      next_steps: ['Perform manual code review'],
      analyzedAt: new Date().toISOString()
    };
  }
}

async function findCodeFiles(dirPath) {
  const files = [];
  const extensions = ['.js', '.ts', '.py', '.java', '.php', '.rb', '.go', '.jsx', '.tsx', '.vue', '.svelte'];
  
  async function scanDir(currentPath) {
    const entries = await fs.readdir(currentPath, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = path.join(currentPath, entry.name);
      
      if (entry.isDirectory() && !entry.name.startsWith('.') && entry.name !== 'node_modules') {
        await scanDir(fullPath);
      } else if (entry.isFile() && extensions.some(ext => entry.name.endsWith(ext))) {
        files.push(fullPath);
      }
    }
  }
  
  await scanDir(dirPath);
  return files;
}

// Legacy function for backward compatibility
async function analyzeWithAI(repoPath) {
  console.log('🔄 Using new Claude analysis...');
  const files = await findCodeFiles(repoPath);
  return await analyzeRepo(files);
}

module.exports = { analyzeWithAI, analyzeRepo, findCodeFiles };