import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface AdminAuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  needsInit: boolean;
  sessionToken: string | null;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<boolean>;
  initPassword: (password: string) => Promise<boolean>;
  checkInitStatus: () => Promise<void>;
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined);

const SESSION_KEY = 'admin_session_token';

export const AdminAuthProvider = ({ children }: { children: ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [needsInit, setNeedsInit] = useState(false);
  const [sessionToken, setSessionToken] = useState<string | null>(null);

  const checkInitStatus = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('admin-auth', {
        body: { action: 'check-init' }
      });

      if (error) throw error;
      setNeedsInit(data.needsInit);
    } catch (error) {
      console.error('Failed to check init status:', error);
    }
  };

  // Validate session token server-side
  const validateSession = async (token: string): Promise<boolean> => {
    try {
      const { data, error } = await supabase.functions.invoke('admin-auth', {
        body: { action: 'validate-session', sessionToken: token }
      });

      if (error) {
        console.error('Session validation error:', error);
        return false;
      }

      return data?.valid === true;
    } catch (error) {
      console.error('Session validation failed:', error);
      return false;
    }
  };

  useEffect(() => {
    const checkSession = async () => {
      const token = sessionStorage.getItem(SESSION_KEY);
      
      if (token) {
        // Validate token server-side instead of just trusting it exists
        const isValid = await validateSession(token);
        if (isValid) {
          setSessionToken(token);
          setIsAuthenticated(true);
        } else {
          // Invalid/expired session - clean up
          sessionStorage.removeItem(SESSION_KEY);
          setSessionToken(null);
          setIsAuthenticated(false);
        }
      }
      
      await checkInitStatus();
      setIsLoading(false);
    };

    checkSession();
  }, []);

  const login = async (username: string, password: string): Promise<boolean> => {
    try {
      const { data, error } = await supabase.functions.invoke('admin-auth', {
        body: { action: 'login', username, password }
      });

      if (error) {
        toast.error('Login failed');
        return false;
      }

      if (data.error) {
        toast.error(data.error);
        return false;
      }

      if (data.success && data.sessionToken) {
        sessionStorage.setItem(SESSION_KEY, data.sessionToken);
        setSessionToken(data.sessionToken);
        setIsAuthenticated(true);
        toast.success('Login successful');
        return true;
      }

      return false;
    } catch (error) {
      console.error('Login error:', error);
      toast.error('Login failed');
      return false;
    }
  };

  const logout = async () => {
    const token = sessionStorage.getItem(SESSION_KEY);
    
    // Invalidate session server-side
    if (token) {
      try {
        await supabase.functions.invoke('admin-auth', {
          body: { action: 'logout', sessionToken: token }
        });
      } catch (error) {
        console.error('Logout error:', error);
      }
    }
    
    sessionStorage.removeItem(SESSION_KEY);
    setSessionToken(null);
    setIsAuthenticated(false);
    toast.success('Logged out successfully');
  };

  const changePassword = async (currentPassword: string, newPassword: string): Promise<boolean> => {
    try {
      const token = sessionStorage.getItem(SESSION_KEY);
      
      const { data, error } = await supabase.functions.invoke('admin-auth', {
        body: { 
          action: 'change-password', 
          password: currentPassword, 
          newPassword,
          sessionToken: token 
        }
      });

      if (error) {
        toast.error('Failed to change password');
        return false;
      }

      if (data.error) {
        toast.error(data.error);
        return false;
      }

      if (data.success) {
        toast.success('Password changed successfully');
        return true;
      }

      return false;
    } catch (error) {
      console.error('Change password error:', error);
      toast.error('Failed to change password');
      return false;
    }
  };

  const initPassword = async (password: string): Promise<boolean> => {
    try {
      const { data, error } = await supabase.functions.invoke('admin-auth', {
        body: { action: 'init-password', password }
      });

      if (error) {
        toast.error('Failed to set password');
        return false;
      }

      if (data.error) {
        toast.error(data.error);
        return false;
      }

      if (data.success) {
        setNeedsInit(false);
        toast.success('Password set successfully. You can now login.');
        return true;
      }

      return false;
    } catch (error) {
      console.error('Init password error:', error);
      toast.error('Failed to set password');
      return false;
    }
  };

  return (
    <AdminAuthContext.Provider value={{
      isAuthenticated,
      isLoading,
      needsInit,
      sessionToken,
      login,
      logout,
      changePassword,
      initPassword,
      checkInitStatus
    }}>
      {children}
    </AdminAuthContext.Provider>
  );
};

export const useAdminAuth = () => {
  const context = useContext(AdminAuthContext);
  if (context === undefined) {
    throw new Error('useAdminAuth must be used within an AdminAuthProvider');
  }
  return context;
};
