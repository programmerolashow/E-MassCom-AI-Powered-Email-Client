'use client';

import { Star, Archive } from 'lucide-react';
import { Button } from './ui/button';

// ✅ Define a consistent Email type
export interface Email {
  id: string;
  sender: string;
  subject: string;
  body: string;
  time: string;
  isRead: boolean;
  isStarred: boolean;
}

interface EmailListProps {
  emails: Email[];
  loading: boolean;
  onSelectEmail: (email: Email) => void; // ✅ FIXED
}

export default function EmailList({ emails, loading, onSelectEmail }: EmailListProps) {
  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b">
        <h2 className="text-lg font-semibold">Inbox</h2>
      </div>

      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="text-center py-8">Loading emails...</div>
        ) : emails.length === 0 ? (
          <div className="text-center py-8 text-gray-500">No emails found</div>
        ) : (
          emails.map((email) => (
            <div
              key={email.id}
              className={`p-4 border-b hover:bg-gray-50 cursor-pointer ${
                !email.isRead ? 'bg-blue-50' : ''
              }`}
              onClick={() => onSelectEmail(email)}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium truncate">{email.sender}</span>
                    <span className="text-xs text-gray-500">{email.time}</span>
                  </div>

                  <div className="font-medium text-sm mb-1 truncate">
                    {email.subject}
                  </div>

                  <div className="text-sm text-gray-600 truncate">
                    {email.body}
                  </div>
                </div>

                <div className="flex gap-1 ml-2">
                  <Button variant="ghost" size="icon" className="h-6 w-6">
                    <Star
                      className={`h-4 w-4 ${
                        email.isStarred ? 'fill-yellow-400 text-yellow-400' : ''
                      }`}
                    />
                  </Button>

                  <Button variant="ghost" size="icon" className="h-6 w-6">
                    <Archive className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}