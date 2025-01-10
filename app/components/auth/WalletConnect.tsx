"use client";

import { useState } from 'react';
import { Abstraxion } from "@burnt-labs/abstraxion";
import { useAuth } from '@/lib/auth/AuthContext';

export function WalletConnect() {
  const [isOpen, setIsOpen] = useState(false);
  const { isConnected, user } = useAuth();

  return (
    <div>
      <Abstraxion onClose={() => setIsOpen(false)} />
      
      {!isConnected ? (
        <button 
          onClick={() => setIsOpen(true)}
          className="px-4 py-2 bg-foreground text-background rounded-lg hover:opacity-90 transition-opacity"
        >
          Connect Wallet
        </button>
      ) : (
        <div className="flex items-center gap-2">
          <span className="text-sm opacity-75">Connected:</span>
          <code className="text-sm bg-background/10 px-2 py-1 rounded">
            {user?.address?.slice(0, 6)}...{user?.address?.slice(-4)}
          </code>
        </div>
      )}
    </div>
  );
} 