import mongoose from 'mongoose';
import config from './env.js';
import logger from '../utils/logger.js';

export async function connectDB() {
  try {
    await mongoose.connect(config.mongoUri, {
      serverSelectionTimeoutMS: 5000,
    });
    logger.info('MongoDB connected');
  } catch (err) {
    const hint =
      'Start the MongoDB service (services.msc → MongoDB → Start) or set MONGO_URI to a MongoDB Atlas connection string in backend/.env';
    logger.error(`MongoDB connection failed: ${err.message}. ${hint}`);
    throw new Error(`MongoDB connection failed: ${err.message}`);
  }
}
