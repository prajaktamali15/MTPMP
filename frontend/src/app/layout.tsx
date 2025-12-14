import './globals.css'; // Tailwind and global styles
import { AuthProvider } from '@/context/AuthContext';
import Header from '@/components/Header';
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
          <Header />
          
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