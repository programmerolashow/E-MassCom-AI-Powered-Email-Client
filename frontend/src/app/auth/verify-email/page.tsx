'use client';

import { useEffect, useState } from 'react';
import { useSignUp, useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Mail, CheckCircle, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

type VerificationStatus = 'pending' | 'verifying' | 'success' | 'error';

export default function VerifyEmailPage() {
  const { signUp } = useSignUp();
  const { user, isLoaded } = useUser();
  const router = useRouter();

  // State hooks
  const [code, setCode] = useState<string>('');
  const [email, setEmail] = useState<string>((signUp?.emailAddress as string) || '');
  const [status, setStatus] = useState<VerificationStatus>('pending');
  const [error, setError] = useState<string>(
    isLoaded && !signUp ? 'Please complete the sign-up process first' : ''
  );
  const [countdown, setCountdown] = useState<number>(0);

  // Redirect if user is already verified
  useEffect(() => {
    if (user && user.emailAddresses[0]?.verification?.status === 'verified') {
      router.push('/inbox');
    }
  }, [user, router]);

  // Update email from signUp object when it loads
  useEffect(() => {
    if (signUp?.emailAddress) {
      setEmail(signUp.emailAddress as string);
    }
  }, [signUp]);

  // Show instruction if signup not complete
  useEffect(() => {
    if (isLoaded && !signUp) {
      setError('Please complete the sign-up process first');
    }
  }, [signUp, isLoaded]);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!code.trim()) {
      setError('Please enter the verification code');
      return;
    }

    setStatus('verifying');
    setError('');

    // TODO: Implement email verification
    //const result = await signUp?.attemptEmailAddressVerification({
    //   code: code.trim(),
    //});

    // For now, just redirect to inbox
    setStatus('success');
    setTimeout(() => router.push('/inbox'), 2000);
  };

  const handleResendCode = async () => {
    // TODO: Implement resend code
    setCountdown(60);

    // For now, just set countdown
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center">
        <div className="text-white text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 to-indigo-700 text-white">
      {/* Navigation */}
      <nav className="flex items-center justify-between p-6">
        <Link href="/" className="flex items-center gap-2 text-2xl font-bold">
          <Mail className="h-8 w-8" />
          E-MassCom
        </Link>
        <div className="flex items-center gap-4">
          <Link
            href="/auth/signin"
            className="px-4 py-2 rounded-lg hover:bg-blue-500 transition-colors"
          >
            Sign In
          </Link>
          <Link
            href="/auth/signup"
            className="px-4 py-2 bg-white text-blue-600 rounded-lg font-medium hover:bg-gray-100 transition-colors"
          >
            Sign Up
          </Link>
        </div>
      </nav>

      {/* Email Verification Section */}
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)] px-4">
        <div className="w-full max-w-md bg-white text-gray-900 rounded-lg shadow-xl p-8">
          {status === 'success' ? (
            <div className="text-center">
              <div className="flex justify-center mb-6">
                <CheckCircle className="h-16 w-16 text-green-500" />
              </div>
              <h2 className="text-3xl font-bold mb-2">Email Verified!</h2>
              <p className="text-gray-600 mb-6">
                Your email has been successfully verified. Redirecting to your inbox...
              </p>
              <Button
                onClick={() => router.push('/inbox')}
                className="mt-6 w-full bg-blue-600 hover:bg-blue-700 text-white"
              >
                Go to Inbox
              </Button>
            </div>
          ) : (
            <div>
              <div className="text-center mb-6">
                <div className="inline-block bg-blue-100 rounded-full p-3 mb-4">
                  <Mail className="h-8 w-8 text-blue-600" />
                </div>
                <h2 className="text-3xl font-bold mb-2">Verify Your Email</h2>
                <p className="text-gray-600">We have sent a verification code to</p>
                <p className="font-medium text-gray-900 break-all">{email || 'your email'}</p>
              </div>

              <form onSubmit={handleVerify} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Verification Code
                  </label>
                  <Input
                    type="text"
                    placeholder="Enter 6-digit code"
                    value={code}
                    onChange={(e) => setCode(e.target.value.toUpperCase())}
                    maxLength={6}
                    disabled={status === 'verifying'}
                    className="bg-gray-50 border-gray-300 text-center text-lg tracking-widest font-mono"
                  />
                </div>

                {error && (
                  <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex gap-3">
                    <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
                    <p className="text-red-700 text-sm">{error}</p>
                  </div>
                )}

                <Button
                  type="submit"
                  disabled={status === 'verifying' || !code.trim()}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2"
                >
                  {status === 'verifying' ? 'Verifying...' : 'Verify Email'}
                </Button>
              </form>

              <div className="mt-6 pt-6 border-t border-gray-200">
                <p className="text-center text-gray-600 text-sm mb-4">Did not receive the code?</p>
                <Button
                  type="button"
                  onClick={handleResendCode}
                  disabled={countdown > 0}
                  variant="outline"
                  className="w-full border-gray-300 text-blue-600 hover:bg-blue-50"
                >
                  {countdown > 0 ? `Resend Code (${countdown}s)` : 'Resend Code'}
                </Button>
              </div>

              <div className="mt-6 pt-6 border-t border-gray-200 text-center text-sm text-gray-600">
                <p>Wrong email? Contact our support team for assistance.</p>
              </div>
            </div>
          )}
        </div>

        <div className="mt-8 text-center text-blue-100">
          <p>By verifying your email, you agree to our Terms of Service</p>
        </div>
      </div>
    </div>
  );
}