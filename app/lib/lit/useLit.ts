"use client";

import { useState, useEffect } from 'react';
import { litService } from './litClient';

export function useLit() {
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const initLit = async () => {
      try {
        // Disconnect first to clear any stale sessions
        await litService.disconnect();
        // Then reconnect
        await litService.connect();
        setIsInitialized(true);
      } catch (error) {
        console.error('Error initializing Lit Protocol:', error);
      }
    };

    initLit();

    // Cleanup on unmount
    return () => {
      litService.disconnect().catch(console.error);
    };
  }, []);

  const encryptGroupData = async (data: any, groupId: string) => {
    if (!isInitialized) {
      throw new Error('Lit Protocol not initialized');
    }
    return litService.encryptData(data, groupId);
  };

  const decryptGroupData = async (encryptedData: any, groupId: string) => {
    if (!isInitialized) {
      throw new Error('Lit Protocol not initialized');
    }
    return litService.decryptData(encryptedData, groupId);
  };

  return {
    isInitialized,
    encryptGroupData,
    decryptGroupData,
  };
} 