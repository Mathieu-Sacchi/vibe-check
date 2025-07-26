import simpleGit, { SimpleGit } from 'simple-git';
import { v4 as uuidv4 } from 'uuid';
import { tmpdir } from 'os';
import { join } from 'path';
import { promises as fs } from 'fs';

/**
 * Clones a GitHub repository to a temporary directory using shallow clone
 * @param url - The GitHub repository URL to clone
 * @returns Promise<string> - The absolute path to the cloned directory
 */
export async function cloneRepo(url: string): Promise<string> {
  console.log(`Starting clone of repository: ${url}`);
  
  // Generate UUID-based temp directory
  const repoId = uuidv4();
  const tempDir = join(tmpdir(), `vibe-${repoId}`);
  
  console.log(`Creating temp directory: ${tempDir}`);
  
  try {
    // Ensure temp directory exists
    await fs.mkdir(tempDir, { recursive: true });
    
    // Initialize simple-git
    const git: SimpleGit = simpleGit();
    
    console.log('Performing shallow clone with blob filtering...');
    
    // Perform shallow clone with blob filtering for faster cloning
    await git.clone(url, tempDir, [
      '--depth=1',           // Only clone the latest commit
      '--filter=blob:none',  // Skip downloading blob contents initially
      '--single-branch'      // Only clone the default branch
    ]);
    
    console.log(`Successfully cloned repository to: ${tempDir}`);
    
    // Verify the clone was successful by checking for .git directory
    const gitDir = join(tempDir, '.git');
    await fs.access(gitDir);
    
    console.log('Clone verification successful - .git directory found');
    
    return tempDir;
    
  } catch (error) {
    console.error(`Failed to clone repository ${url}:`, error);
    
    // Cleanup on failure
    try {
      await fs.rm(tempDir, { recursive: true, force: true });
      console.log('Cleaned up temp directory after failure');
    } catch (cleanupError) {
      console.warn('Failed to cleanup temp directory:', cleanupError);
    }
    
    throw new Error(`Repository clone failed: ${error}`);
  }
}

/**
 * Counts the number of files in a directory recursively
 * @param dirPath - Path to the directory to count files in
 * @returns Promise<number> - Total number of files
 */
export async function countFiles(dirPath: string): Promise<number> {
  let fileCount = 0;
  
  const scanDirectory = async (dir: string): Promise<void> => {
    try {
      const entries = await fs.readdir(dir, { withFileTypes: true });
      
      for (const entry of entries) {
        if (entry.name.startsWith('.git')) continue; // Skip .git directory
        
        const fullPath = join(dir, entry.name);
        
        if (entry.isDirectory()) {
          await scanDirectory(fullPath);
        } else {
          fileCount++;
        }
      }
    } catch (error) {
      console.warn(`Error scanning directory ${dir}:`, error);
    }
  };
  
  await scanDirectory(dirPath);
  return fileCount;
}

/**
 * Cleanup a cloned repository directory
 * @param repoPath - Path to the repository directory to cleanup
 */
export async function cleanupRepo(repoPath: string): Promise<void> {
  try {
    await fs.rm(repoPath, { recursive: true, force: true });
    console.log(`Cleaned up repository directory: ${repoPath}`);
  } catch (error) {
    console.warn(`Failed to cleanup repository at ${repoPath}:`, error);
  }
}
