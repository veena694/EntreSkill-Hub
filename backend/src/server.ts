import app from './app';
import { connectDB } from './config/db';
import dotenv from 'dotenv';

dotenv.config();

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    // Connect to PostgreSQL
    await connectDB();
    
    app.listen(PORT, () => {
      console.log(`==========================================`);
      console.log(`  EntreSkill Hub API Server Booted Successfully  `);
      console.log(`  Running in [${process.env.NODE_ENV || 'development'}] mode   `);
      console.log(`  Listening at: http://localhost:${PORT}      `);
      console.log(`  Swagger docs: http://localhost:${PORT}/api-docs `);
      console.log(`==========================================`);
    });
  } catch (error) {
    console.error('Failed to initialize server:', error);
    process.exit(1);
  }
};

startServer();
