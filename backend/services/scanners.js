const { exec } = require('child_process');
const { promisify } = require('util');
const fs = require('fs').promises;
const path = require('path');

const execAsync = promisify(exec);

async function runScanners(repoPath) {
  const issues = [];
  
  try {
    // Try Semgrep
    await runSemgrep(repoPath, issues);
  } catch (error) {
    console.log('⚠️ Semgrep not available, skipping...');
  }

  try {
    // Try Gitleaks
    await runGitleaks(repoPath, issues);
  } catch (error) {
    console.log('⚠️ Gitleaks not available, skipping...');
  }

  try {
    // Try ESLint
    await runESLint(repoPath, issues);
  } catch (error) {
    console.log('⚠️ ESLint not available, skipping...');
  }

  return { issues };
}

async function runSemgrep(repoPath, issues) {
  try {
    const { stdout } = await execAsync(`semgrep --config=auto --json ${repoPath}`, {
      timeout: 30000
    });
    
    const results = JSON.parse(stdout);
    
    if (results.results) {
      results.results.forEach(result => {
        issues.push({
          category: 'security',
          severity: result.extra.severity || 'medium',
          file: path.relative(repoPath, result.path),
          description: result.extra.message,
          recommendation: `Fix ${result.check_id} violation`,
          cursor_prompt: `Fix the ${result.check_id} security issue in ${path.basename(result.path)}: ${result.extra.message}`
        });
      });
    }
  } catch (error) {
    throw new Error('Semgrep execution failed');
  }
}

async function runGitleaks(repoPath, issues) {
  try {
    const { stdout } = await execAsync(`gitleaks detect --source ${repoPath} --report-format json`, {
      timeout: 30000
    });
    
    const results = JSON.parse(stdout);
    
    if (Array.isArray(results)) {
      results.forEach(result => {
        issues.push({
          category: 'secrets',
          severity: 'critical',
          file: result.File,
          description: `Potential secret detected: ${result.Description}`,
          recommendation: 'Remove or encrypt sensitive data',
          cursor_prompt: `Remove the exposed secret in ${result.File} at line ${result.StartLine}`
        });
      });
    }
  } catch (error) {
    throw new Error('Gitleaks execution failed');
  }
}

async function runESLint(repoPath, issues) {
  try {
    // Check if package.json exists and has eslint
    const packageJsonPath = path.join(repoPath, 'package.json');
    
    try {
      const packageJson = JSON.parse(await fs.readFile(packageJsonPath, 'utf8'));
      const hasESLint = packageJson.devDependencies?.eslint || packageJson.dependencies?.eslint;
      
      if (!hasESLint) {
        throw new Error('ESLint not found in package.json');
      }
    } catch (error) {
      throw new Error('No package.json or ESLint not configured');
    }

    const { stdout } = await execAsync(`cd ${repoPath} && npx eslint . --format json`, {
      timeout: 30000
    });
    
    const results = JSON.parse(stdout);
    
    results.forEach(fileResult => {
      fileResult.messages.forEach(message => {
        if (message.severity === 2) { // Only errors
          issues.push({
            category: 'code-quality',
            severity: 'high',
            file: path.relative(repoPath, fileResult.filePath),
            description: message.message,
            recommendation: `Fix ESLint rule: ${message.ruleId}`,
            cursor_prompt: `Fix ESLint error in ${path.basename(fileResult.filePath)} line ${message.line}: ${message.message}`
          });
        }
      });
    });
  } catch (error) {
    throw new Error('ESLint execution failed');
  }
}

module.exports = { runScanners };