import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '../types';
import { authAPI } from '../services/api';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  isAuthenticated: boolean;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initializeAuth = async () => {
      const storedUser = localStorage.getItem('currentUser');
      const token = localStorage.getItem('token');
      
      if (storedUser && token) {
        try {
          // Validate token by making a test request
          const user = JSON.parse(storedUser);
          setUser(user);
        } catch (error) {
          // If token is invalid, clear storage
          console.log('Invalid stored authentication data');
          localStorage.removeItem('currentUser');
          localStorage.removeItem('token');
        }
      }
      setLoading(false);
    };

    initializeAuth();
  }, []);

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      console.log('AuthContext: Attempting login for email:', email);
      const response = await authAPI.login(email, password);
      console.log('AuthContext: Login API response:', response);
      setUser(response.user);
      localStorage.setItem('currentUser', JSON.stringify(response.user));
      localStorage.setItem('token', response.token);
      console.log('AuthContext: Login successful');
      return { success: true };
    } catch (error: any) {
      console.error('AuthContext: Login error:', error);
      return { 
        success: false, 
        error: error.response?.data?.error || 'Invalid credentials. Please try again.' 
      };
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('currentUser');
    localStorage.removeItem('token');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated: !!user, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
