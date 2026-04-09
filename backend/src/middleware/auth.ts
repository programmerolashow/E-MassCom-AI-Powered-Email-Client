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

const isPublicRoute = createRouteMatcher(['/signin(.*)', '/signup(.*)', '/webhooks(.*)'])

export default clerkMiddleware(async (auth, request) => {
  if (!isPublicRoute(request)) {
    await auth().protect()
  }
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};