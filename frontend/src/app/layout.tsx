import './globals.css'; // Tailwind and global styles
import { AuthProvider } from '@/context/AuthContext';
import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Multi-Tenant Project Management',
  description: 'Project Management Platform',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="flex flex-col min-h-screen">
        <AuthProvider>
          {/* Header */}
          <header className="bg-blue-600 text-white p-4 flex justify-between items-center">
            <h1 className="text-xl font-bold">Multi-Tenant PM</h1>
            <nav className="space-x-4">
              <Link href="/" className="hover:underline">
                Home
              </Link>
              <Link href="/auth/login" className="hover:underline">
                Login
              </Link>
              <Link href="/auth/register" className="hover:underline">
                Register
              </Link>
            </nav>
          </header>

          {/* Main Content */}
          <main className="flex-1">{children}</main>

          {/* Footer */}
          <footer className="bg-gray-100 text-center text-gray-600 py-4 mt-auto">
            &copy; {new Date().getFullYear()} Multi-Tenant Project Manager. All rights reserved.
          </footer>
        </AuthProvider>
      </body>
    </html>
  );
}
