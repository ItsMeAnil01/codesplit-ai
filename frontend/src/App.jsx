import { useState, useEffect } from 'react';
import { analyzePR } from './api';
import InputSection from './components/InputSection';
import AnalysisResult from './components/AnalysisResult';

const EXAMPLE_DIFF = `diff --git a/src/database/migrations/001_create_users.sql b/src/database/migrations/001_create_users.sql
new file mode 100644
index 0000000..a1b2c3d
--- /dev/null
+++ b/src/database/migrations/001_create_users.sql
@@ -0,0 +1,18 @@
+-- User authentication table
+CREATE TABLE users (
+  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
+  email VARCHAR(255) UNIQUE NOT NULL,
+  password_hash VARCHAR(255) NOT NULL,
+  full_name VARCHAR(255),
+  created_at TIMESTAMP DEFAULT NOW(),
+  updated_at TIMESTAMP DEFAULT NOW(),
+  last_login TIMESTAMP,
+  is_active BOOLEAN DEFAULT true,
+  role VARCHAR(50) DEFAULT 'user'
+);
+
+CREATE INDEX idx_users_email ON users(email);
+CREATE INDEX idx_users_created_at ON users(created_at);

diff --git a/src/models/User.js b/src/models/User.js
new file mode 100644
index 0000000..f8e9a1b
--- /dev/null
+++ b/src/models/User.js
@@ -0,0 +1,67 @@
+import bcrypt from 'bcrypt';
+import { pool } from '../database/connection.js';
+
+class User {
+  constructor(data) {
+    this.id = data.id;
+    this.email = data.email;
+    this.fullName = data.full_name;
+    this.role = data.role;
+    this.createdAt = data.created_at;
+  }
+
+  static async findByEmail(email) {
+    const result = await pool.query(
+      'SELECT * FROM users WHERE email = $1',
+      [email]
+    );
+    return result.rows[0] ? new User(result.rows[0]) : null;
+  }
+
+  static async create({ email, password, fullName }) {
+    const passwordHash = await bcrypt.hash(password, 10);
+    const result = await pool.query(
+      \`INSERT INTO users (email, password_hash, full_name) 
+       VALUES ($1, $2, $3) RETURNING *\`,
+      [email, passwordHash, fullName]
+    );
+    return new User(result.rows[0]);
+  }
+
+  async verifyPassword(password) {
+    const result = await pool.query(
+      'SELECT password_hash FROM users WHERE id = $1',
+      [this.id]
+    );
+    return bcrypt.compare(password, result.rows[0].password_hash);
+  }
+}
+
+export default User;

diff --git a/src/routes/auth.js b/src/routes/auth.js
new file mode 100644
index 0000000..c8f7e2a
--- /dev/null
+++ b/src/routes/auth.js
@@ -0,0 +1,89 @@
+import express from 'express';
+import jwt from 'jsonwebtoken';
+import User from '../models/User.js';
+import { validateEmail, validatePassword } from '../utils/validation.js';
+
+const router = express.Router();
+
+const JWT_SECRET = process.env.JWT_SECRET || 'temp-secret-key';
+
+router.post('/register', async (req, res) => {
+  try {
+    const { email, password, fullName } = req.body;
+
+    if (!validateEmail(email)) {
+      return res.status(400).json({ error: 'Invalid email format' });
+    }
+
+    if (!validatePassword(password)) {
+      return res.status(400).json({ 
+        error: 'Password must be at least 8 characters' 
+      });
+    }
+
+    const existingUser = await User.findByEmail(email);
+    if (existingUser) {
+      return res.status(409).json({ error: 'Email already registered' });
+    }
+
+    const user = await User.create({ email, password, fullName });
+    const token = jwt.sign(
+      { userId: user.id, email: user.email },
+      JWT_SECRET,
+      { expiresIn: '7d' }
+    );
+
+    res.status(201).json({
+      message: 'Registration successful',
+      token,
+      user: { id: user.id, email: user.email, fullName: user.fullName }
+    });
+  } catch (error) {
+    console.error('Registration error:', error);
+    res.status(500).json({ error: 'Registration failed' });
+  }
+});

diff --git a/src/utils/validation.js b/src/utils/validation.js
new file mode 100644
index 0000000..b8c9e5f
--- /dev/null
+++ b/src/utils/validation.js
@@ -0,0 +1,12 @@
+export function validateEmail(email) {
+  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
+  return emailRegex.test(email);
+}
+
+export function validatePassword(password) {
+  return password && password.length >= 8;
+}

diff --git a/tests/auth.test.js b/tests/auth.test.js
new file mode 100644
index 0000000..a7f9c2e
--- /dev/null
+++ b/tests/auth.test.js
@@ -0,0 +1,52 @@
+import { describe, it, expect, beforeEach } from 'vitest';
+import request from 'supertest';
+import app from '../src/server.js';
+
+describe('Authentication Routes', () => {
+  it('should register a new user', async () => {
+    const response = await request(app)
+      .post('/api/auth/register')
+      .send({ email: 'test@example.com', password: 'password123', fullName: 'Test User' });
+    expect(response.status).toBe(201);
+    expect(response.body).toHaveProperty('token');
+  });
+});`;

// Toast system
let toastIdCounter = 0;
let toastListeners = [];
const toastAPI = {
  add: (msg, type = 'success') => {
    const id = ++toastIdCounter;
    toastListeners.forEach(fn => fn({ id, msg, type, add: true }));
    setTimeout(() => {
      toastListeners.forEach(fn => fn({ id, remove: true }));
    }, 3000);
  },
  subscribe: (fn) => { toastListeners.push(fn); return () => { toastListeners = toastListeners.filter(l => l !== fn); }; }
};

