import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { v4 as uuidv4 } from 'uuid';
import { cloneRepo, countFiles, cleanupRepo } from './services/git';
import { runAudit } from './services/audit';
import { DEFAULT_PROMPTS } from './prompts/index';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// Health check endpoint with optional repo cloning
app.get('/health', async (req, res) => {
  const { repo } = req.query;
  
  if (!repo || typeof repo !== 'string') {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
    return;
  }
  
  try {
    console.log(`Testing repo clone: ${repo}`);
    const repoPath = await cloneRepo(repo);
    const fileCount = await countFiles(repoPath);
    
    // Cleanup after counting
    await cleanupRepo(repoPath);
    
    res.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      repo: repo,
      path: repoPath,
      files: fileCount
    });
  } catch (error) {
    console.error('Repo clone test failed:', error);
    res.status(500).json({
      status: 'error',
      timestamp: new Date().toISOString(),
      repo: repo,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Audit endpoint
app.post('/audit', async (req, res) => {
  try {
    const { repoUrl, prompts } = req.body;
    
    // Validate repoUrl
    if (!repoUrl || typeof repoUrl !== 'string') {
      res.status(400).json({ error: 'repoUrl is required and must be a string' });
      return;
    }
    
    if (!repoUrl.startsWith('https://github.com/')) {
      res.status(400).json({ error: 'repoUrl must be a GitHub repository URL starting with https://github.com/' });
      return;
    }
    
    console.log(`Starting audit for repository: ${repoUrl}`);
    
    // Generate audit ID
    const auditId = uuidv4();
    
    // Clone repository
    const repoPath = await cloneRepo(repoUrl);
    
    // Use provided prompts or default set
    const promptSet = Array.isArray(prompts) && prompts.length > 0 ? prompts : DEFAULT_PROMPTS;
    
    console.log(`Running audit with ${promptSet.length} prompts`);
    
    // Run audit
    const result = await runAudit(repoPath, promptSet);
    
    // Cleanup repository
    await cleanupRepo(repoPath);
    
    // Respond with audit results
    res.json({
      auditId,
      status: 'completed',
      raw: result.raw,
      markdown: result.mdPath
    });
    
    console.log(`Audit ${auditId} completed successfully`);
    
  } catch (error) {
    console.error('Audit endpoint error:', error);
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Unknown error occurred during audit'
    });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`VibeCheck server running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
});

export default app;
