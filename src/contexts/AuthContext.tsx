import { createContext, useContext, useEffect, useState, ReactNode } from 'react';

export interface AlbyWalletInfo {
  alias: string;
  balance: number;
  pubkey: string;
  lightningAddress?: string;
}

interface AuthState {
  isAuthenticated: boolean;
  user: AlbyWalletInfo | null;
  sessionExpiry: number | null;
  lastActivity: number;
}

interface AuthContextType extends AuthState {
  login: (walletInfo: AlbyWalletInfo) => void;
  logout: () => void;
  refreshSession: () => void;
  isSessionValid: () => boolean;
  updateActivity: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Configuration
const SESSION_DURATION = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
const ACTIVITY_TIMEOUT = 2 * 60 * 60 * 1000; // 2 hours of inactivity
const STORAGE_KEY = 'bitsub_auth_session';

interface StoredSession {
  user: AlbyWalletInfo;
  sessionExpiry: number;
  lastActivity: number;
  timestamp: number;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    user: null,
    sessionExpiry: null,
    lastActivity: Date.now(),
  });

  // Load session from localStorage on mount
  useEffect(() => {
    const loadStoredSession = () => {
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (!stored) return;

        const session: StoredSession = JSON.parse(stored);
        const now = Date.now();

        // Check if session is expired
        if (session.sessionExpiry < now) {
          console.log('🔒 AuthContext - Stored session expired, clearing...');
          localStorage.removeItem(STORAGE_KEY);
          return;
        }

        // Check if session is inactive for too long
        if (now - session.lastActivity > ACTIVITY_TIMEOUT) {
          console.log('🔒 AuthContext - Session inactive too long, clearing...');
          localStorage.removeItem(STORAGE_KEY);
          return;
        }

        console.log('✅ AuthContext - Restored session from storage:', session.user.alias);
        setAuthState({
          isAuthenticated: true,
          user: session.user,
          sessionExpiry: session.sessionExpiry,
          lastActivity: session.lastActivity,
        });
      } catch (error) {
        console.error('❌ AuthContext - Failed to load stored session:', error);
        localStorage.removeItem(STORAGE_KEY);
      }
    };

    loadStoredSession();
  }, []);

  // Session validation timer
  useEffect(() => {
    if (!authState.isAuthenticated) return;

    const interval = setInterval(() => {
      if (!isSessionValid()) {
        console.log('🔒 AuthContext - Session expired, logging out...');
        logout();
      }
    }, 60000); // Check every minute

    return () => clearInterval(interval);
  }, [authState.isAuthenticated, authState.sessionExpiry, authState.lastActivity]);

  // Activity tracking
  useEffect(() => {
    if (!authState.isAuthenticated) return;

    const handleActivity = () => {
      updateActivity();
    };

    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
    events.forEach((event) => {
      document.addEventListener(event, handleActivity, true);
    });

    return () => {
      events.forEach((event) => {
        document.removeEventListener(event, handleActivity, true);
      });
    };
  }, [authState.isAuthenticated]);

  const login = (walletInfo: AlbyWalletInfo) => {
    const now = Date.now();
    const sessionExpiry = now + SESSION_DURATION;

    const newAuthState = {
      isAuthenticated: true,
      user: walletInfo,
      sessionExpiry,
      lastActivity: now,
    };

    setAuthState(newAuthState);

    // Store session in localStorage
    const sessionData: StoredSession = {
      user: walletInfo,
      sessionExpiry,
      lastActivity: now,
      timestamp: now,
    };

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(sessionData));
      console.log('✅ AuthContext - Session stored successfully');
    } catch (error) {
      console.error('❌ AuthContext - Failed to store session:', error);
    }

    console.log('✅ AuthContext - User logged in:', walletInfo.alias);
  };

  const logout = async () => {
    console.log('🔄 AuthContext - Logging out...');

    // Clear stored session
    localStorage.removeItem(STORAGE_KEY);

    // Reset auth state
    setAuthState({
      isAuthenticated: false,
      user: null,
      sessionExpiry: null,
      lastActivity: Date.now(),
    });

    console.log('✅ AuthContext - User logged out');
  };

  const refreshSession = () => {
    if (!authState.isAuthenticated || !authState.user) return;

    const now = Date.now();
    const sessionExpiry = now + SESSION_DURATION;

    const updatedState = {
      ...authState,
      sessionExpiry,
      lastActivity: now,
    };

    setAuthState(updatedState);

    // Update stored session
    const sessionData: StoredSession = {
      user: authState.user,
      sessionExpiry,
      lastActivity: now,
      timestamp: now,
    };

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(sessionData));
      console.log('✅ AuthContext - Session refreshed');
    } catch (error) {
      console.error('❌ AuthContext - Failed to refresh session:', error);
    }
  };

  const updateActivity = () => {
    if (!authState.isAuthenticated) return;

    const now = Date.now();

    // Only update if more than 1 minute has passed since last activity
    if (now - authState.lastActivity < 60000) return;

    const updatedState = {
      ...authState,
      lastActivity: now,
    };

    setAuthState(updatedState);

    // Update stored session
    if (authState.user && authState.sessionExpiry) {
      const sessionData: StoredSession = {
        user: authState.user,
        sessionExpiry: authState.sessionExpiry,
        lastActivity: now,
        timestamp: now,
      };

      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(sessionData));
      } catch (error) {
        console.error('❌ AuthContext - Failed to update activity:', error);
      }
    }
  };

  const isSessionValid = (): boolean => {
    if (!authState.isAuthenticated || !authState.sessionExpiry) {
      return false;
    }

    const now = Date.now();

    // Check session expiry
    if (authState.sessionExpiry < now) {
      console.log('🔒 AuthContext - Session expired');
      return false;
    }

    // Check activity timeout
    if (now - authState.lastActivity > ACTIVITY_TIMEOUT) {
      console.log('🔒 AuthContext - Session inactive too long');
      return false;
    }

    return true;
  };

  const contextValue: AuthContextType = {
    ...authState,
    login,
    logout,
    refreshSession,
    isSessionValid,
    updateActivity,
  };

  return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// Hook for protected routes
export function useRequireAuth() {
  const auth = useAuth();

  useEffect(() => {
    if (!auth.isAuthenticated || !auth.isSessionValid()) {
      console.log('🔒 useRequireAuth - Authentication required, redirecting...');
      // This will be handled by the ProtectedRoute component
    }
  }, [auth.isAuthenticated, auth.isSessionValid]);

  return auth;
}
