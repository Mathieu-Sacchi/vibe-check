# VibeCheck - Fullstack Security Analysis Tool

A comprehensive security analysis tool that scans code repositories for vulnerabilities, code quality issues, and best practice violations. Features both automated security scanners and AI-powered analysis as a fallback.

## 🚀 Features

### Backend
- **Multiple Analysis Methods**: GitHub URL cloning or ZIP file upload
- **Security Scanners**: Semgrep, Gitleaks, ESLint integration
- **AI Fallback**: OpenAI-powered analysis when scanners aren't available
- **Comprehensive Reporting**: Detailed issues with severity levels and fix recommendations
- **Cursor IDE Integration**: Copy-pasteable prompts for easy fixes

### Frontend
- **Modern UI**: Beautiful gradient design with responsive layout
- **Dual Input Methods**: GitHub URL or ZIP file upload
- **Real-time Analysis**: Progress indicators and toast notifications
- **Detailed Results**: Score display, issue breakdown, and copy-to-clipboard functionality
- **Professional Design**: Card-based layout with color-coded severity indicators

## 🛠 Installation

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn
- Optional: Security scanners (semgrep, gitleaks, eslint) for enhanced analysis

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create environment file:
```bash
cp .env.example .env
```

4. Configure your `.env` file:
```bash
# OpenAI API Configuration
OPENAI_API_KEY=your_openai_api_key_here

# Server Configuration
PORT=4000
NODE_ENV=development

# Frontend URL for CORS
FRONTEND_URL=http://localhost:5173
```

5. Start the backend server:
```bash
npm run dev
```

The backend will be running at `http://localhost:4000`

### Frontend Setup

1. In the root directory, install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

The frontend will be running at `http://localhost:5173`

## 📖 Usage

### Web Interface

1. Open your browser and navigate to `http://localhost:5173`
2. Choose one of two input methods:
   - **GitHub URL**: Enter a public GitHub repository URL
   - **ZIP Upload**: Upload a ZIP file containing your code
3. Click "Analyze Repository"
4. Review the security score and detailed issue breakdown
5. Use the "Copy" buttons to get Cursor IDE prompts for fixing issues

### API Endpoints

#### Analyze Repository
```bash
POST /analyze
```

**With GitHub URL:**
```bash
curl -X POST http://localhost:4000/analyze \
  -H "Content-Type: application/json" \
  -d '{"githubUrl":"https://github.com/username/repository"}'
```

**With ZIP File:**
```bash
curl -X POST http://localhost:4000/analyze \
  -F "repo=@/path/to/project.zip"
```

**Response Format:**
```json
{
  "score": 85,
  "summary": "Repository has good security practices with minor issues",
  "issues": [
    {
      "category": "security",
      "severity": "high",
      "file": "src/auth.js",
      "description": "JWT token not properly validated",
      "recommendation": "Add proper JWT verification with secret validation",
      "cursor_prompt": "Fix JWT middleware by adding jwt.verify(token, secret) with proper error handling"
    }
  ],
  "analyzedAt": "2025-01-09T10:30:00Z",
  "source": "https://github.com/username/repository"
}
```

#### Health Check
```bash
GET /health
```

Returns server status and basic information.

## 🔧 Configuration

### Security Scanners

For enhanced analysis, install these optional security scanners:

**Semgrep** (Static analysis):
```bash
pip install semgrep
```

**Gitleaks** (Secret detection):
```bash
# macOS
brew install gitleaks

# Linux
wget https://github.com/zricethezav/gitleaks/releases/download/v8.15.2/gitleaks_8.15.2_linux_x64.tar.gz
tar -xzf gitleaks_8.15.2_linux_x64.tar.gz
sudo mv gitleaks /usr/local/bin/
```

**ESLint** (JavaScript/TypeScript):
```bash
npm install -g eslint
```

### OpenAI Configuration

1. Get an API key from [OpenAI](https://platform.openai.com/api-keys)
2. Add it to your `.env` file:
```bash
OPENAI_API_KEY=sk-your-api-key-here
```

## 🏗 Architecture

### Backend Structure
```
backend/
├── server.js              # Express server setup
├── routes/
│   └── analyze.js         # Main analysis endpoint
├── services/
│   ├── scanners.js        # Security scanner integrations
│   └── ai.js             # OpenAI API service
├── utils/
│   └── fileManager.js    # Git cloning and ZIP extraction
└── package.json
```

### Frontend Structure
```
src/
├── App.tsx               # Main application component
├── main.tsx             # React entry point
├── index.css            # Tailwind CSS imports
└── vite-env.d.ts        # TypeScript definitions
```

## 📊 Analysis Categories

- **Security**: Vulnerabilities, authentication issues, input validation
- **Performance**: Code efficiency, resource usage, optimization opportunities
- **Quality**: Code maintainability, best practices, style issues
- **Compliance**: Standards adherence, documentation, testing coverage
- **Dependencies**: Outdated packages, known vulnerabilities

## 🎯 Severity Levels

- **Critical**: Immediate security risks requiring urgent attention
- **High**: Significant issues that should be addressed soon
- **Medium**: Important improvements for better security/quality
- **Low**: Minor issues and suggestions for enhancement

## 🚀 Deployment

### Backend Deployment
The backend can be deployed to any Node.js hosting service:
- Heroku
- Railway
- Render
- DigitalOcean App Platform

### Frontend Deployment
The frontend can be deployed to static hosting services:
- Vercel
- Netlify
- GitHub Pages
- Cloudflare Pages

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🔍 Troubleshooting

### Common Issues

**CORS Errors**: Ensure the backend is running on port 4000 and the frontend on 5173, or update the CORS configuration in `backend/server.js`.

**OpenAI API Errors**: Verify your API key is valid and has sufficient credits.

**Scanner Not Found**: Install the required scanners or the system will fallback to AI analysis.

**File Upload Issues**: Ensure ZIP files are under 100MB and contain valid source code.

### Debug Mode

Enable debug logging by setting `NODE_ENV=development` in your `.env` file.

## 📞 Support

For issues and questions:
1. Check the troubleshooting section above
2. Review the GitHub issues
3. Create a new issue with detailed information about your problem

---

Built with ❤️ for developers who care about security and code quality.