// Dynamic API URL selector for Local vs Production environments
const getApiUrl = () => {
  const hostname = window.location.hostname;
  
  // If running locally on PC or mobile via local network, use the local IP backend
  if (hostname === 'localhost' || hostname === '127.0.0.1' || hostname.startsWith('192.168.')) {
    return `http://${hostname}:5000/api`;
  }
  
  // PRODUCTION BACKEND URL: Replace this URL with your actual Render.com URL after deploying
  return 'https://ev-navigator-backend-ujwala.onrender.com/api';
};

export const API_BASE_URL = getApiUrl();
export const API_BASE_URL_WITHOUT_SUFFIX = API_BASE_URL.replace('/api', '');
