'use client';

import { useUser } from '@clerk/nextjs';
import Link from 'next/link';
import InboxPage from './inbox/page';
import { Mail, ArrowRight } from 'lucide-react';

export default function Home() {
  const { isSignedIn } = useUser();

  if (isSignedIn) {
    return <InboxPage />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 to-indigo-700 text-white">
      {/* Navigation */}
      <nav className="flex items-center justify-between p-6">
        <div className="flex items-center gap-2 text-2xl font-bold">
          <Mail className="h-8 w-8" />
          E-MassCom
        </div>
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

      {/* Hero Section */}
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-100px)] px-4 text-center">
        <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
          Your AI-Powered Email Client
        </h1>
        <p className="text-xl md:text-2xl text-blue-100 mb-8 max-w-2xl">
          Manage, organize, and respond to emails with the power of AI. Smart compose, full-text search, and more.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 mb-12">
          <Link
            href="/auth/signup"
            className="px-8 py-4 bg-white text-blue-600 rounded-lg font-bold text-lg hover:bg-gray-100 transition-colors flex items-center justify-center gap-2"
          >
            Get Started <ArrowRight className="h-5 w-5" />
          </Link>
          {/* <Link
            href="/auth/signin"
            className="px-8 py-4 border-2 border-white rounded-lg font-bold text-lg hover:bg-white hover:text-blue-600 transition-colors"
          >
            Sign In
          </Link> */}
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-8 max-w-4xl mt-16">
          <div className="bg-blue-500 bg-opacity-50 backdrop-blur p-6 rounded-lg">
            <div className="text-3xl mb-2">✨</div>
            <h3 className="text-xl font-bold mb-2">AI Smart Compose</h3>
            <p className="text-blue-100">Write emails faster with AI-powered suggestions</p>
          </div>
          <div className="bg-blue-500 bg-opacity-50 backdrop-blur p-6 rounded-lg">
            <div className="text-3xl mb-2">🔍</div>
            <h3 className="text-xl font-bold mb-2">Full-Text Search</h3>
            <p className="text-blue-100">Find any email instantly with powerful search</p>
          </div>
          <div className="bg-blue-500 bg-opacity-50 backdrop-blur p-6 rounded-lg">
            <div className="text-3xl mb-2">🤖</div>
            <h3 className="text-xl font-bold mb-2">AI Chatbot</h3>
            <p className="text-blue-100">Get help organizing and composing emails</p>
          </div>
        </div>
      </div>
    </div>
  );
}