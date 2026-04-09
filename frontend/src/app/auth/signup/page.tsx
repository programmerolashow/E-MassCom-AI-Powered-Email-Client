'use client';

import { useState } from 'react';
import { useSignUp } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Mail } from 'lucide-react';

export default function SignUpPage() {
  const { signUp } = useSignUp();
  const router = useRouter();

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.firstName.trim() === '' || formData.lastName.trim() === '') {
      setError('First and last name are required');
      return;
    }

    setIsLoading(true);
    setError('');

    if (!signUp) {
      setError('Authentication is not available yet. Please try again in a moment.');
      setIsLoading(false);
      return;
    }

    try {
      const result = await (signUp).create({
        firstName: formData.firstName,
        lastName: formData.lastName,
        emailAddress: formData.email,
        password: formData.password,
      });

      if (result?.status === 'complete') {
        router.push('/inbox');
      } else {
        router.push('/auth/verify-email');
      }
    } catch (err: unknown) {
      if (err && typeof err === 'object' && 'errors' in err) {
        const clerkError = err as { errors?: { code?: string; message?: string }[] };
        if (clerkError.errors && clerkError.errors.length > 0) {
          const errorCode = clerkError.errors[0].code;
          if (errorCode === 'form_identifier_exists') {
            setError('User already exists. Please sign in instead.');
          } else {
            setError(clerkError.errors[0].message || 'An error occurred during sign up');
          }
        } else {
          setError('An error occurred during sign up');
        }
      } else {
        setError('An error occurred during sign up');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignUp = async () => {
    if (!signUp) {
      setError('Authentication is not available yet. Please try again in a moment.');
      return;
    }

    setError('');
    setSuccess('Redirecting to Google...');

    try {
      await (signUp).authenticateWithRedirect({
        strategy: 'oauth_google',
        redirectUrlComplete: '/inbox',
      });
    } catch (err: unknown) {
      setSuccess('');
      setError('Failed to sign up with Google. Please try again.');
      console.error(err);
    }
  };

  const handleAppleSignUp = async () => {
    if (!signUp) {
      setError('Authentication is not available yet. Please try again in a moment.');
      return;
    }

    setError('');
    setSuccess('Redirecting to Apple...');

    try {
      await (signUp).authenticateWithRedirect({
        strategy: 'oauth_apple',
        redirectUrlComplete: '/inbox',
      });
    } catch (err: unknown) {
      setSuccess('');
      setError('Failed to sign up with iCloud. Please try again.');
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-blue-600 to-indigo-700 text-white">
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

      {/* Auth Section */}
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)] px-4">
        <div className="w-full max-w-md bg-white text-gray-900 rounded-lg shadow-xl p-8 mb-8">
          <div className="text-center mb-6">
            <h2 className="text-3xl font-bold mb-2">Create Your Account</h2>
            <p className="text-gray-600">Join E-MassCom and start managing your emails with AI</p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          {success && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-md">
              <p className="text-green-600 text-sm">{success}</p>
            </div>
          )}

          {/* Social Sign Up */}
          <div className="space-y-3 mb-6">
            <Button
              onClick={handleGoogleSignUp}
              variant="outline"
              className="w-full bg-white hover:bg-gray-50 border-gray-300"
              type="button"
            >
              <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Sign up with Google
            </Button>

            <Button
              onClick={handleAppleSignUp}
              variant="outline"
              className="w-full bg-white hover:bg-gray-50 border-gray-300"
              type="button"
            >
              <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
              </svg>
              Sign up with iCloud
            </Button>
          </div>

          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-2 text-muted-foreground">Or continue with</span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Input
                name="firstName"
                type="text"
                placeholder="First name"
                value={formData.firstName}
                onChange={handleInputChange}
                required
                className="bg-white"
              />
              <Input
                name="lastName"
                type="text"
                placeholder="Last name"
                value={formData.lastName}
                onChange={handleInputChange}
                required
                className="bg-white"
              />
            </div>

            <Input
              name="email"
              type="email"
              placeholder="Email address"
              value={formData.email}
              onChange={handleInputChange}
              required
              className="bg-white"
            />

            <Input
              name="password"
              type="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleInputChange}
              required
              className="bg-white"
            />

            <Input
              name="confirmPassword"
              type="password"
              placeholder="Confirm password"
              value={formData.confirmPassword}
              onChange={handleInputChange}
              required
              className="bg-white"
            />

            <Button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white"
              disabled={isLoading}
            >
              {isLoading ? 'Creating account...' : 'Create account'}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-600">
              Already have an account?{' '}
              <Link href="/auth/signin" className="text-blue-600 font-medium hover:underline">
                Sign in
              </Link>
            </p>
          </div>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-6 max-w-4xl">
          <div className="bg-blue-500 bg-opacity-50 backdrop-blur p-4 rounded-lg text-center">
            <div className="text-2xl mb-2">✨</div>
            <h3 className="text-lg font-bold mb-1">AI Smart Compose</h3>
            <p className="text-blue-100 text-sm">Write emails faster with AI-powered suggestions</p>
          </div>
          <div className="bg-blue-500 bg-opacity-50 backdrop-blur p-4 rounded-lg text-center">
            <div className="text-2xl mb-2">🔍</div>
            <h3 className="text-lg font-bold mb-1">Full-Text Search</h3>
            <p className="text-blue-100 text-sm">Find any email instantly with powerful search</p>
          </div>
          <div className="bg-blue-500 bg-opacity-50 backdrop-blur p-4 rounded-lg text-center">
            <div className="text-2xl mb-2">🤖</div>
            <h3 className="text-lg font-bold mb-1">AI Chatbot</h3>
            <p className="text-blue-100 text-sm">Get help organizing and composing emails</p>
          </div>
        </div>
      </div>
    </div>
  );
}