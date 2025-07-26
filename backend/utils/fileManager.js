const simpleGit = require('simple-git');
const fs = require('fs').promises;
const path = require('path');
const yauzl = require('yauzl');

async function cloneRepo(githubUrl, targetPath) {
  try {
    // Ensure temp directory exists
    await fs.mkdir(path.dirname(targetPath), { recursive: true });
    
    const git = simpleGit();
    await git.clone(githubUrl, targetPath);
    
    console.log(`✅ Repository cloned to ${targetPath}`);
  } catch (error) {
    throw new Error(`Failed to clone repository: ${error.message}`);
  }
}

async function extractZip(zipPath, targetPath) {
  return new Promise((resolve, reject) => {
    // Ensure target directory exists
    fs.mkdir(targetPath, { recursive: true }).then(() => {
      yauzl.open(zipPath, { lazyEntries: true }, (err, zipfile) => {
        if (err) return reject(err);

        zipfile.readEntry();
        zipfile.on('entry', (entry) => {
          if (/\/$/.test(entry.fileName)) {
            // Directory entry
            const dirPath = path.join(targetPath, entry.fileName);
            fs.mkdir(dirPath, { recursive: true }).then(() => {
              zipfile.readEntry();
            }).catch(reject);
          } else {
            // File entry
            zipfile.openReadStream(entry, (err, readStream) => {
              if (err) return reject(err);

              const filePath = path.join(targetPath, entry.fileName);
              const dirPath = path.dirname(filePath);
              
              fs.mkdir(dirPath, { recursive: true }).then(() => {
                const writeStream = require('fs').createWriteStream(filePath);
                readStream.pipe(writeStream);
                writeStream.on('close', () => {
                  zipfile.readEntry();
                });
                writeStream.on('error', reject);
              }).catch(reject);
            });
          }
        });

        zipfile.on('end', () => {
          console.log(`✅ ZIP extracted to ${targetPath}`);
          resolve();
        });
        zipfile.on('error', reject);
      });
    }).catch(reject);
  });
}

async function cleanupTemp(tempPath) {
  try {
    await fs.rm(tempPath, { recursive: true, force: true });
    console.log(`🧹 Cleaned up ${tempPath}`);
  } catch (error) {
    console.warn(`⚠️ Failed to cleanup ${tempPath}:`, error.message);
  }
}

module.exports = { cloneRepo, extractZip, cleanupTemp };