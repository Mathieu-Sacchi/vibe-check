// Audit prompt templates for Claude Code SDK

export const AUDIT_PROMPTS = {
  secrets: `
    Analyze this repository for potential secrets, API keys, and sensitive information.
    Look for:
    - Hardcoded API keys, tokens, passwords
    - Database connection strings
    - Private keys or certificates
    - Email addresses and personal information
    
    Provide a security assessment with severity levels and recommendations.
  `,
  
  security: `
    Perform a security audit of this repository.
    Examine:
    - Dependency vulnerabilities
    - Insecure coding patterns
    - Authentication and authorization issues
    - Input validation problems
    - HTTPS usage and security headers
    
    Rate security issues by severity and provide actionable fixes.
  `,
  
  quality: `
    Assess the code quality of this repository.
    Evaluate:
    - Code structure and organization
    - Naming conventions and readability
    - Code duplication and complexity
    - Error handling patterns
    - Performance considerations
    
    Provide a quality score and improvement suggestions.
  `,
  
  documentation: `
    Review the documentation quality of this repository.
    Check for:
    - README completeness and clarity
    - Code comments and inline documentation
    - API documentation
    - Setup and installation instructions
    - Usage examples and guides
    
    Rate documentation quality and suggest improvements.
  `,
} as const;
