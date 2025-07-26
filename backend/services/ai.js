const Anthropic = require('@anthropic-ai/sdk');
const fs = require('fs').promises;
const path = require('path');

let anthropicClient = null;

// Multi-Agent System Prompts

// 1. CONTEXT AGENT - Project Understanding
const CONTEXT_PROMPT = `You are a project context specialist analyzing codebases for architectural understanding.

Analyze the provided code repository and return ONLY this JSON:

{
  "project_type": "backend|frontend|fullstack|mobile|library|other",
  "primary_language": "main programming language",
  "framework": "main framework/library used",
  "architecture_pattern": "MVC|microservices|monolith|JAMstack|other",
  "file_structure": {
    "total_files": "number",
    "key_directories": ["dir1", "dir2"],
    "entry_points": ["main.js", "index.html"],
    "config_files": ["package.json", "requirements.txt"]
  },
  "dependencies": {
    "production": ["dep1", "dep2"],
    "development": ["dep1", "dep2"],
    "security_relevant": ["auth-lib", "crypto-lib"]
  },
  "architecture_notes": "Brief architectural overview and patterns used"
}

Focus only on understanding the project structure and technical context.`;

// 2. SECURITY AGENT - Security Analysis
const SECURITY_PROMPT = `You are a security specialist analyzing code for vulnerabilities.

Based on this project context: {{CONTEXT_FROM_AGENT_1}}

Analyze the codebase for security issues and return ONLY this JSON:

{
  "security_score": "0-100",
  "critical_vulnerabilities": [
    {
      "type": "injection|auth|secrets|crypto|other",
      "severity": "critical|high|medium|low",
      "file": "filename",
      "line_range": ["start", "end"],
      "description": "Detailed vulnerability description",
      "exploit_scenario": "How this could be exploited",
      "fix": "Specific remediation steps"
    }
  ],
  "security_patterns": {
    "authentication": "assessment of auth implementation",
    "authorization": "assessment of access controls", 
    "input_validation": "assessment of input sanitization",
    "secret_management": "assessment of secret handling",
    "crypto_usage": "assessment of cryptographic implementations"
  },
  "security_recommendations": ["priority ordered list of security improvements"]
}

Focus ONLY on security aspects. Ignore performance, code quality, or other concerns.`;

// 3. PERFORMANCE AGENT - Performance Analysis
const PERFORMANCE_PROMPT = `You are a performance specialist analyzing code for efficiency issues.

Based on this project context: {{CONTEXT_FROM_AGENT_1}}

Analyze the codebase for performance issues and return ONLY this JSON:

{
  "performance_score": "0-100",
  "bottlenecks": [
    {
      "type": "database|algorithm|memory|network|io|other",
      "severity": "critical|high|medium|low",
      "file": "filename", 
      "line_range": ["start", "end"],
      "description": "Performance issue description",
      "impact": "Expected performance impact",
      "optimization": "Specific optimization recommendation"
    }
  ],
  "performance_patterns": {
    "database_queries": "assessment of query efficiency",
    "caching_strategy": "assessment of caching implementation",
    "algorithm_complexity": "assessment of algorithmic efficiency",
    "resource_usage": "assessment of memory/CPU usage",
    "async_patterns": "assessment of async/concurrency usage"
  },
  "performance_recommendations": ["priority ordered list of performance improvements"]
}

Focus ONLY on performance and efficiency. Ignore security, code quality, or other concerns.`;

