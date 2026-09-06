import express from 'express';
import cors from 'cors';
import { config } from './config/env.js';
import { testDatabaseConnection } from './config/db.js';
import apiRouter from './routes/api.js';
import { errorHandler, notFoundHandler } from './middleware/errorMiddleware.js';

const app = express();

// Enable CORS with support for frontend client origin
app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps, curl, postman)
    if (!origin) return callback(null, true);
    return callback(null, true);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Body parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Simple request logger
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl} ${res.statusCode} (${duration}ms)`);
  });
  next();
});

// Mount base API router
app.use('/api', apiRouter);

// Root fallback
app.get('/', (req, res) => {
  res.json({
    message: 'Developer Collaboration Platform Backend API',
    healthCheck: '/api/health',
    version: '1.0.0'
  });
});

// 404 & Error Handlers
app.use(notFoundHandler);
app.use(errorHandler);

// Start server
const server = app.listen(config.port, async () => {
  console.log(`====================================================`);
  console.log(`🚀 Developer Platform Server running on port ${config.port}`);
  console.log(`📡 Environment: ${config.nodeEnv}`);
  console.log(`🩺 Health check: http://localhost:${config.port}/api/health`);
  console.log(`====================================================`);
  await testDatabaseConnection();
});

export default app;