function ToastContainer() {
  const [toasts, setToasts] = useState([]);
  useEffect(() => {
    return toastAPI.subscribe(({ id, msg, type, add, remove }) => {
      if (add) setToasts(t => [...t, { id, msg, type }]);
      if (remove) setToasts(t => t.filter(x => x.id !== id));
    });
  }, []);
  return (
    <div className="toast-container">
      {toasts.map(t => (
        <div key={t.id} className="toast">
          <span>{t.type === 'success' ? '✓' : '⚠'}</span>
          {t.msg}
        </div>
      ))}
    </div>
  );
}

const FEATURES = [
  { icon: '⚡', label: 'AI-Powered Splitting' },
  { icon: '🔗', label: 'Dependency Ordering' },
  { icon: '⏱', label: 'Review Time Estimate' },
  { icon: '🛡', label: 'Risk Assessment' },
];

function App() {
  const [diffContent, setDiffContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingStatus, setLoadingStatus] = useState('');
  const [analysis, setAnalysis] = useState(null);
  const [error, setError] = useState(null);

  const handleAnalyze = async () => {
    if (!diffContent.trim()) { setError('Please paste your diff content first.'); return; }
    if (diffContent.length > 15000) { setError('Diff too large — please limit to ~1000 lines.'); return; }

    setLoading(true);
    setError(null);
    setAnalysis(null);

    const steps = [
      'Parsing diff structure…',
      'Analysing file dependencies…',
      'Grouping related changes…',
      'Estimating review complexity…',
      'Finalising split strategy…',
    ];
    let i = 0;
    const interval = setInterval(() => {
      if (i < steps.length) setLoadingStatus(steps[i++]);
    }, 900);

    try {
      const result = await analyzePR(diffContent);
      clearInterval(interval);
      if (result.success) {
        setAnalysis(result.data);
        setLoadingStatus('');
      } else {
        setError(result.message || result.error);
      }
    } catch (err) {
      clearInterval(interval);
      setError('Unexpected error — please try again.');
      console.error(err);
    } finally {
      setLoading(false);
      setLoadingStatus('');
    }
  };

  return (
    <>
      {/* Animated mesh background */}
      <div className="bg-mesh" aria-hidden="true" />

      <div className="relative z-10 min-h-screen flex flex-col">
        {/* ── Nav ───────────────────────── */}
        <nav className="sticky top-0 z-50 border-b border-white/5 backdrop-blur-xl bg-[#030712]/70">
          <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-lg shadow-lg shadow-indigo-500/30">
                🔀
              </div>
              <span className="font-bold text-lg tracking-tight text-white">
                Code<span className="gradient-text">Split</span> AI
              </span>
            </div>
            <div className="flex items-center gap-3">
              <span className="badge risk-low text-xs hidden sm:inline-flex">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Live
              </span>
              <span className="text-xs text-slate-500 font-mono hidden md:block">HackIndia Spark 7</span>
            </div>
          </div>
        </nav>

        {/* ── Hero ──────────────────────── */}
        <section className="max-w-6xl mx-auto w-full px-6 pt-16 pb-12 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-indigo-500/20 bg-indigo-500/8 text-indigo-300 text-xs font-semibold tracking-widest uppercase mb-8 animate-fade-in">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
            AI-Powered PR Decomposer
          </div>

          <h1 className="hero-title text-5xl md:text-6xl lg:text-7xl font-black tracking-tight text-white leading-[1.08] mb-6">
            Make giant PRs<br />
            <span className="gradient-text">reviewable</span> in seconds
          </h1>

          <p className="text-slate-400 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed mb-10">
            Paste any git diff and get an AI-generated split strategy — ordered by dependency,
            with risk scores and estimated review times.
          </p>

          <div className="flex flex-wrap justify-center gap-3 mb-12">
            {FEATURES.map(f => (
              <div key={f.label} className="feature-pill">
                <span>{f.icon}</span>
                {f.label}
              </div>
            ))}
          </div>
        </section>

        {/* ── Main card ─────────────────── */}
        <main className="max-w-6xl mx-auto w-full px-6 pb-20 flex-1">
          <div className="glass-card rounded-3xl overflow-hidden glow-ring section-enter">
            <InputSection
              diffContent={diffContent}
              setDiffContent={setDiffContent}
              onAnalyze={handleAnalyze}
              onLoadExample={() => setDiffContent(EXAMPLE_DIFF)}
              loading={loading}
              loadingStatus={loadingStatus}
            />

            {/* Error state */}
            {error && (
              <div className="mx-6 mb-6 flex items-start gap-4 p-5 rounded-2xl bg-red-500/8 border border-red-500/20 section-enter">
                <div className="w-9 h-9 rounded-xl bg-red-500/15 flex items-center justify-center flex-shrink-0 text-red-400 text-lg">
                  ✕
                </div>
                <div>
                  <p className="font-semibold text-red-400 mb-0.5">Analysis failed</p>
                  <p className="text-sm text-red-400/70">{error}</p>
                </div>
                <button
                  onClick={() => setError(null)}
                  className="ml-auto text-red-500/60 hover:text-red-400 transition-colors text-lg"
                >×</button>
              </div>
            )}

            {/* Result */}
            {analysis && (
              <AnalysisResult analysis={analysis} toastAPI={toastAPI} />
            )}
          </div>
        </main>

        {/* ── Footer ────────────────────── */}
        <footer className="border-t border-white/5 py-8">
          <div className="max-w-6xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-slate-600 text-sm">
              Built with ❤️ by <span className="text-slate-400 font-medium">Team CodeSplit</span>
            </p>
            <p className="text-slate-700 text-xs font-mono">
              Powered by Gemini 2.5 Flash
            </p>
          </div>
        </footer>
      </div>

      <ToastContainer />
    </>
  );
}

export default App;