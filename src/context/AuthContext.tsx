import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface TeacherUser {
  email: string;
  name: string;
  role: string;
  classes: string[];
}

interface AuthContextType {
  user: TeacherUser | null;
  login: (userData: TeacherUser) => void;
  logout: () => void;
  isAuthenticated: boolean;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<TeacherUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Auto-Login: Check localStorage when App opens
  useEffect(() => {
    const checkAutoLogin = () => {
      try {
        const storedUser = localStorage.getItem('teacher_auth_data');
        if (storedUser) {
          const parsedUser = JSON.parse(storedUser);
          if (parsedUser && parsedUser.email) {
            setUser(parsedUser);
          }
        }
      } catch (error) {
        console.error('Failed to parse auth data:', error);
        localStorage.removeItem('teacher_auth_data');
      } finally {
        setIsLoading(false);
      }
    };

    checkAutoLogin();
  }, []);

  // Login Method
  const login = (userData: TeacherUser) => {
    setUser(userData);
    localStorage.setItem('teacher_auth_data', JSON.stringify(userData));
  };

  // Logout Method
  const logout = () => {
    setUser(null);
    localStorage.removeItem('teacher_auth_data');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated: !!user, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

// Custom Hook សម្រាប់ប្រើប្រាស់ AuthContext ងាយស្រួល
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
