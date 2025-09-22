/**
 * API Configuration
 * 
 * Configuration settings for API endpoints and environment-specific values
 */

// Default API configuration
export const API_CONFIG = {
  // Base URL for the DevClimb backend API
  // In production, this should be your deployed backend URL
  // For local development, use http://localhost:8000 (or your FastAPI server port)
BASE_URL: process.env.EXPO_PUBLIC_API_URL || 'http://172.17.44.64:8000',
//BASE_URL: 'https://izoghizd36.execute-api.us-east-1.amazonaws.com',
  
  // API endpoints
  ENDPOINTS: {
    GENERATE_ROADMAP: '/generate-roadmap',
    HEALTH_CHECK: '/',
    DETAILED_HEALTH: '/health',
  },
  
  // Request configuration
  TIMEOUT: 30000, // 30 seconds
  RETRY_ATTEMPTS: 3,
  
  // Debug mode
  DEBUG: process.env.EXPO_PUBLIC_DEBUG_MODE === 'true',
};

// Available target roles for the roadmap generation
export const TARGET_ROLES = {
  FRONTEND_ENGINEER: 'frontend_engineer',
  BACKEND_ENGINEER: 'backend_engineer',
  FULL_STACK_ENGINEER: 'full_stack_engineer',
  MOBILE_ENGINEER: 'mobile_engineer',
  CLOUD_DEVOPS_ENGINEER: 'cloud_devops_engineer',
  DATA_ENGINEERING_ENGINEER: 'data_engineering_engineer',
  ML_AI_ENGINEER: 'ml_ai_engineer',
  CYBERSECURITY_ENGINEER: 'cybersecurity_engineer',
  QA_TEST_AUTOMATION_ENGINEER: 'qa_test_automation_engineer',
  GAME_DEVELOPMENT_ENGINEER: 'game_development_engineer',
  EMBEDDED_IOT_ENGINEER: 'embedded_iot_engineer',
  AR_VR_XR_ENGINEER: 'ar_vr_xr_engineer',
  DATABASE_ADMIN_ENGINEER: 'database_admin_engineer',
} as const;

// Type for target roles
export type TargetRole = typeof TARGET_ROLES[keyof typeof TARGET_ROLES];

// Helper function to get formatted role names
export const getRoleDisplayName = (role: string): string => {
  return role
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

// Helper function to validate if a role is supported
export const isValidTargetRole = (role: string): role is TargetRole => {
  return Object.values(TARGET_ROLES).includes(role as TargetRole);
};

// Environment-specific configurations
export const ENV_CONFIG = {
  isDevelopment: __DEV__,
  isProduction: !__DEV__,
  
  // Logging configuration
  enableAPILogging: API_CONFIG.DEBUG || __DEV__,
  enableErrorReporting: !__DEV__,
  
  // Feature flags
  enableOfflineMode: false,
  enableAnalytics: !__DEV__,
};

export default API_CONFIG;

