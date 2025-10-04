// API Configuration - Production Only
const getApiBaseUrl = () => {
  // Always use environment variable first for security
  if (import.meta.env.VITE_API_BASE_URL) {
    return import.meta.env.VITE_API_BASE_URL;
  }
  
  // Production fallback - use deployed backend
  console.warn('⚠️ VITE_API_BASE_URL not set! Using production backend.');
  return 'https://micorcourses-backend.onrender.com/api';
};

export const API_BASE_URL = getApiBaseUrl();

// Log API configuration
if (import.meta.env.DEV) {
  console.log('🔗 API Base URL:', API_BASE_URL);
} else {
  console.log('✅ API configured for production');
}
