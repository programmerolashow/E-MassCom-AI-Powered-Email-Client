'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useApiClient } from '../../../../lib/api';

function AurinkoCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const apiClient = useApiClient();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const code = searchParams.get('code');
        const state = searchParams.get('state');

        if (!code || !state) {
          setStatus('error');
          setMessage('Missing authorization code or state parameter');
          return;
        }

        // Exchange code for access token
        const response = await fetch('/api/auth/callback', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ code, state }),
        });

        if (!response.ok) {
          throw new Error('Failed to complete authentication');
        }

        const result = await response.json();

        setStatus('success');
        setMessage('Email account connected successfully! Redirecting...');

        // TODO: Sync emails after successful connection
        // try {
        //   await apiClient.syncEmails();
        // } catch (syncError) {
        //   console.error('Email sync failed:', syncError);
        //   // Don't fail the whole process if sync fails
        // }

        // Redirect to inbox after a short delay
        setTimeout(() => {
          router.push('/inbox');
        }, 2000);

      } catch (error) {
        console.error('Aurinko callback error:', error);
        setStatus('error');
        setMessage('Failed to connect email account. Please try again.');
      }
    };

    handleCallback();
  }, [searchParams, router, apiClient]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center text-white">
      <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-lg p-8 max-w-md w-full mx-4 text-center">
        {status === 'loading' && (
          <>
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
            <h2 className="text-xl font-semibold mb-2">Connecting your email...</h2>
            <p className="text-blue-200">Please wait while we set up your email integration.</p>
          </>
        )}

        {status === 'success' && (
          <>
            <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold mb-2">Email Connected!</h2>
            <p className="text-blue-200">{message}</p>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="w-12 h-12 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold mb-2">Connection Failed</h2>
            <p className="text-blue-200 mb-4">{message}</p>
            <button
              onClick={() => router.push('/inbox')}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              Return to Inbox
            </button>
          </>
        )}
      </div>
    </div>
  );
}

export default function AurinkoCallbackPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center text-white">
        <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-lg p-8 max-w-md w-full mx-4 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold mb-2">Loading...</h2>
        </div>
      </div>
    }>
      <AurinkoCallbackContent />
    </Suspense>
  );
}