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
          maxTurns: 20  // Let Claude complete its full analysis
        }
      })) {
        messages.push(message);
      }
      
      // LOG ALL RAW MESSAGES FROM CLAUDE
      console.log(`\n=== RAW CLAUDE RESPONSE FOR PROMPT ${i + 1} ===`);
      console.log(`Total messages received: ${messages.length}`);
      
      messages.forEach((msg: any, index: number) => {
        console.log(`\n--- Message ${index + 1} ---`);
        console.log(`Type: ${msg.type || 'unknown'}`);
        console.log(`Keys: [${Object.keys(msg).join(', ')}]`);
        console.log(`Full message:`, JSON.stringify(msg, null, 2));
      });
      
      console.log(`\n=== END RAW CLAUDE RESPONSE ===\n`);
      
      // For now, just store the raw messages so you can see everything
      results.push({
        prompt_index: i + 1,
        raw_messages: messages,
        message_count: messages.length,
        debug_info: 'Raw Claude SDK response - see console logs above'
      });
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
