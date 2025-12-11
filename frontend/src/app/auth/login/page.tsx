'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { postData } from '@/lib/api';

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await postData('/auth/login', { email, password });
      if (res.error) {
        setError(res.error);
      } else {
        login(res); // stores tokens and redirects to dashboard
      }
    } catch (err) {
      setError('Login failed. Please try again.');
    }
  };

  const handleGoogleLogin = async () => {
    try {
      // Redirect directly to the backend Google OAuth endpoint
      window.location.href = 'http://localhost:3002/auth/google';
    } catch (err) {
      setError('Google login is not available');
    }
  };

  return (
    <div className="max-w-md mx-auto mt-20 p-6 border rounded shadow">
      <h1 className="text-2xl mb-4">Login</h1>
      {error && <p className="text-red-500">{error}</p>}
      <form onSubmit={handleLogin} className="space-y-4">
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          className="w-full border p-2 rounded"
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          className="w-full border p-2 rounded"
          required
        />
        <button
          type="submit"
          className="w-full bg-blue-600 text-white p-2 rounded"
        >
          Login
        </button>
      </form>

      <div className="mt-4 text-center">
        <p className="text-gray-600 mb-2">Or</p>
        <button
          onClick={handleGoogleLogin}
          className="w-full bg-red-600 text-white p-2 rounded"
        >
          Login with Google
        </button>
      </div>
    </div>
  );
}