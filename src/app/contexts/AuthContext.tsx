import React, { createContext, useCallback, useContext, useState, ReactNode, useEffect, useRef } from 'react';
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
  const [showSessionWarning, setShowSessionWarning] = useState(false);
  const [sessionWarningCountdown, setSessionWarningCountdown] = useState(120);
  const sessionTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const warningTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const sessionDeadlineRef = useRef(0);
  const lastActivityResetRef = useRef(0);

  const clearTimeouts = useCallback(() => {
    if (sessionTimeoutRef.current) clearTimeout(sessionTimeoutRef.current);
    if (warningTimeoutRef.current) clearTimeout(warningTimeoutRef.current);
    if (countdownRef.current) clearInterval(countdownRef.current);
    sessionTimeoutRef.current = null;
    warningTimeoutRef.current = null;
    countdownRef.current = null;
  }, []);

  const resetSessionTimeout = useCallback(() => {
    if (!user) return;

    clearTimeouts();
    setShowSessionWarning(false);
    setSessionWarningCountdown(WARNING_TIME / 1000);
    sessionDeadlineRef.current = Date.now() + SESSION_TIMEOUT;

    // Set warning timeout — show modal instead of toast
    warningTimeoutRef.current = setTimeout(() => {
      setShowSessionWarning(true);
      const updateCountdown = () => {
        const remaining = Math.max(
          0,
          Math.ceil((sessionDeadlineRef.current - Date.now()) / 1000)
        );
        setSessionWarningCountdown(remaining);
        if (remaining === 0 && countdownRef.current) {
          clearInterval(countdownRef.current);
          countdownRef.current = null;
        }
      };
      updateCountdown();
      countdownRef.current = setInterval(() => {
        updateCountdown();
      }, 1000);
    }, SESSION_TIMEOUT - WARNING_TIME);

    // Set session timeout
    sessionTimeoutRef.current = setTimeout(() => {
      clearTimeouts();
      setShowSessionWarning(false);
      setUser(null);
      safeLocalStorage()?.removeItem('currentUser');
      toast.error('Session expired due to inactivity. Please log in again.');
      window.location.href = '/';
    }, SESSION_TIMEOUT);
  }, [clearTimeouts, user]);

  useEffect(() => {
    if (user) {
      resetSessionTimeout();

      // Keep one timer set alive. Throttling high-frequency pointer/scroll
      // events prevents unnecessary timer churn while still tracking activity.
      const events = ['pointerdown', 'pointermove', 'keydown', 'scroll', 'touchstart', 'input'];
      const handleActivity = () => {
        const now = Date.now();
        if (now - lastActivityResetRef.current < 1000) return;
        lastActivityResetRef.current = now;
        resetSessionTimeout();
      };

      events.forEach(event => {
        window.addEventListener(event, handleActivity, { passive: true });
      });

      return () => {
        clearTimeouts();
        events.forEach(event => {
          window.removeEventListener(event, handleActivity);
        });
      };
    }
    clearTimeouts();
  }, [clearTimeouts, resetSessionTimeout, user]);

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
    setShowSessionWarning(false);
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
