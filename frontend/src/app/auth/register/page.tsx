'use client';
import { useState } from 'react';
import { postData } from '@/lib/api';
import { useRouter } from 'next/navigation';

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Send only the exact fields expected by the backend
      const requestData = {
        email: email.trim(),
        password: password.trim(),
        name: name.trim() || undefined // Send undefined if name is empty
      };
      
      console.log('Sending registration data:', requestData);
      
      const res = await postData('/auth/register', requestData);

      if (res.error) {
        setError(res.error);
      } else {
        // Show success message and redirect to login page
        setSuccess(true);
        setTimeout(() => {
          router.push('/auth/login');
        }, 2000); // Redirect after 2 seconds
      }
    } catch (err: any) {
      console.error('Registration error:', err);
      setError(err.message || 'Registration failed. Please try again.');
    }
  };

  return (
    <div className="max-w-md mx-auto mt-20 p-6 border rounded shadow">
      <h1 className="text-2xl mb-4">Register</h1>
      {error && <p className="text-red-500">{error}</p>}
      {success && <p className="text-green-500">Registration successful! Redirecting to login...</p>}
      <form onSubmit={handleRegister} className="space-y-4">
        <input
          type="text"
          placeholder="Name"
          value={name}
          onChange={e => setName(e.target.value)}
          className="w-full border p-2 rounded"
        />
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
          className="w-full bg-green-600 text-white p-2 rounded"
        >
          Register
        </button>
      </form>
    </div>
  );
}