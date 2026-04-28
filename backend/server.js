import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import analyzeRouter from './routes/analyze.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

app.use('/api/analyze', analyzeRouter);

app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'CodeSplit AI Backend Running',
    timestamp: new Date().toISOString()
  });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    error: 'Something went wrong!',
    message: err.message 
  });
});

app.listen(PORT, () => {
  console.log(`🚀 CodeSplit AI Backend Running`);
  console.log(`📍 Port: ${PORT}`);
  console.log(`🏥 Health: http://localhost:${PORT}/health`);
  console.log(`⚡ API: http://localhost:${PORT}/api/analyze`);
  console.log('');
  
  // Check API key status
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'REPLACE_WITH_YOUR_GEMINI_API_KEY') {
    console.log('⚠️  WARNING: Gemini API key not configured!');
    console.log('📝 Edit backend/.env and set GEMINI_API_KEY');
    console.log('🔗 Get a free key from: https://aistudio.google.com/app/apikey');
    console.log('');
    console.log('✅ App will run with FALLBACK RESPONSES for demo safety');
  } else {
    console.log('✅ Gemini API key detected (gemini-2.5-flash)');
  }
  console.log('');
});
