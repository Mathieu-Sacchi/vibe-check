import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { cloneRepo, countFiles, cleanupRepo } from './services/git';

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

// Placeholder for audit endpoint
app.post('/audit', (req, res) => {
  res.json({ 
    message: 'Audit endpoint - coming soon!',
    body: req.body 
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`VibeCheck server running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
});

export default app;
