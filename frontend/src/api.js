import axios from 'axios';

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  }
});

export const analyzePR = async (diffContent) => {
  try {
    const response = await API.post('/api/analyze', { diffContent });
    return { success: true, data: response.data };
  } catch (error) {
    if (error.response) {
      return {
        success: false,
        error: error.response.data.error || 'Analysis failed',
        message: error.response.data.message || error.response.data.details
      };
    } else if (error.request) {
      return {
        success: false,
        error: 'Network error',
        message: 'Could not connect to server. Is the backend running?'
      };
    } else {
      return {
        success: false,
        error: 'Request failed',
        message: error.message
      };
    }
  }
};

export default API;