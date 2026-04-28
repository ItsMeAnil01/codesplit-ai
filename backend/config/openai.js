import OpenAI from 'openai';
import dotenv from 'dotenv';

dotenv.config();

const apiKey = process.env.OPENAI_API_KEY;

// Check if API key is configured
export const hasValidApiKey = () => {
  return apiKey && 
         apiKey !== 'REPLACE_WITH_YOUR_OPENAI_API_KEY' && 
         apiKey.startsWith('sk-');
};

let openai = null;

if (hasValidApiKey()) {
  openai = new OpenAI({
    apiKey: apiKey,
  });
  console.log('✅ OpenAI client initialized');
} else {
  console.log('⚠️  OpenAI client NOT initialized - using fallback mode');
}

export default openai;
