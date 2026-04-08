'use client';

import Link from 'next/link';
import { Inbox, Send, Star, Archive, Trash2, Settings } from 'lucide-react';
import { Button } from './ui/button';

const folders = [
  { name: 'Inbox', icon: Inbox, count: 12, href: '#' },
  { name: 'Sent', icon: Send, count: 0, href: '#' },
  { name: 'Starred', icon: Star, count: 3, href: '#' },
  { name: 'Archive', icon: Archive, count: 0, href: '#' },
  { name: 'Trash', icon: Trash2, count: 0, href: '#' },
];

export default function Sidebar() {
  return (
    <div className="p-4 flex flex-col h-full">
      <nav className="space-y-2 flex-1">
        {folders.map((folder) => (
          <Button
            key={folder.name}
            variant="ghost"
            className="w-full justify-start"
            asChild
          >
            <a href={folder.href}>
              <folder.icon className="h-4 w-4 mr-3" />
              {folder.name}
              {folder.count > 0 && (
                <span className="ml-auto bg-blue-600 text-white text-xs px-2 py-1 rounded-full">
                  {folder.count}
                </span>
              )}
            </a>
          </Button>
        ))}
      </nav>
      <div className="border-t pt-4">
        <Link href="/settings" className="w-full">
          <Button variant="ghost" className="w-full justify-start">
            <Settings className="h-4 w-4 mr-3" />
            Settings
          </Button>
        </Link>
      </div>
    </div>
  );
}