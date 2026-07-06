import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import routes from './routes';
import logger from './config/logger';
import env from './config/env';
import { corsOptionsDelegate, helmetOptions } from './config/security';
import errorHandler from './middleware/errorHandler';
import requestLogger from './middleware/requestLogger';
dotenv.config();

if (process.env.MONGODB_URI && require('mongoose').connection.readyState === 0) {
  require('mongoose').connect(process.env.MONGODB_URI).catch(console.error);

}



const app = express();

// Trust the first proxy (load balancer / reverse proxy) so that
// secure headers and rate limiting use the correct client IP.
app.set('trust proxy', 1);

// Request logging
app.use(requestLogger);

// Security and compression
app.use(helmet(helmetOptions));
app.use(compression());

// CORS configuration
app.use(cors(corsOptionsDelegate));

// Rate limiting
const limiter = rateLimit({
  windowMs: env.RATE_LIMIT_WINDOW_MS,
  max: env.RATE_LIMIT_MAX_REQUESTS,
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api', limiter);

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

app.use('/api/v1', routes);

app.get('/health', (_req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'SwiftChain-Backend is running',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
  });
});

app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: `Route ${req.path} not found`,
  });
});

app.use(errorHandler);

export default app;
