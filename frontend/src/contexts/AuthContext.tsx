import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import apiClient from '../lib/axios';

type User = {
  id: string;
  email: string;
  full_name: string;
  phone?: string;
  institution?: string;
  position?: string;
  city?: string;
  role?: string;
  avatar_url?: string;
};

type AuthContextType = {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  loginWithGoogle: (credential: string) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
  loading: boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in and validate token
    const checkAuth = async () => {
      const token = localStorage.getItem('token');

      if (token) {
        try {
          // Always fetch fresh user data from backend to get latest role/profile
          const response = await apiClient.get('/api/auth/me');
          const freshUser = response.data.user;
          // Update localStorage with fresh data
          localStorage.setItem('user', JSON.stringify(freshUser));
          setUser(freshUser);
        } catch (error) {
          // Token invalid, clear storage
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          setUser(null);
        }
      }
      setLoading(false);
    };

    checkAuth();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await apiClient.post('/api/auth/login', { email, password });
      const { token, user: userData } = response.data;

      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Login gagal');
    }
  };

  const loginWithGoogle = async (credential: string) => {
    try {
      const response = await apiClient.post('/api/auth/google/login', { credential });
      const { token, user: userData } = response.data;

      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Login Google gagal');
    }
  };

  const register = async (name: string, email: string, password: string) => {
    try {
      const response = await apiClient.post('/api/auth/register', {
        fullName: name,
        email,
        password,
      });
      const { token, user: userData } = response.data;

      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Registrasi gagal');
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  const refreshUser = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setUser(null);
      return;
    }
    const response = await apiClient.get('/api/auth/me');
    const nextUser = response.data.user as User;
    localStorage.setItem('user', JSON.stringify(nextUser));
    setUser(nextUser);
  };

  return (
    <AuthContext.Provider value={{ user, login, register, loginWithGoogle, logout, refreshUser, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
