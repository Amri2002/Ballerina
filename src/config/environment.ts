// Environment configuration
export const config = {
  // API Configuration - Use CORS proxy on port 3002 which forwards to Ballerina backend on port 3001
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3002/api',
  
  // App Configuration
  appName: 'CodeVista',
  appVersion: '1.0.0',
  
  // Feature Flags
  features: {
    enableSignup: true,
    enableSocialLogin: false,
    enablePasswordReset: false,
  },
  
  // Development/Production
  isDevelopment: import.meta.env.DEV,
  isProduction: import.meta.env.PROD,
};

// Environment variables
export const env = {
  VITE_API_BASE_URL: import.meta.env.VITE_API_BASE_URL,
  VITE_APP_NAME: import.meta.env.VITE_APP_NAME,
  VITE_APP_VERSION: import.meta.env.VITE_APP_VERSION,
};
