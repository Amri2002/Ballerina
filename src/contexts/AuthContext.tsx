import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiService, User as ApiUser, LoginRequest, SignupRequest } from '../services/api';

interface User {
  id: string;
  email: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  signup: (email: string, name: string, password: string) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true); // Start with loading true
  const [error, setError] = useState<string | null>(null);

  // Check if user is already logged in on app start
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const token = localStorage.getItem('auth_token');
        const savedUser = localStorage.getItem('auth_user');
        
        if (token && savedUser) {
          // First, set the user from localStorage immediately to prevent flash
          const parsedUser = JSON.parse(savedUser);
          setUser(parsedUser);
          
          // Then verify the token is still valid
          try {
            const userData = await apiService.getCurrentUser(token);
            setUser(userData);
            // Update localStorage with fresh user data
            localStorage.setItem('auth_user', JSON.stringify(userData));
          } catch (error) {
            console.log('Token validation failed, but keeping user logged in with cached data');
            // Don't clear the user data if the API is down - keep them logged in
            // This prevents the "demo-user" issue when backend is unavailable
          }
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
        // Only clear data if there's a parsing error, not network errors
        if (error instanceof SyntaxError) {
          localStorage.removeItem('auth_token');
          localStorage.removeItem('auth_user');
          setUser(null);
        }
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    setLoading(true);
    setError(null);
    
    try {
      const loginData: LoginRequest = { email, password };
      const response = await apiService.login(loginData);
      
      setUser(response.user);
      localStorage.setItem('auth_token', response.token);
      localStorage.setItem('auth_user', JSON.stringify(response.user));
      
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Login failed';
      setError(errorMessage);
      
      // If it's a network error, provide a more helpful message
      if (errorMessage.includes('fetch') || errorMessage.includes('network')) {
        setError('Unable to connect to server. Please check your internet connection or try again later.');
      }
      
      return false;
    } finally {
      setLoading(false);
    }
  };

  const signup = async (email: string, name: string, password: string): Promise<boolean> => {
    setLoading(true);
    setError(null);
    
    try {
      const signupData: SignupRequest = { email, name, password };
      const response = await apiService.signup(signupData);
      
      setUser(response.user);
      localStorage.setItem('auth_token', response.token);
      localStorage.setItem('auth_user', JSON.stringify(response.user));
      
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Signup failed';
      setError(errorMessage);
      
      // If it's a network error, provide a more helpful message
      if (errorMessage.includes('fetch') || errorMessage.includes('network')) {
        setError('Unable to connect to server. Please check your internet connection or try again later.');
      }
      
      return false;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setError(null);
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
  };

  const value = {
    user,
    login,
    signup,
    logout,
    isAuthenticated: !!user,
    loading,
    error
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
