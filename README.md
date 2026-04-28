# CodeSplit AI

**Team CodeSplit**

---

## 🚨 Problem Statement

In modern software development, large pull requests (PRs) often contain multiple changes across backend, frontend, and database layers. These PRs are difficult to review, leading to delayed feedback, shallow reviews, and bugs reaching production.

Developers are often asked to split large PRs, but doing so manually is complex, time-consuming, and error-prone due to interdependencies between changes.

---

## 💡 Solution

CodeSplit AI is an AI-powered tool that converts large pull requests into smaller, structured, dependency-aware chunks.

It helps developers:
- Understand complex changes quickly
- Review code in logical steps
- Reduce review time and errors

---

## ⚙️ Tech Stack

- **Frontend:** React + Vite  
- **Backend:** Node.js + Express  
- **AI Engine:** Google Gemini API  

---

## 🚀 How to Run

### 1. Clone the repository

```bash
git clone https://github.com/ItsMeAnil01/codesplit-ai.git
cd codesplit-ai

##2. Start Backend
cd backend
npm install
node server.js

Backend runs on:

http://localhost:5000
##3. Start Frontend
cd frontend
npm install
npm run dev

Frontend runs on:

http://localhost:3000
🎯 Core Features
PR splitting into logical units
Dependency-aware ordering
Risk level identification
Fallback system for reliability
