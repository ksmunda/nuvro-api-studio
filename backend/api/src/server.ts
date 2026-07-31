import { app } from './app.js';
import { env } from './config/env.js';
import { prisma } from '@nuvro/database';
import type { Server } from 'http';

const server: Server = app.listen(env.API_PORT, () => {
  console.info(`🚀 NUVRO API Server running at http://${env.API_HOST}:${env.API_PORT}`);
  console.info(`   Environment: ${env.NODE_ENV}`);
});

let isShuttingDown = false;

async function gracefulShutdown(signal: string): Promise<void> {
  if (isShuttingDown) return;
  isShuttingDown = true;
  
  console.warn(`[Shutdown] Received ${signal}. Starting graceful shutdown...`);
  
  // Stop accepting new HTTP requests
  server.close(async (err) => {
    if (err) {
      console.error('[Shutdown] Error closing HTTP server:', err);
      process.exit(1);
    }
    
    console.info('[Shutdown] HTTP server closed. Disconnecting database client...');
    try {
      await prisma.$disconnect();
      console.info('[Shutdown] Database disconnected successfully. Exit clean.');
      process.exit(0);
    } catch (dbError) {
      console.error('[Shutdown] Database disconnection failed:', dbError);
      process.exit(1);
    }
  });

  // Forced shutdown fallback after 10s
  setTimeout(() => {
    console.error('[Shutdown] Forced shutdown timed out. Exiting now.');
    process.exit(1);
  }, 10_000);
}

// Listening to signals
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));
process.on('unhandledRejection', (reason, promise) => {
  console.error('[Process] Unhandled Rejection at:', promise, 'reason:', reason);
});
process.on('uncaughtException', (error) => {
  console.error('[Process] Uncaught Exception thrown:', error);
  gracefulShutdown('UNCAUGHT_EXCEPTION');
});
