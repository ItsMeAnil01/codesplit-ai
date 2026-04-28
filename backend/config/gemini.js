import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

dotenv.config();

const apiKey = process.env.GEMINI_API_KEY;

export const hasValidApiKey = () => {
  return apiKey && apiKey !== 'REPLACE_WITH_YOUR_GEMINI_API_KEY' && apiKey.length > 10;
};

let genAI = null;

if (hasValidApiKey()) {
  genAI = new GoogleGenerativeAI(apiKey);
  console.log('✅ Gemini client initialized (gemini-2.5-flash)');
} else {
  console.log('⚠️  Gemini client NOT initialized - using fallback mode');
}

export default genAI;
