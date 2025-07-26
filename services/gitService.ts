import simpleGit, { SimpleGit } from 'simple-git';
import { promises as fs } from 'fs';
import path from 'path';

export interface RepoInfo {
  url: string;
  localPath: string;
  files: string[];
}

export class GitService {
  private git: SimpleGit;

  constructor() {
    this.git = simpleGit();
  }

  async cloneRepository(repoUrl: string, targetDir: string): Promise<RepoInfo> {
    try {
      // Clone with depth 1 for faster cloning
      await this.git.clone(repoUrl, targetDir, ['--depth', '1']);
      
      // Get list of files
      const files = await this.getRepositoryFiles(targetDir);
      
      return {
        url: repoUrl,
        localPath: targetDir,
        files,
      };
    } catch (error) {
      throw new Error(`Failed to clone repository: ${error}`);
    }
  }

  private async getRepositoryFiles(repoPath: string): Promise<string[]> {
    const files: string[] = [];
    
    const scanDirectory = async (dir: string): Promise<void> => {
      const entries = await fs.readdir(dir, { withFileTypes: true });
      
      for (const entry of entries) {
        if (entry.name.startsWith('.')) continue; // Skip hidden files/dirs
        
        const fullPath = path.join(dir, entry.name);
        const relativePath = path.relative(repoPath, fullPath);
        
        if (entry.isDirectory()) {
          await scanDirectory(fullPath);
        } else {
          files.push(relativePath);
        }
      }
    };
    
    await scanDirectory(repoPath);
    return files;
  }

  async cleanup(repoPath: string): Promise<void> {
    try {
      await fs.rm(repoPath, { recursive: true, force: true });
    } catch (error) {
      console.warn(`Failed to cleanup repository at ${repoPath}:`, error);
    }
  }
}
