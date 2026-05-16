import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import { initialize } from './_helpers/db';
import { errorHandler } from './_middleware/error-handler';
import { setupSwagger } from './_helpers/swagger';
import accountsController from './accounts/accounts.controller';

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

// ✅ Read CORS origin from environment variable, fallback to localhost for development
const corsOrigin = process.env.CORS_ORIGIN;

app.use(cors({
  origin: process.env.NODE_ENV === 'production'
    ? (corsOrigin ? corsOrigin.split(',').map(x => x.trim()) : false)
    : (origin, callback) => callback(null, true),
  credentials: true
}));

// Swagger docs
setupSwagger(app);

// Routes
app.use('/accounts', accountsController);

// Global error handler
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 4000;

initialize()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`✅ Server running on http://localhost:${PORT}`);
      console.log(`📖 Swagger docs: http://localhost:${PORT}/api-docs`);
    });
  })
  .catch(err => {
    console.error('❌ Failed to start server:', err);
    process.exit(1);
  });

export default app;