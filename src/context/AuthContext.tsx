import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { authService } from '../services/api';
import { User, LoginCredentials, RegisterData, AuthResponse, ApiError } from '../types';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: ApiError | null;
  register: (userData: RegisterData) => Promise<{ success: boolean; data?: AuthResponse; error?: ApiError }>;
  login: (credentials: LoginCredentials) => Promise<{ success: boolean; data?: AuthResponse; error?: ApiError }>;
  logout: () => Promise<void>;
  setError: (error: ApiError | null) => void;
}

interface AuthProviderProps {
  children: ReactNode;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<ApiError | null>(null);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async (): Promise<void> => {
    const token = localStorage.getItem('access_token') || 
                  sessionStorage.getItem('access_token') || 
                  localStorage.getItem('token') || 
                  sessionStorage.getItem('token');
    
    if (token) {
      try {
        const response = await authService.getProfile();
        setUser(response.data.user);
      } catch (err: any) {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        sessionStorage.removeItem('access_token');
        sessionStorage.removeItem('refresh_token');
        setUser(null);
      }
    }
    setLoading(false);
  };

  const register = async (userData: RegisterData): Promise<{ success: boolean; data?: AuthResponse; error?: ApiError }> => {
    try {
      setError(null);
      const response = await authService.register(userData);
      localStorage.setItem('access_token', response.data.access);
      localStorage.setItem('refresh_token', response.data.refresh);
      setUser(response.data.user);
      return { success: true, data: response.data };
    } catch (err: any) {
      const errorData: ApiError = err.response?.data || { message: 'Registration failed' };
      setError(errorData);
      return { success: false, error: errorData };
    }
  };

  const login = async (credentials: LoginCredentials): Promise<{ success: boolean; data?: AuthResponse; error?: ApiError }> => {
    try {
      setError(null);
      const response = await authService.login(credentials);
      localStorage.setItem('access_token', response.data.access);
      localStorage.setItem('refresh_token', response.data.refresh);
      setUser(response.data.user);
      return { success: true, data: response.data };
    } catch (err: any) {
      const errorData: ApiError = err.response?.data || { message: 'Login failed' };
      setError(errorData);
      return { success: false, error: errorData };
    }
  };

  const logout = async (): Promise<void> => {
    try {
      const refreshToken = localStorage.getItem('refresh_token') || 
                          sessionStorage.getItem('refresh_token');
      if (refreshToken) {
        await authService.logout(refreshToken);
      }
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user');
      sessionStorage.removeItem('access_token');
      sessionStorage.removeItem('refresh_token');
      setUser(null);
    }
  };

  const value: AuthContextType = {
    user,
    loading,
    error,
    register,
    login,
    logout,
    setError,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};