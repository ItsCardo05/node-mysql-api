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
const corsOrigin = process.env.CORS_ORIGIN || 'https://villegas-lab7-activity.vercel.app';
app.use(cors({ 
  origin: corsOrigin.split(',').map(o => o.trim()),
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