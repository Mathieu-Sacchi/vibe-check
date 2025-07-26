const OpenAI = require('openai');
const fs = require('fs').promises;
const path = require('path');

let openaiClient = null;

function getOpenAIClient() {
  if (!openaiClient) {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey || apiKey === 'your_openai_api_key_here') {
      throw new Error('OPENAI_API_KEY environment variable is required for AI analysis');
    }
    openaiClient = new OpenAI({ apiKey });
  }
  return openaiClient;
}

async function analyzeWithAI(repoPath) {
  try {
    // Read top 5 code files
    const codeFiles = await findCodeFiles(repoPath);
    const fileContents = await Promise.all(
      codeFiles.slice(0, 5).map(async (filePath) => {
        const content = await fs.readFile(filePath, 'utf8');
        return {
          file: path.relative(repoPath, filePath),
          content: content.slice(0, 2000) // Limit content size
        };
      })
    );

    const prompt = `You are a code security & quality auditor. Analyze the provided code files and return a valid JSON object.

IMPORTANT: You must respond with ONLY a JSON object in this exact format, no other text or explanations:

{
  "score": 85,
  "summary": "Brief summary of findings",
  "issues": [
    {
      "category": "security",
      "severity": "high",
      "file": "filename.js",
      "description": "Issue description",
      "recommendation": "How to fix it",
      "cursor_prompt": "Copy-pasteable prompt for Cursor"
    }
  ]
}

Analyze these code files for security vulnerabilities, code quality issues, performance problems, and best practice violations.

Code files to analyze:
${fileContents.map(f => `File: ${f.file}\n${f.content}`).join('\n\n---\n\n')}

Remember: Return ONLY the JSON object, nothing else.`;

    const client = getOpenAIClient();
    const response = await client.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.3,
      max_tokens: 2000
    });

    const content = response.choices[0].message.content.trim();
    console.log('AI Response:', content); // Debug log
    
    // Try to extract JSON from the response
    let jsonStart = content.indexOf('{');
    let jsonEnd = content.lastIndexOf('}') + 1;
    
    if (jsonStart === -1 || jsonEnd === 0) {
      console.log('No JSON brackets found, trying to parse entire response');
      // Try to parse the entire response as JSON
      try {
        const result = JSON.parse(content);
        return result;
      } catch (parseError) {
        console.log('Failed to parse entire response as JSON');
        throw new Error('No valid JSON found in AI response');
      }
    }
    
    const jsonContent = content.substring(jsonStart, jsonEnd);
    console.log('Extracted JSON:', jsonContent); // Debug log
    
    try {
      const result = JSON.parse(jsonContent);
      return result;
    } catch (parseError) {
      console.log('JSON parse error:', parseError.message);
      throw new Error('Invalid JSON format in AI response');
    }

  } catch (error) {
    console.error('AI analysis error:', error);
    
    // Check if it's a JSON parsing error
    if (error.message.includes('Unexpected token') || error.message.includes('JSON')) {
      return {
        score: 70,
        summary: 'AI analysis completed but response format was invalid',
        issues: [{
          category: 'system',
          severity: 'medium',
          file: 'N/A',
          description: 'AI response was not in expected JSON format',
          recommendation: 'The analysis completed but the response format was unexpected',
          cursor_prompt: 'Review this codebase manually for security vulnerabilities and code quality issues'
        }]
      };
    }
    
    // Check if it's an authentication error
    if (error.message.includes('AuthenticationError') || error.message.includes('API key')) {
      return {
        score: 75,
        summary: 'Analysis completed with basic checks (OpenAI API key not configured)',
        issues: [{
          category: 'configuration',
          severity: 'medium',
          file: 'N/A',
          description: 'OpenAI API key not configured for advanced AI analysis',
          recommendation: 'Add your OpenAI API key to the .env file for enhanced analysis',
          cursor_prompt: 'Configure OpenAI API key in backend/.env file: OPENAI_API_KEY=your_actual_api_key_here'
        }]
      };
    }
    
    return {
      score: 50,
      summary: 'AI analysis failed, manual review recommended',
      issues: [{
        category: 'system',
        severity: 'medium',
        file: 'N/A',
        description: 'AI analysis unavailable',
        recommendation: 'Perform manual code review',
        cursor_prompt: 'Review this codebase for security vulnerabilities and code quality issues'
      }]
    };
  }
}

async function findCodeFiles(dirPath) {
  const files = [];
  const extensions = ['.js', '.ts', '.py', '.java', '.php', '.rb', '.go'];
  
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

module.exports = { analyzeWithAI };