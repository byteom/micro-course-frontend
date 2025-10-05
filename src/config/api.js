// API configuration - do not hardcode production URLs
const getApiBaseUrl = () => {
  const fromEnv = import.meta.env.VITE_API_BASE_URL;
  if (fromEnv) return fromEnv;

  // Safe fallback for local development only
  if (import.meta.env.DEV) {
    return 'http://localhost:5000/api';
  }

  // In production, require explicit configuration
  console.error('API base URL is not configured. Set VITE_API_BASE_URL.');
  return '';
};

export const API_BASE_URL = getApiBaseUrl();

// Minimal logging without exposing secrets/URLs in production
if (import.meta.env.DEV) {
  console.log('API configured for development');
}
