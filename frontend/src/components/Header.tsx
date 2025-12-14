'use client';

import { useAuth } from '../context/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function Header() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const orgId = typeof window !== 'undefined' ? localStorage.getItem('current_org_id') : null;

  const handleLogout = () => {
    logout();
    // Clear organization ID on logout
    if (typeof window !== 'undefined') {
      localStorage.removeItem('current_org_id');
    }
  };

  return (
    <header className="bg-blue-600 text-white p-4 flex justify-between items-center">
      <div className="flex items-center space-x-6">
        <h1 className="text-xl font-bold">Multi-Tenant PM</h1>
        {user && orgId && (
          <nav className="flex space-x-4">
            <Link href="/dashboard" className="hover:underline">
              Dashboard
            </Link>
            <Link href="/projects" className="hover:underline">
              Projects
            </Link>
            <Link href="/tasks" className="hover:underline">
              Tasks
            </Link>
          </nav>
        )}
      </div>
      
      <div className="flex items-center space-x-4">
        {user ? (
          <>
            {orgId && (
              <Link href="/org/settings" className="hover:underline">
                Settings
              </Link>
            )}
            <button 
              onClick={handleLogout}
              className="bg-red-500 hover:bg-red-600 px-3 py-1 rounded"
            >
              Logout
            </button>
          </>
        ) : (
          <nav className="flex space-x-4">
            <Link href="/auth/login" className="hover:underline">
              Login
            </Link>
            <Link href="/auth/register" className="hover:underline">
              Register
            </Link>
          </nav>
        )}
      </div>
    </header>
  );
}