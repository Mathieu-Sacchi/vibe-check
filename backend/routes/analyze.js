const express = require('express');
const multer = require('multer');
const { cloneRepo, extractZip, cleanupTemp } = require('../utils/fileManager');
const { runScanners } = require('../services/scanners');
const { analyzeWithAI, analyzeRepo, findCodeFiles } = require('../services/ai');

const router = express.Router();

// Configure multer for file uploads
const upload = multer({ dest: 'temp_uploads/' });

router.post('/', upload.single('repo'), async (req, res) => {
  let tempPath = null;
  
  try {
    const { githubUrl } = req.body;
    const uploadedFile = req.file;

    if (!githubUrl && !uploadedFile) {
      return res.status(400).json({ 
        error: 'Either githubUrl or repo file must be provided' 
      });
    }

    // Generate timestamp for unique temp directory
    const timestamp = Date.now();
    tempPath = `temp_repos/${timestamp}`;

    // Clone repo or extract zip
    if (githubUrl) {
      console.log(`📥 Cloning repository: ${githubUrl}`);
      await cloneRepo(githubUrl, tempPath);
    } else {
      console.log(`📦 Extracting uploaded file: ${uploadedFile.originalname}`);
      await extractZip(uploadedFile.path, tempPath);
    }

    // Run security scanners first
    console.log('🔍 Running security scanners...');
    const scanResults = await runScanners(tempPath);

    let analysisResult;

    if (scanResults.issues.length > 0) {
      // Use scanner results and enhance with Claude
      console.log('🔍 Scanner results found, enhancing with Claude analysis...');
      const files = await findCodeFiles(tempPath);
      const claudeAnalysis = await analyzeRepo(files);
      
      // Merge scanner results with Claude analysis
      analysisResult = {
        ...claudeAnalysis,
        scanner_issues: scanResults.issues,
        analysis_method: 'scanners + claude'
      };
    } else {
      // Use Claude analysis only
      console.log('🤖 No scanner results, using Claude analysis...');
      const files = await findCodeFiles(tempPath);
      analysisResult = await analyzeRepo(files);
      analysisResult.analysis_method = 'claude_only';
    }

    // Add source information
    analysisResult.source = githubUrl || uploadedFile.originalname;

    res.json(analysisResult);

  } catch (error) {
    console.error('❌ Analysis error:', error);
    res.status(500).json({ 
      error: 'Analysis failed', 
      details: error.message 
    });
  } finally {
    // Cleanup temp files
    if (tempPath) {
      await cleanupTemp(tempPath);
    }
  }
});

module.exports = router;