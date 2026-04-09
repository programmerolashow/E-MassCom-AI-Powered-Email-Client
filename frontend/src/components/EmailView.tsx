import { Reply, ReplyAll, Forward, Star, Archive, Trash2, ArrowLeft } from 'lucide-react';
import { Button } from './ui/button';
import { Email } from './EmailList';

interface EmailViewProps {
  email: Email;
  onBack?: () => void;
}

export default function EmailView({ email, onBack }: EmailViewProps) {
  return (
    <div className="flex flex-col h-full">
      <div className="p-6 border-b">
        <div className="flex items-center justify-between mb-4">
          {onBack && (
            <Button variant="ghost" size="sm" onClick={onBack} className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
          )}
          <h1 className="text-2xl font-semibold flex-1 text-center">{email.subject}</h1>
          <div className="flex gap-2">
            <Button variant="ghost" size="icon">
              <Star className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon">
              <Archive className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon">
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <div className="flex items-center justify-between">
          <div>
            <div className="font-medium">{email.sender}</div>
            <p>{email.body}</p>
            <div className="text-sm text-gray-500">to me</div>
          </div>
          <div className="text-sm text-gray-500">{email.time}</div>
        </div>
      </div>
      <div className="flex-1 p-6 overflow-y-auto">
        <div className="prose max-w-none">
          <p>{email.body}</p>
          <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.</p>
          <p>Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.</p>
        </div>
      </div>
      <div className="p-4 border-t bg-gray-50">
        <div className="flex gap-2">
          <Button>
            <Reply className="h-4 w-4 mr-2" />
            Reply
          </Button>
          <Button variant="outline">
            <ReplyAll className="h-4 w-4 mr-2" />
            Reply All
          </Button>
          <Button variant="outline">
            <Forward className="h-4 w-4 mr-2" />
            Forward
          </Button>
        </div>
      </div>
    </div>
  );
}