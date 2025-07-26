# VibeCheck Setup Guide

## 🚀 Quick Start

The VibeCheck application is now fixed and ready to use! Here's how to get it running:

### Prerequisites
- Node.js (v18 or higher)
- npm

### 1. Install Dependencies

```bash
# Install frontend dependencies
npm install

# Install backend dependencies
cd backend
npm install
cd ..
```

### 2. Start the Application

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
npm run dev
```

### 3. Access the Application

- Frontend: http://localhost:5173
- Backend: http://localhost:4000

## 🔧 Configuration

### OpenAI API (Optional)

For enhanced AI-powered analysis, add your OpenAI API key:

1. Get an API key from [OpenAI](https://platform.openai.com/api-keys)
2. Edit `backend/.env`:
```bash
OPENAI_API_KEY=your_actual_api_key_here
```

### Security Scanners (Optional)

For enhanced analysis, install these tools:

**Semgrep:**
```bash
pip install semgrep
```

**Gitleaks:**
```bash
# macOS
brew install gitleaks
```

## 🎯 How to Use

1. **Open the application** at http://localhost:5173
2. **Choose input method:**
   - Enter a GitHub repository URL, OR
   - Upload a ZIP file containing your code
3. **Click "Analyze Repository"**
4. **Review results:**
   - Security score (0-100)
   - Detailed issues with severity levels
   - Copy-pasteable prompts for Cursor IDE

## 🐛 Issues Fixed

- ✅ Missing frontend dependencies (axios, react-hot-toast)
- ✅ Form submission preventing page refresh
- ✅ Missing temp_uploads directory
- ✅ Environment configuration
- ✅ Better error handling for missing OpenAI API key
- ✅ Proper CORS configuration

## 🔍 Troubleshooting

**Page refreshes instead of analyzing:**
- ✅ Fixed - Form now prevents default submission

**"OpenAI API key" errors:**
- ✅ Fixed - App now provides helpful fallback analysis

**CORS errors:**
- ✅ Fixed - Backend properly configured for frontend

**File upload issues:**
- ✅ Fixed - Proper directory structure and error handling

## 📝 Notes

- The app works without OpenAI API key (uses basic analysis)
- Security scanners are optional (app falls back gracefully)
- All temporary files are automatically cleaned up
- Supports both GitHub URLs and ZIP file uploads

Enjoy using VibeCheck! 🎉 