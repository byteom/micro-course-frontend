// API Configuration - Optimized for Vercel Deployment
const getApiBaseUrl = () => {
  // Check for Vercel-specific environment variables first
  if (import.meta.env.VITE_API_BASE_URL) {
    return import.meta.env.VITE_API_BASE_URL;
  }
  
  // Check for Vercel environment context
  const vercelEnv = import.meta.env.VITE_VERCEL_ENV || import.meta.env.VERCEL_ENV;
  
  // Development environment
  if (import.meta.env.DEV) {
    console.log('🔧 Development mode detected');
    return 'http://localhost:5000/api';
  }
  
  // Vercel Preview deployments
  if (vercelEnv === 'preview') {
    console.log('🔍 Vercel preview deployment detected');
    return 'https://micorcourses-backend.onrender.com/api';
  }
  
  // Production fallback - use deployed backend
  console.log('🚀 Production deployment detected');
  return 'https://micorcourses-backend.onrender.com/api';
};

export const API_BASE_URL = getApiBaseUrl();

// Enhanced logging for different environments
if (import.meta.env.DEV) {
  console.log('🔗 API Base URL (Development):', API_BASE_URL);
  console.log('📋 Environment Variables:', {
    NODE_ENV: import.meta.env.MODE,
    VITE_API_BASE_URL: import.meta.env.VITE_API_BASE_URL,
    VERCEL_ENV: import.meta.env.VITE_VERCEL_ENV || import.meta.env.VERCEL_ENV
  });
} else {
  console.log('✅ API configured for production deployment');
  console.log('🌐 Using API endpoint:', API_BASE_URL);
}
