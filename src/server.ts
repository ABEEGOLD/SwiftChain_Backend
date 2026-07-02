import http from 'http';
import app from './app';
import env from './config/env';
import logger from './config/logger';
import { initializeSocketServer, shutdownSocketServer } from './sockets/connectionHandler';
import { connectDatabase } from './config/database';

const PORT = env.PORT;
const httpServer = http.createServer(app);
const io = initializeSocketServer(httpServer);

const startServer = async (): Promise<void> => {
  await connectDatabase();

  httpServer.listen(PORT, () => {
    logger.info(`🚀 Server running on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
    logger.info(`📝 Health check: http://localhost:${PORT}/health`);
    logger.info(`📦 ETA endpoint: http://localhost:${PORT}/api/v1/deliveries/:id/eta`);
  });
};

startServer().catch((error) => {
  logger.error('Failed to start server:', error);
  process.exit(1);
});

const gracefulShutdown = async (): Promise<void> => {
  logger.info('Received shutdown signal, closing gracefully...');

  try {
    await shutdownSocketServer(io);

    httpServer.close(async () => {
      logger.info('HTTP server closed');

      try {
        const { default: mongoose } = await import('mongoose');
        await mongoose.connection.close(false);
        logger.info('MongoDB connection closed');
      } catch (dbErr) {
        logger.error('Error closing MongoDB connection:', dbErr);
      }

      process.exit(0);
    });
  } catch (err) {
    logger.error('Error during graceful shutdown:', err);
    process.exit(1);
  }

  setTimeout(() => {
    logger.error('Could not close connections in time, forcefully shutting down');
    process.exit(1);
  }, 10_000);
};

process.on('SIGTERM', () => void gracefulShutdown());
process.on('SIGINT', () => void gracefulShutdown());

process.on('unhandledRejection', (error: Error) => {
  logger.error('Unhandled Rejection:', error);
  void gracefulShutdown();
});

process.on('uncaughtException', (error: Error) => {
  logger.error('Uncaught Exception:', error);
  void gracefulShutdown();
});

export default httpServer;
