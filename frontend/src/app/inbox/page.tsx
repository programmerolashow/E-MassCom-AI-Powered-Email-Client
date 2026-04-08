'use client';

import { useState, useEffect } from 'react';
import { useUser, UserButton } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Inbox as InboxIcon,
  Send,
  Star,
  Archive,
  Paperclip,
  Send as SendIcon,
  Sparkles,
  Search,
  Plus,
  MessageSquare,
  Clock,
  Users,
  Image,
  Settings,
  LogOut,
  Mic,
  MicOff,
  Mail
} from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { useApiClient } from '../../lib/api';
import EmailList from '../../components/EmailList';
import EmailView from '../../components/EmailView';
import { Email } from '../../components/EmailList';

interface EmailListResponse {
  emails: Array<{
    id: string;
    fromAddress?: string;
    from?: string;
    subject: string;
    body: string;
    receivedAt: string;
    isRead: boolean;
    isStarred: boolean;
    isArchived: boolean;
    attachments?: Record<string, unknown>[];
    thread?: Record<string, unknown>;
  }>;
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

interface Account {
  aurinkoEmail?: string;
  aurinkoProvider?: string;
}

export default function InboxPage() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const apiClient = useApiClient();

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [selectedEmail, setSelectedEmail] = useState<Email | null>(null);
  const [emails, setEmails] = useState<Email[]>([]);
  const [loading, setLoading] = useState(true);
  const [isRecording, setIsRecording] = useState(false);
  const [composeText, setComposeText] = useState('');
  const [activeTab, setActiveTab] = useState('inbox');
  const [searchQuery, setSearchQuery] = useState('');
  const [connectedAccounts, setConnectedAccounts] = useState<Account[] | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [viewMode, setViewMode] = useState<'list' | 'compose' | 'view'>('list');

  // Check authentication and redirect if not logged in
  useEffect(() => {
    if (isLoaded && !user) {
      router.push('/auth/signin');
    }
  }, [isLoaded, user, router]);