// 4. QUALITY AGENT - Code Quality Analysis
const QUALITY_PROMPT = `You are a code quality specialist analyzing maintainability and best practices.

Based on this project context: {{CONTEXT_FROM_AGENT_1}}

Analyze the codebase for quality issues and return ONLY this JSON:

{
  "quality_score": "0-100",
  "quality_issues": [
    {
      "type": "complexity|duplication|naming|structure|testing|other",
      "severity": "critical|high|medium|low",
      "file": "filename",
      "line_range": ["start", "end"], 
      "description": "Quality issue description",
      "maintainability_impact": "How this affects code maintainability",
      "refactoring": "Specific refactoring recommendation"
    }
  ],
  "quality_patterns": {
    "code_complexity": "assessment of cyclomatic complexity",
    "test_coverage": "assessment of testing implementation",
    "error_handling": "assessment of error management",
    "code_duplication": "assessment of DRY principle adherence",
    "naming_conventions": "assessment of naming consistency"
  },
  "quality_recommendations": ["priority ordered list of quality improvements"]
}

Focus ONLY on code quality and maintainability. Ignore security, performance, or other concerns.`;

// 5. FRONTEND AGENT - Frontend/SEO Analysis
const FRONTEND_PROMPT = `You are a frontend optimization and SEO specialist.

Based on this project context: {{CONTEXT_FROM_AGENT_1}}

If this is a frontend or fullstack project, analyze for frontend/SEO issues. If not frontend, return minimal response.

Return ONLY this JSON:

{
  "frontend_applicable": "true|false",
  "frontend_score": "0-100",
  "frontend_issues": [
    {
      "type": "bundle|seo|accessibility|performance|other",
      "severity": "critical|high|medium|low",
      "file": "filename",
      "description": "Frontend issue description", 
      "user_impact": "How this affects user experience",
      "optimization": "Specific optimization recommendation"
    }
  ],
  "frontend_patterns": {
    "bundle_optimization": "assessment of bundle size and loading",
    "seo_implementation": "assessment of SEO best practices",
    "accessibility": "assessment of accessibility compliance",
    "responsive_design": "assessment of mobile responsiveness"
  },
  "frontend_recommendations": ["priority ordered list of frontend improvements"]
}

Focus ONLY on frontend optimization and SEO. Ignore backend concerns.`;

// 6. AGGREGATION AGENT - Final Synthesis
const AGGREGATION_PROMPT = `You are aggregating analysis results from multiple specialists.

You have received these analysis results:
- Context: {{CONTEXT_RESULTS}}
- Security: {{SECURITY_RESULTS}}  
- Performance: {{PERFORMANCE_RESULTS}}
- Quality: {{QUALITY_RESULTS}}
- Frontend: {{FRONTEND_RESULTS}}

Aggregate these into a final comprehensive report. Return ONLY this JSON:

{
  "overall_score": "0-100",
  "methodology": "multi-agent sequential analysis",
  "summary": "2-3 sentence overall assessment",
  "critical_issues": [
    {
      "category": "security|performance|quality|frontend",
      "severity": "critical|high|medium|low",
      "source_analysis": "which specialist identified this",
      "title": "Brief issue title",
      "description": "Consolidated description",
      "files_affected": ["file1", "file2"],
      "recommendation": "Prioritized fix recommendation"
    }
  ],
  "category_scores": {
    "security": "0-100",
    "performance": "0-100", 
    "quality": "0-100",
    "frontend": "0-100"
  },
  "cross_cutting_insights": ["Issues that span multiple categories or weren't caught by individual specialists"],
  "specialist_agreement": {
    "conflicting_recommendations": [],
    "reinforcing_findings": []
  },
  "next_steps": ["Prioritized action items"]
}

Focus on identifying patterns across analyses and any gaps between specialist findings.`;

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

async function analyzeWithAgent(agentPrompt, codebaseContent, contextData = null) {
  let prompt = agentPrompt;
  
  // Replace context placeholders if provided
  if (contextData) {
    prompt = prompt.replace('{{CONTEXT_FROM_AGENT_1}}', JSON.stringify(contextData));
  }
  
  const userMessage = contextData ? 
    `Codebase to analyze:\n${codebaseContent}` : 
    `Analyze this codebase:\n${codebaseContent}`;

  let response;
  try {
    response = await callClaude(prompt, userMessage);
    return await parseJSONResponse(response);
  } catch (error) {
    if (error.message.includes('Invalid JSON')) {
      return await retryWithJSONFix(response || '', prompt, userMessage);
    }
    throw error;
  }
}

