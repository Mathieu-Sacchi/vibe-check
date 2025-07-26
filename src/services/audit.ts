import { query, type SDKMessage } from '@anthropic-ai/claude-code';
import { promises as fs } from 'fs';
import { join } from 'path';

export interface AuditIssue {
  issue_type: string;
  severity?: 'low' | 'med' | 'high';
  file_path?: string;
  line?: number;
  snippet?: string;
  explanation?: string;
  fix?: string;
  error?: string;
  prompt?: string;
}

export interface AuditResult {
  raw: unknown[];
  mdPath: string;
}

/**
 * Runs audit on a repository using Claude Code SDK
 * @param repoPath - Path to the cloned repository
 * @param prompts - Array of audit prompts to run
 * @returns Promise with raw results and markdown report path
 */
export async function runAudit(repoPath: string, prompts: string[]): Promise<AuditResult> {
  console.log(`Starting audit of repository at: ${repoPath}`);
  console.log(`Running ${prompts.length} audit prompts`);
  
  const results: unknown[] = [];
  
  const systemPrompt = `You are VibeCheck, an AI code auditor. Return ONLY valid JSON array of issues: issue_type, severity (low|med|high), file_path, line, snippet, explanation, fix. If no issues, return [{"issue_type":"none"}].`;
  
  // Run each prompt through Claude Code SDK
  for (let i = 0; i < prompts.length; i++) {
    const prompt = prompts[i];
    if (!prompt) {
      console.warn(`Skipping empty prompt at index ${i}`);
      continue;
    }
    
    console.log(`Running audit prompt ${i + 1}/${prompts.length}`);
    
    try {
      const messages: SDKMessage[] = [];
      
      // Use the query function with proper parameters
      for await (const message of query({
        prompt: `${systemPrompt}\n\n${prompt}`,
        options: {
          cwd: repoPath,
          maxTurns: 2
        }
      })) {
        messages.push(message);
      }
      
      // Extract the final message - simplified approach
      const finalMessage = messages[messages.length - 1];
      if (finalMessage && 'text' in finalMessage) {
        try {
          // Try to parse as JSON, fallback to text
          const jsonContent = JSON.parse(String(finalMessage.text));
          results.push(jsonContent);
          console.log(`✓ Prompt ${i + 1} completed successfully`);
        } catch (parseError) {
          // If not valid JSON, treat as text response
          results.push({
            issue_type: 'analysis_complete',
            explanation: String(finalMessage.text),
            severity: 'info'
          });
          console.log(`✓ Prompt ${i + 1} completed (text response)`);
        }
      } else {
        console.warn(`No content in response for prompt ${i + 1}`);
        results.push({
          error: 'No content in Claude response',
          prompt: prompt.substring(0, 100) + '...'
        });
      }
    } catch (error) {
      console.error(`Claude SDK error for prompt ${i + 1}:`, error);
      results.push({
        error: error instanceof Error ? error.message : 'Unknown Claude SDK error',
        prompt: prompt.substring(0, 100) + '...'
      });
    }
  }
  
  // Generate markdown report
  const mdPath = await renderMarkdown(repoPath, results);
  
  console.log(`Audit completed. Report saved to: ${mdPath}`);
  
  return {
    raw: results,
    mdPath
  };
}

/**
 * Renders audit results to a markdown file
 * @param repoPath - Repository path where to save the report
 * @param results - Raw audit results
 * @returns Path to the generated markdown file
 */
async function renderMarkdown(repoPath: string, results: unknown[]): Promise<string> {
  const reportPath = join(repoPath, 'VIBECHECK_REPORT.md');
  
  let markdown = `# VibeCheck Audit Report\n\n`;
  markdown += `Generated: ${new Date().toISOString()}\n\n`;
  
  results.forEach((result, index) => {
    markdown += `## Audit ${index + 1}\n\n`;
    
    if (Array.isArray(result)) {
      result.forEach((issue: AuditIssue) => {
        if (issue.issue_type === 'none') {
          markdown += `✅ No issues found\n\n`;
        } else {
          markdown += `### ${issue.issue_type}\n`;
          if (issue.severity) markdown += `**Severity:** ${issue.severity}\n`;
          if (issue.file_path) markdown += `**File:** ${issue.file_path}\n`;
          if (issue.line) markdown += `**Line:** ${issue.line}\n`;
          if (issue.explanation) markdown += `**Issue:** ${issue.explanation}\n`;
          if (issue.snippet) markdown += `**Code:**\n\`\`\`\n${issue.snippet}\n\`\`\`\n`;
          if (issue.fix) markdown += `**Fix:** ${issue.fix}\n`;
          markdown += `\n`;
        }
      });
    } else if (typeof result === 'object' && result !== null) {
      const errorResult = result as AuditIssue;
      if (errorResult.error) {
        markdown += `❌ **Error:** ${errorResult.error}\n`;
        if (errorResult.prompt) markdown += `**Prompt:** ${errorResult.prompt}\n`;
        markdown += `\n`;
      }
    }
  });
  
  await fs.writeFile(reportPath, markdown, 'utf8');
  return reportPath;
}
