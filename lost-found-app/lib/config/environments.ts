/**
 * MONOLITHIC APPLICATION LAYER: /config
 * 
 * Environment Configuration
 * Centralized environment variable management and validation
 */

export const ENV = {
  // Database
  DATABASE_URL: process.env.DATABASE_URL || '',

  // JWT
  JWT_SECRET: process.env.JWT_SECRET || 'your-secret-key-change-in-production',

  // Cloudinary
  CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME || '',
  CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY || '',
  CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET || '',

  // Application
  NODE_ENV: process.env.NODE_ENV || 'development',
  APP_URL: process.env.APP_URL || 'http://localhost:3000',

  // API
  API_BASE_URL: process.env.API_BASE_URL || 'http://localhost:3000/api',
} as const;

/**
 * Validates that all required environment variables are set
 */
export function validateEnvironment(): void {
  const required = ['DATABASE_URL', 'JWT_SECRET'];
  const missing = required.filter(
    (key) => !process.env[key]
  );

  if (missing.length > 0) {
    console.warn(`Missing environment variables: ${missing.join(', ')}`);
  }
}

export default ENV;