async function analyzeRepo(files) {
  console.log(`🔍 Starting Multi-Agent Claude analysis of ${files.length} files...`);
  
  try {
    // Step 1: Context Analysis
    console.log('🧠 Agent 1: Context Analysis...');
    const topFiles = files.slice(0, 3);
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
    
    const codebaseContent = fileContents.map(f => `File: ${f.file}\nContent:\n${f.content}`).join('\n\n---\n\n');
    
    // Step 1: Context Agent
    const contextResults = await analyzeWithAgent(CONTEXT_PROMPT, codebaseContent);
    console.log('✅ Context analysis completed');
    
    // Step 2: Security Agent
    console.log('🔒 Agent 2: Security Analysis...');
    const securityResults = await analyzeWithAgent(SECURITY_PROMPT, codebaseContent, contextResults);
    console.log('✅ Security analysis completed');
    
    // Step 3: Performance Agent
    console.log('⚡ Agent 3: Performance Analysis...');
    const performanceResults = await analyzeWithAgent(PERFORMANCE_PROMPT, codebaseContent, contextResults);
    console.log('✅ Performance analysis completed');
    
    // Step 4: Quality Agent
    console.log('📝 Agent 4: Quality Analysis...');
    const qualityResults = await analyzeWithAgent(QUALITY_PROMPT, codebaseContent, contextResults);
    console.log('✅ Quality analysis completed');
    
    // Step 5: Frontend Agent
    console.log('🎨 Agent 5: Frontend Analysis...');
    const frontendResults = await analyzeWithAgent(FRONTEND_PROMPT, codebaseContent, contextResults);
    console.log('✅ Frontend analysis completed');
    
    // Step 6: Aggregation Agent
    console.log('🔄 Agent 6: Final Aggregation...');
    const aggregationPrompt = AGGREGATION_PROMPT
      .replace('{{CONTEXT_RESULTS}}', JSON.stringify(contextResults))
      .replace('{{SECURITY_RESULTS}}', JSON.stringify(securityResults))
      .replace('{{PERFORMANCE_RESULTS}}', JSON.stringify(performanceResults))
      .replace('{{QUALITY_RESULTS}}', JSON.stringify(qualityResults))
      .replace('{{FRONTEND_RESULTS}}', JSON.stringify(frontendResults));
    
    const finalResults = await analyzeWithAgent(aggregationPrompt, '');
    console.log('✅ Aggregation completed');
    
    // Add metadata
    finalResults.analyzedAt = new Date().toISOString();
    finalResults.filesAnalyzed = fileContents.length;
    finalResults.totalFiles = files.length;
    finalResults.analysisCompleteness = files.length > 3 ? 'partial' : 'complete';
    finalResults.analysis_method = 'multi-agent';
    finalResults.individualResults = {
      context: contextResults,
      security: securityResults,
      performance: performanceResults,
      quality: qualityResults,
      frontend: frontendResults
    };
    
    console.log('✅ Multi-Agent Claude analysis completed successfully');
    return finalResults;
    
  } catch (error) {
    console.error('❌ Multi-Agent Claude analysis failed:', error);
    console.error('❌ Error details:', error.message);
    console.error('❌ Error stack:', error.stack);
    
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
        analyzedAt: new Date().toISOString(),
        analysis_method: 'multi-agent'
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
      analyzedAt: new Date().toISOString(),
      analysis_method: 'multi-agent'
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
  console.log('🔄 Using new Multi-Agent Claude analysis...');
  const files = await findCodeFiles(repoPath);
  return await analyzeRepo(files);
}

module.exports = { analyzeWithAI, analyzeRepo, findCodeFiles };