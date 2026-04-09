import { Request, Response, NextFunction } from 'express';
import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

// Simple auth middleware - in production you'd use proper JWT validation
export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  // For now, we'll accept user-id from headers
  // In production, you'd validate JWT tokens from Clerk or similar
  const userId = req.headers['user-id'] as string;

  if (!userId) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  // You could add additional validation here
  next();
};