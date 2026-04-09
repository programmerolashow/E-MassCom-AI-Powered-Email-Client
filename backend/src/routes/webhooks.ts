import { Router, Request, Response } from 'express';
import crypto from 'crypto';
import { prisma } from '../lib/prisma';

const router = Router();

// Middleware to verify Clerk webhook signature
const verifyClerkWebhook = (req: Request, res: Response, next: any) => {
  const secret = process.env.CLERK_WEBHOOK_SECRET;

  if (!secret) {
    console.error('CLERK_WEBHOOK_SECRET not configured');
    return res.status(500).json({ error: 'Webhook secret not configured' });
  }

  const svixId = req.headers['svix-id'] as string;
  const svixTimestamp = req.headers['svix-timestamp'] as string;
  const svixSignature = req.headers['svix-signature'] as string;

  if (!svixId || !svixTimestamp || !svixSignature) {
    return res.status(400).json({ error: 'Missing required webhook headers' });
  }

  const body = JSON.stringify(req.body);
  const signedContent = `${svixId}.${svixTimestamp}.${body}`;

  const secretBytes = Buffer.from(secret.split('_')[1], 'base64');
  const signature = crypto.createHmac('sha256', secretBytes).update(signedContent).digest('base64');

  const expectedSignature = `v1,${signature}`;

  if (!crypto.timingSafeEqual(Buffer.from(expectedSignature), Buffer.from(svixSignature))) {
    return res.status(400).json({ error: 'Invalid webhook signature' });
  }

  next();
};

// Clerk webhook endpoint
router.post('/clerk', verifyClerkWebhook, async (req: Request, res: Response) => {
  try {
    const { type, data } = req.body;

    console.log(`📧 Clerk webhook received: ${type}`, { userId: data?.id });

    switch (type) {
      case 'user.created':
        await handleUserCreated(data);
        break;

      case 'user.updated':
        await handleUserUpdated(data);
        break;

      case 'user.deleted':
        await handleUserDeleted(data);
        break;

      case 'session.created':
        await handleSessionCreated(data);
        break;

      case 'session.removed':
        await handleSessionRemoved(data);
        break;

      case 'email.created':
        await handleEmailCreated(data);
        break;

      default:
        console.log(`Unhandled webhook type: ${type}`);
    }

    res.status(200).json({ received: true });
  } catch (error) {
    console.error('Webhook processing error:', error);
    res.status(500).json({ error: 'Failed to process webhook' });
  }
});

// Handle user creation
async function handleUserCreated(userData: any) {
  try {
    const user = await prisma.user.upsert({
      where: { clerkId: userData.id },
      update: {
        email: userData.email_addresses?.[0]?.email_address || userData.primary_email_address_id,
        firstName: userData.first_name,
        lastName: userData.last_name,
        imageUrl: userData.image_url,
        updatedAt: new Date(),
      },
      create: {
        clerkId: userData.id,
        email: userData.email_addresses?.[0]?.email_address || userData.primary_email_address_id,
        firstName: userData.first_name,
        lastName: userData.last_name,
        imageUrl: userData.image_url,
      },
    });

    console.log(`✅ User created/updated: ${user.id} (${user.email})`);
  } catch (error) {
    console.error('Error handling user creation:', error);
    throw error;
  }
}

// Handle user updates
async function handleUserUpdated(userData: any) {
  try {
    await prisma.user.update({
      where: { clerkId: userData.id },
      data: {
        email: userData.email_addresses?.[0]?.email_address || userData.primary_email_address_id,
        firstName: userData.first_name,
        lastName: userData.last_name,
        imageUrl: userData.image_url,
        updatedAt: new Date(),
      },
    });

    console.log(`🔄 User updated: ${userData.id}`);
  } catch (error) {
    console.error('Error handling user update:', error);
    throw error;
  }
}

// Handle user deletion
async function handleUserDeleted(userData: any) {
  try {
    // Soft delete by marking as inactive, or hard delete based on your preference
    await prisma.user.update({
      where: { clerkId: userData.id },
      data: {
        // Add an isActive field to your User model if you want soft deletes
        updatedAt: new Date(),
      },
    });

    console.log(`🗑️ User marked for deletion: ${userData.id}`);
  } catch (error) {
    console.error('Error handling user deletion:', error);
    throw error;
  }
}

// Handle session creation
async function handleSessionCreated(sessionData: any) {
  try {
    // You can track active sessions if needed
    console.log(`🔐 Session created for user: ${sessionData.user_id}`);
  } catch (error) {
    console.error('Error handling session creation:', error);
  }
}

// Handle session removal
async function handleSessionRemoved(sessionData: any) {
  try {
    // Clean up any session-related data if needed
    console.log(`🚪 Session removed for user: ${sessionData.user_id}`);
  } catch (error) {
    console.error('Error handling session removal:', error);
  }
}

// Handle email creation/verification
async function handleEmailCreated(emailData: any) {
  try {
    // Update user's email verification status
    if (emailData.user_id) {
      await prisma.user.update({
        where: { clerkId: emailData.user_id },
        data: {
          emailVerified: emailData.verification?.status === 'verified',
          updatedAt: new Date(),
        },
      });

      console.log(`📧 Email verified for user: ${emailData.user_id}`);
    }
  } catch (error) {
    console.error('Error handling email creation:', error);
    throw error;
  }
}

export default router;