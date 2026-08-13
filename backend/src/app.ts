import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import swaggerUi from 'swagger-ui-express';
import path from 'path';

import router from './routes';
import { errorHandler } from './middleware/error.middleware';

// Load Swagger document
import swaggerDocument from './docs/swagger.json';

const app = express();

// Security Headers
app.use(helmet({
  contentSecurityPolicy: false // Disable CSP locally to make Swagger UI assets load cleanly
}));

const allowedOrigins = Array.from(new Set([
  process.env.FRONTEND_URL,
  'https://entre-skill-hub-green.vercel.app',
  'http://localhost:5173',
  'http://localhost:3000'
].filter(Boolean)));

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin as string)) {
      callback(null, true);
    } else {
      callback(null, true);
    }
  },
  credentials: true
}));

// Logging
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// Request Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per window
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again after 15 minutes.'
  },
  standardHeaders: true,
  legacyHeaders: false
});
app.use('/api', limiter);

// Body Parsing & Compression
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(compression());
app.use(cookieParser());

// Static File Access (if uploaded profiles need local hosting)
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Swagger UI Endpoint
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Route Mounts
app.use('/api/v1', router);

// Health Endpoint
app.get('/health', (_req, res) => {
  res.status(200).json({ success: true, message: 'Ready' });
});

// Centralized Error Handling Middleware
app.use(errorHandler);

export default app;
