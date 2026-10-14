import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { toast } from 'sonner';

export type UserRole = 'admin' | 'staff' | 'engineer' | 'manager';

export interface User {
  id: string;
  username: string;
  email: string;
  role: UserRole;
  fullName: string;
}

interface AuthContextType {
  user: User | null;
  login: (username: string, password: string, twoFA?: string) => Promise<boolean>;
  setAuthenticatedUser: (userData: User) => void;
  logout: () => void;
  isAuthenticated: boolean;
  resetSessionTimeout: () => void;
  showSessionWarning: boolean;
  sessionWarningCountdown: number;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Session timeout: 15 minutes of inactivity
const SESSION_TIMEOUT = 15 * 60 * 1000; // 15 minutes in milliseconds
const WARNING_TIME = 2 * 60 * 1000; // Show warning 2 minutes before timeout

function safeLocalStorage() {
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    try {
      const savedUser = safeLocalStorage()?.getItem('currentUser');
      if (savedUser) return JSON.parse(savedUser);
    } catch {
      // ignore
    }
    return null;
  });
  const [sessionTimeout, setSessionTimeout] = useState<NodeJS.Timeout | null>(null);
  const [warningTimeout, setWarningTimeout] = useState<NodeJS.Timeout | null>(null);
  const [showSessionWarning, setShowSessionWarning] = useState(false);
  const [sessionWarningCountdown, setSessionWarningCountdown] = useState(120);
  const countdownRef = React.useRef<NodeJS.Timeout | null>(null);

  const clearTimeouts = () => {
    if (sessionTimeout) clearTimeout(sessionTimeout);
    if (warningTimeout) clearTimeout(warningTimeout);
    if (countdownRef.current) clearInterval(countdownRef.current);
  };

  const resetSessionTimeout = () => {
    if (!user) return;

    clearTimeouts();
    setShowSessionWarning(false);
    setSessionWarningCountdown(120);

    // Set warning timeout — show modal instead of toast
    const warning = setTimeout(() => {
      setShowSessionWarning(true);
      setSessionWarningCountdown(120);
      // Live countdown inside the modal
      countdownRef.current = setInterval(() => {
        setSessionWarningCountdown(prev => {
          if (prev <= 1) {
            if (countdownRef.current) clearInterval(countdownRef.current);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }, SESSION_TIMEOUT - WARNING_TIME);
    setWarningTimeout(warning);

    // Set session timeout
    const timeout = setTimeout(() => {
      logout();
      toast.error('Session expired due to inactivity. Please log in again.');
      window.location.href = '/';
    }, SESSION_TIMEOUT);
    setSessionTimeout(timeout);
  };

  useEffect(() => {
    if (user) {
      resetSessionTimeout();

      // Reset timeout on user activity
      const events = ['mousedown', 'keydown', 'scroll', 'touchstart'];
      const handleActivity = () => resetSessionTimeout();

      events.forEach(event => {
        window.addEventListener(event, handleActivity);
      });

      return () => {
        clearTimeouts();
        events.forEach(event => {
          window.removeEventListener(event, handleActivity);
        });
      };
    }
  }, [user]);

  const login = async (username: string, password: string, twoFA?: string): Promise<boolean> => {
    // Accept user data as a simple object through username parameter if it's a stringified JSON
    try {
      // Try to parse username as JSON (for when we pass full user data)
      const parsedData = typeof username === 'string' && username.startsWith('{') 
        ? JSON.parse(username) 
        : null;
      
      if (parsedData && parsedData.id) {
        // Full user data was passed
        setUser(parsedData);
        safeLocalStorage()?.setItem('currentUser', JSON.stringify(parsedData));
        return true;
      }
    } catch (e) {
      // Not JSON, continue with normal flow
    }
    
    // Normal login - just set basic user data
    // The actual validation happens in LoginPage
    const userData: User = {
      id: username,
      username,
      email: `${username}@hvl.com`,
      role: 'admin' as UserRole,
      fullName: username
    };
    
    setUser(userData);
    safeLocalStorage()?.setItem('currentUser', JSON.stringify(userData));
    return true;
  };

  const setAuthenticatedUser = (userData: User) => {
    setUser(userData);
    safeLocalStorage()?.setItem('currentUser', JSON.stringify(userData));
  };

  const logout = () => {
    clearTimeouts();
    setUser(null);
    safeLocalStorage()?.removeItem('currentUser');
  };

  return (
    <AuthContext.Provider value={{ user, login, setAuthenticatedUser, logout, isAuthenticated: !!user, resetSessionTimeout, showSessionWarning, sessionWarningCountdown }}>
      {children}
    </AuthContext.Provider>
  );
}

const defaultAuthContext: AuthContextType = {
  user: null,
  login: async () => false,
  setAuthenticatedUser: () => {},
  logout: () => {},
  isAuthenticated: false,
  resetSessionTimeout: () => {},
  showSessionWarning: false,
  sessionWarningCountdown: 120,
};

export function useAuth() {
  return useContext(AuthContext) ?? defaultAuthContext;
}