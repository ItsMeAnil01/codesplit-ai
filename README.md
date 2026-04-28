# CodeSplit AI 🔀

**AI-Powered PR Decomposition Tool**

Transform giant, unreviewable pull requests into logical, dependency-ordered chunks in seconds.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn
- OpenAI API key ([Get one here](https://platform.openai.com/api-keys))

### Installation

```bash
# 1. Extract the archive
tar -xzf codesplit-ai.tar.gz
cd codesplit-ai

# 2. Setup Backend
cd backend
npm install

# 3. Configure API Key
# Edit backend/.env and add your OpenAI API key:
# OPENAI_API_KEY=sk-proj-YOUR_KEY_HERE

# 4. Start Backend
npm run dev
# Should see: 🚀 CodeSplit AI Backend Running

# 5. Setup Frontend (new terminal)
cd ../frontend
npm install
npm run dev
# Should see: Local: http://localhost:3000
```

### First Test

1. Open http://localhost:3000
2. Click **"Load Example"**
3. Click **"Analyze Split Strategy"**  
4. See results in ~3-5 seconds ✨

## 🎯 Features

- ⚡ **3-Second Analysis** - AI-powered dependency detection
- 🎨 **Beautiful UI** - Modern, responsive design
- 🛡️ **Fallback Mode** - Works even without API key (demo mode)
- 📊 **Risk Assessment** - LOW/MEDIUM/HIGH per PR chunk
- ⏱️ **Time Estimates** - Review time for each chunk
- 📥 **Export Results** - Download as JSON

## 💰 Cost

- ~$0.001 per analysis with GPT-4o-mini
- $5 free credit for new OpenAI accounts
- Fallback mode: $0 (uses rule-based logic)

## 🏗️ Architecture
