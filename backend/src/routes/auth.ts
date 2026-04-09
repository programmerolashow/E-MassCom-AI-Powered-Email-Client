import { Router, Request, Response } from 'express';
import { aurinkoService } from '../services/aurinko';
import { prisma } from '../lib/prisma';

const router = Router();

// Get OAuth URL for email provider connection
router.get('/connect/:provider', async (req: Request, res: Response) => {
  try {
    const { provider } = req.params;
    const userId = req.headers['user-id'] as string;

    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    if (!['gmail', 'outlook'].includes(provider)) {
      return res.status(400).json({ error: 'Invalid provider. Use gmail or outlook' });
    }

    const authUrl = await aurinkoService.getAuthUrl(userId, provider as 'gmail' | 'outlook');
    res.json({ authUrl });
  } catch (error) {
    console.error('Connect provider error:', error);
    res.status(500).json({ error: 'Failed to generate auth URL' });
  }
});

// Handle OAuth callback from Aurinko
router.post('/callback', async (req: Request, res: Response) => {
  try {
    const { code, state: userId } = req.body;

    if (!code || !userId) {
      return res.status(400).json({ error: 'Missing code or state parameter' });
    }

    const result = await aurinkoService.handleCallback(code, userId);
    res.json(result);
  } catch (error) {
    console.error('OAuth callback error:', error);
    res.status(500).json({ error: 'Failed to complete authentication' });
  }
});

// Get connected email accounts for user
router.get('/accounts', async (req: Request, res: Response) => {
  try {
    const userId = req.headers['user-id'] as string;

    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const accounts = await aurinkoService.getConnectedAccounts(userId);
    res.json({ accounts });
  } catch (error) {
    console.error('Get accounts error:', error);
    res.status(500).json({ error: 'Failed to get connected accounts' });
  }
});

// Sync emails for user
router.post('/sync', async (req: Request, res: Response) => {
  try {
    const userId = req.headers['user-id'] as string;

    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const result = await aurinkoService.syncEmails(userId);
    res.json(result);
  } catch (error) {
    console.error('Sync emails error:', error);
    res.status(500).json({ error: 'Failed to sync emails' });
  }
});

// Create or sync user from Clerk
router.post('/sync-user', async (req: Request, res: Response) => {
  try {
    const { clerkId, email, name } = req.body;

    if (!clerkId || !email) {
      return res.status(400).json({ error: 'clerkId and email are required' });
    }

    // Create or update user in database
    const user = await prisma.user.upsert({
      where: { clerkId },
      update: {
        email,
        name: name || null,
        updatedAt: new Date(),
      },
      create: {
        clerkId,
        email,
        name: name || null,
      },
    });

    res.json({ user: { id: user.id, email: user.email, name: user.name } });
  } catch (error) {
    console.error('Sync user error:', error);
    res.status(500).json({ error: 'Failed to sync user' });
  }
});

export default router;