// import { AurinkoApi } from 'aurinko-sdk';
import { prisma } from '../lib/prisma';

// Mock AurinkoApi for now
class MockAurinkoApi {
  auth = {
    getAuthUrl: (options: any) => Promise.resolve('https://mock-auth-url.com'),
    exchangeCode: (code: string, options: any) => Promise.resolve({
      accessToken: 'mock-access-token',
      refreshToken: 'mock-refresh-token',
    }),
  };
  accounts = {
    getAccountInfo: (token: string) => Promise.resolve({
      accountId: 'mock-account-id',
      email: 'mock@example.com',
      provider: 'gmail',
    }),
  };
  mail = {
    getMessages: (token: string, options: any) => Promise.resolve({ messages: [] }),
    sendMessage: (token: string, message: any) => Promise.resolve({ messageId: 'mock-message-id' }),
  };
}

export class AurinkoService {
  private aurinko: MockAurinkoApi;

  constructor() {
    this.aurinko = new MockAurinkoApi();
  }

  // Generate OAuth URL for email provider connection
  async getAuthUrl(userId: string, provider: 'gmail' | 'outlook' = 'gmail') {
    const redirectUri = `${process.env.FRONTEND_URL}/auth/aurinko/callback`;

    const authUrl = await this.aurinko.auth.getAuthUrl({
      provider,
      redirectUri,
      state: userId, // Pass user ID in state for callback
      scope: ['Mail.Read', 'Mail.Send', 'Mail.ReadWrite'],
    });

    return authUrl;
  }

  // Handle OAuth callback and store access token
  async handleCallback(code: string, state: string) {
    try {
      const tokenResponse = await this.aurinko.auth.exchangeCode(code, {
        redirectUri: `${process.env.FRONTEND_URL}/auth/aurinko/callback`,
      });

      // Store the access token and account info in database
      const accountInfo = await this.aurinko.accounts.getAccountInfo(tokenResponse.accessToken);

      await prisma.user.update({
        where: { clerkId: state },
        data: {
          aurinkoAccessToken: tokenResponse.accessToken,
          aurinkoRefreshToken: tokenResponse.refreshToken,
          aurinkoAccountId: accountInfo.accountId,
          aurinkoEmail: accountInfo.email,
          aurinkoProvider: accountInfo.provider,
        },
      });

      return { success: true, accountInfo };
    } catch (error) {
      console.error('Aurinko callback error:', error);
      throw error;
    }
  }

  // Sync emails for a user
  async syncEmails(userId: string) {
    try {
      const user = await prisma.user.findUnique({
        where: { clerkId: userId },
      });

      if (!user?.aurinkoAccessToken) {
        throw new Error('User not connected to email provider');
      }

      // Get latest emails from Aurinko
      const emails = await this.aurinko.mail.getMessages(user.aurinkoAccessToken, {
        limit: 50,
        sort: 'received desc',
      });

      // Store emails in database
      for (const email of (emails.messages as any[]) || []) {
        await prisma.email.upsert({
          where: { aurinkoId: email.id },
          update: {
            subject: email.subject,
            body: email.body?.content || '',
            fromAddress: email.from?.email || '',
            toAddresses: email.to?.map((t: any) => t.email) || [],
            ccAddresses: email.cc?.map((c: any) => c.email) || [],
            receivedAt: new Date(email.receivedDateTime),
            isRead: email.isRead || false,
          },
          create: {
            aurinkoId: email.id,
            userId: user.id,
            subject: email.subject || '',
            body: email.body?.content || '',
            fromAddress: email.from?.email || '',
            toAddresses: email.to?.map((t: any) => t.email) || [],
            ccAddresses: email.cc?.map((c: any) => c.email) || [],
            receivedAt: new Date(email.receivedDateTime),
            isRead: email.isRead || false,
            isArchived: false,
            isStarred: false,
            isDeleted: false,
          },
        });
      }

      return { success: true, syncedCount: emails.messages.length };
    } catch (error) {
      console.error('Email sync error:', error);
      throw error;
    }
  }

  // Send email via Aurinko
  async sendEmail(userId: string, emailData: {
    to: string[];
    subject: string;
    body: string;
    cc?: string[];
    bcc?: string[];
  }) {
    try {
      const user = await prisma.user.findUnique({
        where: { clerkId: userId },
      });

      if (!user?.aurinkoAccessToken) {
        throw new Error('User not connected to email provider');
      }

      const sentEmail = await this.aurinko.mail.sendMessage(user.aurinkoAccessToken, {
        to: emailData.to.map(email => ({ email })),
        subject: emailData.subject,
        body: {
          contentType: 'text',
          content: emailData.body,
        },
        cc: emailData.cc?.map(email => ({ email })),
        bcc: emailData.bcc?.map(email => ({ email })),
      });

      // Store sent email in database
      const messageId = (sentEmail as any).messageId || 'mock-message-' + Date.now();
      await prisma.email.create({
        data: {
          aurinkoId: messageId,
          userId: user.id,
          subject: emailData.subject,
          body: emailData.body,
          fromAddress: user.aurinkoEmail || '',
          toAddresses: emailData.to,
          ccAddresses: emailData.cc || [],
          receivedAt: new Date(),
          isRead: true, // Sent emails are considered read
          isArchived: false,
          isStarred: false,
          isDeleted: false,
        },
      });

      return { success: true, emailId: messageId };
    } catch (error) {
      console.error('Send email error:', error);
      throw error;
    }
  }

  // Get user's connected email accounts
  async getConnectedAccounts(userId: string) {
    try {
      const user = await prisma.user.findUnique({
        where: { clerkId: userId },
        select: {
          aurinkoEmail: true,
          aurinkoProvider: true,
          aurinkoAccountId: true,
        },
      });

      return user;
    } catch (error) {
      console.error('Get connected accounts error:', error);
      throw error;
    }
  }
}

export const aurinkoService = new AurinkoService();