"use client";

import { createContext, useContext, useState, useEffect } from 'react';
import { useAbstraxionAccount, useAbstraxionSigningClient } from '@burnt-labs/abstraxion';

interface AuthContextType {
  user: any;
  isConnected: boolean;
  verifyEmail: (email: string) => Promise<boolean>;
  connectWallet: () => Promise<void>;
  signMessage: (message: string) => Promise<string>;
}

export const AuthContext = createContext<AuthContextType | null>(null);

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<any>(null);
  const { data: account } = useAbstraxionAccount();
  const { client } = useAbstraxionSigningClient();

  useEffect(() => {
    if (account) {
      setUser(account);
    }
  }, [account]);

  const verifyEmail = async (email: string) => {
    // ZK email verification implementation
    return true;
  };

  const connectWallet = async () => {
    if (!client) {
      throw new Error('Signing client not initialized');
    }
    // Additional connection logic if needed
  };

  const signMessage = async (message: string) => {
    if (!client || !account) {
      throw new Error('Wallet not connected');
    }
    // Implement message signing using the client
    return '';
  };

  return (
    <AuthContext.Provider 
      value={{ 
        user, 
        isConnected: !!account, 
        verifyEmail, 
        connectWallet,
        signMessage 
      }}
    >
      {children}
    </AuthContext.Provider>
  );
} 