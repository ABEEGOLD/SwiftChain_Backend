import dotenv from 'dotenv';

dotenv.config();

const isTest = process.env.NODE_ENV === 'test';

interface EnvConfig {
  NODE_ENV: string;
  PORT: number;
  MONGODB_URI: string;
  JWT_SECRET: string;
  JWT_EXPIRES_IN: string;
  BCRYPT_ROUNDS: number;
  LOG_LEVEL: string;
  CORS_ORIGIN: string;
  RATE_LIMIT_WINDOW_MS: number;
  RATE_LIMIT_MAX_REQUESTS: number;
}

const setProcessEnvIfMissing = (key: string, value: string): void => {
  if (process.env[key] === undefined) {
    process.env[key] = value;
  }
};

const getEnvVar = (key: string, fallback?: string): string => {
  const value = process.env[key] || fallback;

  if (value === undefined) {
    throw new Error(`Missing required environment variable: ${key}`);
  }

  if (fallback !== undefined && process.env[key] === undefined) {
    setProcessEnvIfMissing(key, value);
  }

  return value;
};

const env: EnvConfig = {
  NODE_ENV: getEnvVar('NODE_ENV', 'development'),
  PORT: parseInt(getEnvVar('PORT', '3000'), 10),
  MONGODB_URI: getEnvVar('MONGODB_URI', 'mongodb://localhost:27017/swiftchain'),
  JWT_SECRET: getEnvVar('JWT_SECRET', isTest ? 'test-jwt-secret' : undefined),
  JWT_EXPIRES_IN: getEnvVar('JWT_EXPIRES_IN', '7d'),
  BCRYPT_ROUNDS: parseInt(getEnvVar('BCRYPT_ROUNDS', '10'), 10),
  LOG_LEVEL: getEnvVar('LOG_LEVEL', 'debug'),
  CORS_ORIGIN: getEnvVar('CORS_ORIGIN', '*'),
  RATE_LIMIT_WINDOW_MS: parseInt(getEnvVar('RATE_LIMIT_WINDOW_MS', '900000'), 10),
  RATE_LIMIT_MAX_REQUESTS: parseInt(getEnvVar('RATE_LIMIT_MAX_REQUESTS', '100'), 10),
};

export default env;