  // Fetch emails and check accounts
  const fetchEmails = async () => {
    setLoading(true);
    try {
      const response = await apiClient.getEmails({
        folder: activeTab as 'inbox' | 'starred' | 'sent' | 'archive',
        page: 1,
        limit: 20,
      });

      if (response.data) {
        const emailData = response.data as EmailListResponse;
        // Map API response to component interface
        const mappedEmails = emailData.emails.map(email => ({
          ...email,
          sender: email.fromAddress || email.from || 'Unknown',
          time: new Date(email.receivedAt).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit'
          }),
        }));
        setEmails(mappedEmails);
      } else if (response.error) {
        console.error('Error fetching emails:', response.error);
      }
    } catch (error) {
      console.error('Error fetching emails:', error);
    } finally {
      setLoading(false);
    }
  };

  const checkConnectedAccounts = async () => {
    // TODO: Implement getConnectedAccounts
    // try {
    //   const response = await apiClient.getConnectedAccounts();
    //   if (response.data) {
    //     setConnectedAccounts(response.data.accounts);
    //   }
    // } catch (error) {
    //   console.error('Error checking connected accounts:', error);
    // }
  };

  // Fetch emails on component mount and when activeTab changes
  useEffect(() => {
    if (user) {
      fetchEmails();
      checkConnectedAccounts();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, user]);

  const handleCompose = () => {
    setViewMode('compose');
  };

  const handleBackToList = () => {
    setViewMode('list');
    setSelectedEmail(null);
  };

  const handleVoiceToggle = () => {
    setIsRecording(!isRecording);
    // TODO: Implement voice recording functionality
  };

  const handleSendEmail = async () => {
    if (!composeText.trim()) return;

    try {
      // For now, we'll just log the email data
      // In a real implementation, you'd collect recipient and subject from form inputs
      const emailData = {
        to: 'recipient@example.com', // This should come from form input
        subject: 'New Email', // This should come from form input
        body: composeText,
      };

      const response = await apiClient.sendEmail(emailData);

      if (response.data) {
        console.log('Email sent successfully:', response.data);
        setComposeText('');
        // Refresh emails if we're on sent folder
        if (activeTab === 'sent') {
          fetchEmails();
        }
      } else if (response.error) {
        console.error('Error sending email:', response.error);
      }
    } catch (error) {
      console.error('Error sending email:', error);
    }
  };

  const handleEmailClick = async (email: Email) => {
    setSelectedEmail(email);
    setViewMode('view');

    // Mark as read if not already read
    if (!email.isRead) {
      try {
        await apiClient.updateEmail(email.id, { isRead: true });
        // Update local state
        setEmails(prev => prev.map(e =>
          e.id === email.id ? { ...e, isRead: true } : e
        ));
      } catch (error) {
        console.error('Error marking email as read:', error);
      }
    }
  };

  const handleStarEmail = async (emailId: string, isStarred: boolean) => {
    try {
      await apiClient.updateEmail(emailId, { isStarred });
      // Update local state
      setEmails(prev => prev.map(e =>
        e.id === emailId ? { ...e, isStarred } : e
      ));
    } catch (error) {
      console.error('Error updating email star status:', error);
    }
  };

  const navigationItems = [
    { id: 'inbox', name: 'Inbox', icon: InboxIcon, count: emails.filter(e => !e.isRead).length },
    { id: 'sent', name: 'Sent', icon: Send, count: 0 },
    { id: 'draft', name: 'Draft', icon: Archive, count: 0 },
    { id: 'starred', name: 'Starred', icon: Star, count: emails.filter(e => e.isStarred).length },
  ];

  const handleConnectEmail = async (provider: 'gmail' | 'outlook' = 'gmail') => {
    // TODO: Implement connectEmailProvider
    setIsConnecting(true);
    try {
      // const response = await apiClient.connectEmailProvider(provider);
      // if (response.data?.authUrl) {
      //   // Open OAuth URL in new window
      //   window.open(response.data.authUrl, '_blank', 'width=600,height=700');
      // }
      console.log('Connecting to', provider);
    } catch (error) {
      console.error('Error connecting email provider:', error);
    } finally {
      setIsConnecting(false);
    }
  };

  const handleSyncEmails = async () => {
    // TODO: Implement syncEmails
    // try {
    //   const response = await apiClient.syncEmails();
    //   if (response.data) {
    //     // Refresh emails after sync
    //     fetchEmails();
    //     console.log('Emails synced successfully');
    //   }
    // } catch (error) {
    //   console.error('Error syncing emails:', error);
    // }
    console.log('Syncing emails...');
    fetchEmails();
  };

  const handleEmailSend = async () => {
    if (!composeText.trim()) return;

    try {
      // For now, we'll just log the email data
      // In a real implementation, you'd collect recipient and subject from form inputs
      const emailData = {
        to: 'recipient@example.com', // This should come from form input
        subject: 'New Email', // This should come from form input
        body: composeText,
      };

      const response = await apiClient.sendEmail(emailData);

      if (response.data) {
        console.log('Email sent successfully:', response.data);
        setComposeText('');
        // Refresh emails if we're on sent folder
        if (activeTab === 'sent') {
          fetchEmails();
        }
      } else if (response.error) {
        console.error('Error sending email:', response.error);
      }
    } catch (error) {
      console.error('Error sending email:', error);
    }
  };

  const handleSelectEmail = async (email: Email) => {
    setSelectedEmail(email);

    // Mark as read if not already read
    if (!email.isRead) {
      try {
        await apiClient.updateEmail(email.id, { isRead: true });
        // Update local state
        setEmails(prev => prev.map(e =>
          e.id === email.id ? { ...e, isRead: true } : e
        ));
      } catch (error) {
        console.error('Error marking email as read:', error);
      }
    }
  };

  const handleEmailStar = async (emailId: string, isStarred: boolean) => {
    try {
      await apiClient.updateEmail(emailId, { isStarred });
      // Update local state
      setEmails(prev => prev.map(e =>
        e.id === emailId ? { ...e, isStarred } : e
      ));
    } catch (error) {
      console.error('Error updating email star status:', error);
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-blue-600 to-indigo-700 text-white">
      {!isLoaded && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-lg p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
            <p className="text-white">Loading your inbox...</p>
          </div>
        </div>
      )}

      {isLoaded && !user && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-lg p-8 text-center">
            <p className="text-white mb-4">Redirecting to sign in...</p>
          </div>
        </div>
      )}

      {isLoaded && user && (
        <>
          {/* Navigation Header */}
          <nav className="flex items-center justify-between p-6 border-b border-blue-500">
            <Link href="/" className="flex items-center gap-2 text-2xl font-bold">
              <Mail className="h-8 w-8" />
              E-MassCom
            </Link>
            <div className="flex items-center gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-blue-300" />
                <Input
                  placeholder="Search emails..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-blue-500 bg-opacity-50 border-blue-400 text-white placeholder-blue-200 w-64"
                />
              </div>
              <UserButton />
            </div>
          </nav>

          {/* Main Dashboard Layout */}
          <div className="flex h-[calc(100vh-80px)]">
        {/* Left Sidebar - Navigation */}
        <div className="w-64 bg-blue-500 bg-opacity-20 backdrop-blur-sm border-r border-blue-400 flex flex-col">
          {/* User Info */}
          <div className="p-4 border-b border-blue-400">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-400 rounded-full flex items-center justify-center">
                <span className="text-white font-semibold">
                  {user?.firstName?.[0] || user?.emailAddresses?.[0]?.emailAddress?.[0] || 'U'}
                </span>
              </div>
              <div>
                <p className="font-medium text-white">
                  {user?.firstName || 'Welcome'}
                </p>
                <p className="text-sm text-blue-200">
                  {user?.emailAddresses?.[0]?.emailAddress}
                </p>
              </div>
            </div>
          </div>

          {/* Navigation Items */}
          <nav className="flex-1 p-4 space-y-2">
            {navigationItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  setViewMode('list');
                  setSelectedEmail(null);
                }}
                className={`w-full flex items-center justify-between p-3 rounded-lg transition-colors ${
                  activeTab === item.id
                    ? 'bg-blue-400 bg-opacity-50 text-white'
                    : 'text-blue-100 hover:bg-blue-400 hover:bg-opacity-30'
                }`}
              >
                <div className="flex items-center gap-3">
                  <item.icon className="h-5 w-5" />
                  <span>{item.name}</span>
                </div>
                {item.count > 0 && (
                  <span className="bg-blue-400 text-white text-xs px-2 py-1 rounded-full">
                    {item.count}
                  </span>
                )}
              </button>
            ))}
          </nav>

          {/* Bottom Actions */}
          <div className="p-4 border-t border-blue-400 space-y-2">
            <button className="w-full flex items-center gap-3 p-3 text-blue-100 hover:bg-blue-400 hover:bg-opacity-30 rounded-lg transition-colors">
              <Settings className="h-5 w-5" />
              <span>Settings</span>
            </button>
            <button className="w-full flex items-center gap-3 p-3 text-blue-100 hover:bg-red-400 hover:bg-opacity-30 rounded-lg transition-colors">
              <LogOut className="h-5 w-5" />
              <span>Logout</span>
            </button>
          </div>
        </div>

        {/* Middle Section */}
        <div className="flex-1 bg-white bg-opacity-95 backdrop-blur-sm flex flex-col">
          {viewMode === 'compose' && (
            <>
              {/* Compose Header */}
              <div className="p-6 border-b border-gray-200 bg-white">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-gray-900">Compose Email</h2>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleBackToList}
                      className="flex items-center gap-2"
                    >
                      Back to Inbox
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex items-center gap-2"
                    >
                      <Sparkles className="h-4 w-4" />
                      AI Assist
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleVoiceToggle}
                      className={`flex items-center gap-2 ${
                        isRecording ? 'bg-red-50 border-red-200 text-red-600' : ''
                      }`}
                    >
                      {isRecording ? (
                        <MicOff className="h-4 w-4" />
                      ) : (
                        <Mic className="h-4 w-4" />
                      )}
                      {isRecording ? 'Stop' : 'Voice'}
                    </Button>
                  </div>
                </div>
              </div>

              {/* Compose Form */}
              <div className="flex-1 p-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    placeholder="To: recipient@example.com"
                    className="bg-gray-50 border-gray-200"
                  />
                  <Input
                    placeholder="Subject: Your email subject"
                    className="bg-gray-50 border-gray-200"
                  />
                </div>

                {/* Message Input */}
                <div className="relative">
                  <textarea
                    value={composeText}
                    onChange={(e) => setComposeText(e.target.value)}
                    placeholder="Start writing your email... or use voice input above"
                    className="w-full h-64 p-4 border border-gray-200 rounded-lg resize-none bg-gray-50 focus:bg-white focus:border-blue-500 transition-colors"
                  />

                  {/* AI Suggestions */}
                  {composeText.length > 10 && (
                    <div className="absolute bottom-4 right-4 bg-blue-600 text-white px-3 py-2 rounded-lg text-sm">
                      <Sparkles className="h-4 w-4 inline mr-1" />
                      AI: Consider adding a greeting
                    </div>
                  )}
                </div>

                {/* Attachment Options */}
                <div className="flex items-center gap-4">
                  <Button variant="outline" size="sm" className="flex items-center gap-2">
                    {/* eslint-disable-next-line jsx-a11y/alt-text */}
                    <Image className="h-4 w-4" />
                    Add Image
                  </Button>
                  <Button variant="outline" size="sm" className="flex items-center gap-2">
                    <Paperclip className="h-4 w-4" />
                    Attach File
                  </Button>
                  <Button variant="outline" size="sm" className="flex items-center gap-2">
                    <Plus className="h-4 w-4" />
                    Add Link
                  </Button>
                </div>
              </div>

              {/* Compose Actions */}
              <div className="p-6 border-t border-gray-200 bg-gray-50 flex justify-between items-center">
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <span>💡 Tip: Use voice input for faster composing</span>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline">Save Draft</Button>
                  <Button
                    onClick={handleSendEmail}
                    className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2"
                  >
                    <SendIcon className="h-4 w-4" />
                    Send Email
                  </Button>
                </div>
              </div>
            </>
          )}

          {viewMode === 'list' && (
            <EmailList emails={emails} loading={loading} onSelectEmail={handleEmailClick} />
          )}

          {viewMode === 'view' && selectedEmail && (
            <EmailView email={selectedEmail} onBack={handleBackToList} />
          )}
        </div>

        {/* Right Sidebar - Suggestions & Quick Actions */}
        <div className="w-80 bg-blue-500 bg-opacity-10 backdrop-blur-sm border-l border-blue-400 flex flex-col">
          {/* Email Account Connection */}
          <div className="p-4 border-b border-blue-400">
            <h3 className="text-lg font-semibold text-white mb-3">Email Accounts</h3>
            {connectedAccounts && connectedAccounts.length > 0 && connectedAccounts[0].aurinkoEmail ? (
              <div className="bg-blue-500 bg-opacity-20 rounded-lg p-3 mb-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white font-medium text-sm">{connectedAccounts[0].aurinkoEmail}</p>
                    <p className="text-blue-200 text-xs capitalize">{connectedAccounts[0].aurinkoProvider}</p>
                  </div>
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                </div>
              </div>
            ) : (
              <div className="space-y-2 mb-3">
                <Button
                  onClick={() => handleConnectEmail('gmail')}
                  disabled={isConnecting}
                  className="w-full bg-red-600 hover:bg-red-700 text-white text-sm"
                >
                  {isConnecting ? 'Connecting...' : 'Connect Gmail'}
                </Button>
                <Button
                  onClick={() => handleConnectEmail('outlook')}
                  disabled={isConnecting}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white text-sm"
                >
                  {isConnecting ? 'Connecting...' : 'Connect Outlook'}
                </Button>
              </div>
            )}

            {connectedAccounts && connectedAccounts.length > 0 && connectedAccounts[0].aurinkoEmail && (
              <Button
                onClick={handleSyncEmails}
                variant="outline"
                size="sm"
                className="w-full border-blue-400 text-blue-100 hover:bg-blue-400 hover:bg-opacity-30"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Sync Emails
              </Button>
            )}
          </div>
          {/* Quick Actions */}
          <div className="p-4 border-b border-blue-400">
            <h3 className="text-lg font-semibold text-white mb-3">Quick Actions</h3>
            <div className="space-y-2">
              <Button className="w-full justify-start bg-blue-600 hover:bg-blue-700 text-white" onClick={handleCompose}>
                <Plus className="h-4 w-4 mr-2" />
                New Email
              </Button>
              <Button variant="outline" className="w-full justify-start border-blue-400 text-blue-100 hover:bg-blue-400 hover:bg-opacity-30">
                <Archive className="h-4 w-4 mr-2" />
                Archive All
              </Button>
              <Button variant="outline" className="w-full justify-start border-blue-400 text-blue-100 hover:bg-blue-400 hover:bg-opacity-30">
                <Star className="h-4 w-4 mr-2" />
                Mark as Important
              </Button>
            </div>
          </div>

          {/* Recent Emails */}
          <div className="p-4 border-b border-blue-400 flex-1">
            <h3 className="text-lg font-semibold text-white mb-3">Recent Emails</h3>
            <div className="space-y-3">
              {loading ? (
                <div className="text-center text-blue-200">Loading emails...</div>
              ) : emails.length === 0 ? (
                <div className="text-center text-blue-200">No emails found</div>
              ) : (
                emails.slice(0, 3).map((email) => (
                  <div
                    key={email.id}
                    onClick={() => handleEmailClick(email)}
                    className={`p-3 bg-blue-500 bg-opacity-20 rounded-lg cursor-pointer hover:bg-opacity-30 transition-colors ${
                      !email.isRead ? 'border-l-4 border-blue-300' : ''
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium text-white text-sm">{email.sender}</span>
                      <div className="flex items-center gap-2">
                        {email.isStarred && <Star className="h-3 w-3 text-yellow-400 fill-current" />}
                        <span className="text-xs text-blue-200">
                          {email.time}
                        </span>
                      </div>
                    </div>
                    <p className="text-sm font-medium text-blue-100 mb-1 truncate">
                      {email.subject}
                    </p>
                    <p className="text-xs text-blue-200 truncate">
                      {email.body?.substring(0, 50) || 'No preview available'}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* AI Suggestions */}
          <div className="p-4 border-b border-blue-400">
            <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
              <Sparkles className="h-5 w-5" />
              AI Suggestions
            </h3>
            <div className="space-y-2">
              <div className="p-3 bg-blue-500 bg-opacity-20 rounded-lg">
                <p className="text-sm text-blue-100">
                  Consider adding a professional greeting to improve response rates
                </p>
              </div>
              <div className="p-3 bg-blue-500 bg-opacity-20 rounded-lg">
                <p className="text-sm text-blue-100">
                  Your email length is optimal for engagement
                </p>
              </div>
            </div>
          </div>

          {/* Email Templates */}
          <div className="p-4">
            <h3 className="text-lg font-semibold text-white mb-3">Quick Templates</h3>
            <div className="space-y-2">
              <Button variant="outline" size="sm" className="w-full justify-start border-blue-400 text-blue-100 hover:bg-blue-400 hover:bg-opacity-30">
                <MessageSquare className="h-4 w-4 mr-2" />
                Thank You Note
              </Button>
              <Button variant="outline" size="sm" className="w-full justify-start border-blue-400 text-blue-100 hover:bg-blue-400 hover:bg-opacity-30">
                <Clock className="h-4 w-4 mr-2" />
                Meeting Request
              </Button>
              <Button variant="outline" size="sm" className="w-full justify-start border-blue-400 text-blue-100 hover:bg-blue-400 hover:bg-opacity-30">
                <Users className="h-4 w-4 mr-2" />
                Team Update
              </Button>
            </div>
          </div>
        </div>
      </div>
        </>
      )}
    </div>
  );
}