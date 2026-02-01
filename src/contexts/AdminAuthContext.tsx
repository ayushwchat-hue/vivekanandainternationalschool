import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface AdminAuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  needsInit: boolean;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
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

  useEffect(() => {
    const checkSession = async () => {
      const token = sessionStorage.getItem(SESSION_KEY);
      if (token) {
        setIsAuthenticated(true);
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

  const logout = () => {
    sessionStorage.removeItem(SESSION_KEY);
    setIsAuthenticated(false);
    toast.success('Logged out successfully');
  };

  const changePassword = async (currentPassword: string, newPassword: string): Promise<boolean> => {
    try {
      const sessionToken = sessionStorage.getItem(SESSION_KEY);
      
      const { data, error } = await supabase.functions.invoke('admin-auth', {
        body: { 
          action: 'change-password', 
          password: currentPassword, 
          newPassword,
          sessionToken 
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