# VibeCheck

AI-powered GitHub repository audit tool using Claude Code SDK.

## Quick Start

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up environment:**
   ```bash
   cp .env.example .env
   # Edit .env with your Claude API key
   ```

3. **Run development server:**
   ```bash
   npm run dev
   ```

4. **Test the API:**
   ```bash
   curl http://localhost:3000/health
   ```

## Scripts

- `npm run dev` - Start development server with hot reload
- `npm run start` - Start production server
- `npm run build` - Build TypeScript to JavaScript
- `npm run lint` - Run ESLint
- `npm run format` - Format code with Prettier

## API Endpoints

- `GET /health` - Health check
- `GET /health?repo=<github-url>` - Test repository cloning (returns path and file count)
- `POST /audit` - Audit a GitHub repository (coming soon)

## Testing Repository Cloning

To test the `cloneRepo` function:

```bash
# Start the server
npm run dev

# Test cloning a small public repo
curl "http://localhost:3000/health?repo=https://github.com/octocat/Hello-World"
```

Response:
```json
{
  "status": "ok",
  "timestamp": "2025-07-26T11:40:00.000Z",
  "repo": "https://github.com/octocat/Hello-World",
  "path": "/tmp/vibe-abc123-def456",
  "files": 3
}
```

## Project Structure

```
src/           # Source code
services/      # Business logic services
prompts/       # Claude prompt templates
build/         # Compiled JavaScript (generated)
```

## Demo Goal

Drop a GitHub repository URL → get AI-generated audit report covering:
- Secrets & sensitive data
- Security vulnerabilities  
- Code quality assessment
- Documentation review
