'use client';
import Link from 'next/link';

export default function LandingPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4">
      <h1 className="text-4xl font-bold mb-6 text-center">
        Welcome to Multi-Tenant Project Management
      </h1>
      <p className="text-lg text-gray-700 mb-8 text-center">
        Manage your teams, projects, and tasks all in one place.
      </p>
      <div className="flex gap-4">
        <Link
          href="/auth/login"
          className="bg-blue-600 text-white px-6 py-3 rounded hover:bg-blue-700"
        >
          Login
        </Link>
        <Link
          href="/auth/register"
          className="bg-green-600 text-white px-6 py-3 rounded hover:bg-green-700"
        >
          Register
        </Link>
      </div>
    </div>
  );
}