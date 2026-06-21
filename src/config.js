// Dynamic API URL selector for Local vs Production environments
const getApiUrl = () => {
  const hostname = window.location.hostname;
  
  // If running locally on PC or mobile via local network, use the local IP backend
  if (hostname === 'localhost' || hostname === '127.0.0.1' || hostname.startsWith('192.168.')) {
    return `http://${hostname}:5000/api`;
  }
  
  // PRODUCTION BACKEND URL: Reads from Vercel's Environment Variables (no code editing needed!)
  // Fallback defaults to a placeholder if not set
  return import.meta.env.VITE_API_URL || 'https://ev-navigator-backend-placeholder.onrender.com/api';
};

export const API_BASE_URL = getApiUrl();
export const API_BASE_URL_WITHOUT_SUFFIX = API_BASE_URL.replace('/api', '');
