import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { prisma } from './lib/prisma';
import userRoutes from './routes/users';
import emailRoutes from './routes/emails';
import authRoutes from './routes/auth';
import { authMiddleware } from './middleware/auth';

// Load environment variables
dotenv.config();

const app = express();

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
}));
app.use(express.json());

// Routes
app.get('/', (req: Request, res: Response) => {
  res.json({
    message: 'E-MassCom Backend API',
    version: '1.0.0',
    endpoints: {
      users: '/api/users',
      emails: '/api/emails',
      auth: '/api/auth',
    },
  });
});

// API routes with auth middleware
app.use('/api/users', authMiddleware, userRoutes);
app.use('/api/emails', authMiddleware, emailRoutes);
app.use('/api/auth', authRoutes); // Auth routes don't need auth middleware

// Error handling middleware
app.use((err: any, req: Request, res: Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📧 E-MassCom Backend API ready`);
});