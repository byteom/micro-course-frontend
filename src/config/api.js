// API configuration - do not hardcode production URLs
const getApiBaseUrl = () => {
  const fromEnv = import.meta.env.VITE_API_BASE_URL;
  if (fromEnv) return fromEnv;

  // Safe fallback for local development only
  if (import.meta.env.DEV) {
    return 'http://localhost:4001/api';
  }

  // In production, use relative path so rewrites proxy to backend
  return '/api';
};

export const API_BASE_URL = getApiBaseUrl();

// Minimal logging without exposing secrets/URLs in
if (import.meta.env.DEV) {
  console.log('API configured for development');
}
