'use client';

import { useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { useApiClient } from '../lib/api';

export function UserSync() {
  const { user, isLoaded } = useUser();
  const apiClient = useApiClient();

  useEffect(() => {
    if (isLoaded && user) {
      // Sync user with backend
      apiClient.syncUser({
        clerkId: user.id,
        email: user.primaryEmailAddress?.emailAddress || '',
        name: user.fullName || undefined,
      }).then((result) => {
        if (result.error) {
          console.error('Failed to sync user:', result.error);
        } else {
          console.log('User synced successfully:', result.data);
        }
      });
    }
  }, [isLoaded, user, apiClient]);

  return null; // This component doesn't render anything
}