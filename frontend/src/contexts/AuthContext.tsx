import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import jwtDecode from 'jwt-decode';
import { DecodedToken, Token, User } from '@/types';
import { login as apiLogin, getCurrentUser } from '@/services/api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  userRole: string | null;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [userRole, setUserRole] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  useEffect(() => {
    const initAuth = async () => {
      if (token) {
        try {
          // Validate token expiration
          const decoded = jwtDecode<DecodedToken>(token);
          const currentTime = Date.now() / 1000;
          
          if (decoded.exp < currentTime) {
            // Token expired
            localStorage.removeItem('token');
            setToken(null);
            setUser(null);
            setUserRole(null);
            setIsAuthenticated(false);
            return;
          }

          // Token is valid, fetch user info
          setUserRole(decoded.role);
          const userData = await getCurrentUser(token);
          setUser(userData);
          setIsAuthenticated(true);
        } catch (error) {
          console.error('Error initializing auth:', error);
          localStorage.removeItem('token');
          setToken(null);
          setUser(null);
          setUserRole(null);
          setIsAuthenticated(false);
        }
      }
    };

    initAuth();
  }, [token]);

  const login = async (username: string, password: string) => {
    try {
      const response = await apiLogin(username, password);
      const { access_token } = response;
      
      localStorage.setItem('token', access_token);
      setToken(access_token);
      
      const decoded = jwtDecode<DecodedToken>(access_token);
      setUserRole(decoded.role);
      
      const userData = await getCurrentUser(access_token);
      setUser(userData);
      setIsAuthenticated(true);
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    setUserRole(null);
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated,
        userRole,
        login,
        logout,
      }}
    >
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