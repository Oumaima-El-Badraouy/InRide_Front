import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// Types
interface User {
  id: string;
  email: string;
  password: string;
  role: 'CLIENT' | 'AGENCY';
  firstName: string;
  lastName: string;
  phone: string;
  nationality: string;
  avatarUrl?: string;
  companyName?: string;
  createdAt: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => { success: boolean; message: string };
  logout: () => void;
  isLoading: boolean;
}

const STORAGE_KEYS = {
  USERS: 'inride_users',
  CURRENT_USER: 'inride_current_user',
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function getFromStorage<T>(key: string): T[] {
  const data = localStorage.getItem(key);
  return data ? JSON.parse(data) : [];
}

function initializeDatabase(): void {
  const users = getFromStorage<User>(STORAGE_KEYS.USERS);
  if (users.length === 0) {
    const generateId = () => Math.random().toString(36).substring(2) + Date.now().toString(36);

    const sampleUsers = [
      {
        id: generateId(),
        email: 'client@example.com',
        password: 'password123',
        role: 'CLIENT' as const,
        firstName: 'Alex',
        lastName: 'Martin',
        phone: '+1 555-0100',
        nationality: 'USA',
        createdAt: new Date().toISOString(),
      },
      {
        id: generateId(),
        email: 'elite@example.com',
        password: 'password123',
        role: 'AGENCY' as const,
        firstName: 'John',
        lastName: 'Smith',
        phone: '+1 555-0101',
        nationality: 'USA',
        companyName: 'Elite Car Rental',
        createdAt: new Date().toISOString(),
      },
      {
        id: generateId(),
        email: 'swift@example.com',
        password: 'password123',
        role: 'AGENCY' as const,
        firstName: 'Maria',
        lastName: 'Garcia',
        phone: '+1 555-0102',
        nationality: 'Spain',
        companyName: 'Swift Wheels',
        createdAt: new Date().toISOString(),
      },
      {
        id: generateId(),
        email: 'premium@example.com',
        password: 'password123',
        role: 'AGENCY' as const,
        firstName: 'Ahmed',
        lastName: 'Hassan',
        phone: '+1 555-0103',
        nationality: 'UAE',
        companyName: 'Premium Drive',
        createdAt: new Date().toISOString(),
      },
    ];
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(sampleUsers));
  }
}

function getCurrentUser(): User | null {
  const data = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
  return data ? JSON.parse(data) : null;
}

function loginUser(email: string, password: string): User | null {
  const users = getFromStorage<User>(STORAGE_KEYS.USERS);
  const user = users.find((u: User) => u.email === email && u.password === password);
  if (user) {
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
    return user;
  }
  return null;
}

function logoutUser(): void {
  localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    initializeDatabase();
    const currentUser = getCurrentUser();
    setUser(currentUser);
    setIsLoading(false);
  }, []);

  const login = (email: string, password: string) => {
    const loggedInUser = loginUser(email, password);
    if (loggedInUser) {
      setUser(loggedInUser);
      return { success: true, message: 'Login successful!' };
    }
    return { success: false, message: 'Invalid email or password' };
  };

  const logout = () => {
    logoutUser();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading }}>
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
