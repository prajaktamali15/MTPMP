'use client';
import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';

interface AuthContextType {
  user: any;
  login: (tokens: { access_token: string; refresh_token: string }) => void;
  logout: () => void;
  loginWithToken: (token: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<any>(null);
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Load JWT from localStorage on mount
  useEffect(() => {
    const accessToken = localStorage.getItem('access_token');
    const refreshToken = localStorage.getItem('refresh_token');
    if (accessToken && refreshToken) {
      setUser({ token: accessToken });
    }
  }, []);

  // Handle tokens from Google OAuth redirect (optional)
  useEffect(() => {
    const access = searchParams?.get('access_token');
    const refresh = searchParams?.get('refresh_token');
    if (access && refresh) {
      login({ access_token: access, refresh_token: refresh });
      // Remove query params after login
      const newUrl = new URL(window.location.href);
      newUrl.searchParams.delete('access_token');
      newUrl.searchParams.delete('refresh_token');
      window.history.replaceState({}, document.title, newUrl.toString());
    }
  }, [searchParams]);

  const login = (tokens: { access_token: string; refresh_token: string }) => {
    localStorage.setItem('access_token', tokens.access_token);
    localStorage.setItem('refresh_token', tokens.refresh_token);
    setUser({ token: tokens.access_token });
    router.push('/dashboard'); // redirect after login
  };

  const loginWithToken = (token: string) => {
    localStorage.setItem('access_token', token);
    setUser({ token });
    router.push('/dashboard');
  };

  const logout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    setUser(null);
    router.push('/auth/login');
  };

  // Protect pages (except auth pages and landing page)
  useEffect(() => {
    if (!user && !pathname.startsWith('/auth') && pathname !== '/') {
      router.push('/auth/login');
    }
  }, [user, pathname, router]);

  return (
    <AuthContext.Provider value={{ user, login, logout, loginWithToken }}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook to use AuthContext
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};