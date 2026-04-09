import { Router, Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { aurinkoService } from '../services/aurinko';

const router = Router();

// Get user's emails
router.get('/', async (req: Request, res: Response) => {
  try {
    const userId = req.headers['user-id'] as string;
    const { page = 1, limit = 20, folder = 'inbox' } = req.query;

    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    let whereClause: any = {
      userId,
      isDeleted: false,
    };

    // Filter based on folder
    switch (folder) {
      case 'inbox':
        whereClause.isArchived = false;
        break;
      case 'starred':
        whereClause.isStarred = true;
        break;
      case 'sent':
        // For sent emails, you might want to check if the user is the sender
        // This is a simplified version
        break;
      case 'archive':
        whereClause.isArchived = true;
        break;
    }

    const emails = await prisma.email.findMany({
      where: whereClause,
      include: {
        attachments: true,
        thread: true,
      },
      orderBy: {
        receivedAt: 'desc',
      },
      skip,
      take: limitNum,
    });

    const total = await prisma.email.count({
      where: whereClause,
    });

    res.json({
      emails,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    console.error('Error fetching emails:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get single email
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const userId = req.headers['user-id'] as string;
    const { id } = req.params;

    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const email = await prisma.email.findFirst({
      where: {
        id,
        userId,
        isDeleted: false,
      },
      include: {
        attachments: true,
        thread: {
          include: {
            emails: {
              include: {
                attachments: true,
              },
              orderBy: {
                receivedAt: 'asc',
              },
            },
          },
        },
      },
    });

    if (!email) {
      return res.status(404).json({ error: 'Email not found' });
    }

    // Mark as read if not already read
    if (!email.isRead) {
      await prisma.email.update({
        where: { id },
        data: { isRead: true },
      });
    }

    res.json(email);
  } catch (error) {
    console.error('Error fetching email:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Send email (placeholder - would integrate with email service)
router.post('/send', async (req: Request, res: Response) => {
  try {
    const userId = req.headers['user-id'] as string;
    const { to, subject, body, cc, bcc } = req.body;

    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    if (!to || !subject || !body) {
      return res.status(400).json({ error: 'Missing required fields: to, subject, body' });
    }

    const result = await aurinkoService.sendEmail(userId, {
      to: Array.isArray(to) ? to : [to],
      subject,
      body,
      cc: cc ? (Array.isArray(cc) ? cc : [cc]) : undefined,
      bcc: bcc ? (Array.isArray(bcc) ? bcc : [bcc]) : undefined,
    });

    res.json(result);
  } catch (error) {
    console.error('Error sending email:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update email (star, archive, etc.)
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const userId = req.headers['user-id'] as string;
    const { id } = req.params;
    const { isRead, isStarred, isArchived } = req.body;

    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const updateData: any = {};
    if (isRead !== undefined) updateData.isRead = isRead;
    if (isStarred !== undefined) updateData.isStarred = isStarred;
    if (isArchived !== undefined) updateData.isArchived = isArchived;

    const updatedEmail = await prisma.email.updateMany({
      where: {
        id,
        userId,
      },
      data: updateData,
    });

    if (updatedEmail.count === 0) {
      return res.status(404).json({ error: 'Email not found' });
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Error updating email:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete email (soft delete)
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const userId = req.headers['user-id'] as string;
    const { id } = req.params;

    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const deletedEmail = await prisma.email.updateMany({
      where: {
        id,
        userId,
      },
      data: {
        isDeleted: true,
      },
    });

    if (deletedEmail.count === 0) {
      return res.status(404).json({ error: 'Email not found' });
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting email:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;