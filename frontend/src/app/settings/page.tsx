'use client';

import { UserProfile } from '@clerk/nextjs';
import Link from 'next/link';
import { Button } from '../../components/ui/button';
import { ArrowLeft } from 'lucide-react';

export default function SettingsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto">
        <div className="sticky top-0 bg-white border-b p-4 flex items-center gap-4">
          <Link href="/inbox">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <h1 className="text-2xl font-bold">Account Settings</h1>
        </div>

        <div className="p-6">
          <UserProfile
            appearance={{
              elements: {
                rootBox: 'w-full',
                cardBox: 'w-full shadow-none border-0',
              },
            }}
          />
        </div>
      </div>
    </div>
  );
}