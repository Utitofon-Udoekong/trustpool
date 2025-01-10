"use client";

import { useState } from 'react';
import { zkEmailVerifier } from './zkEmailVerifier';

export function useZkEmail() {
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationError, setVerificationError] = useState<string | null>(null);

  const verifyEmail = async (emlContent: string) => {
    setIsVerifying(true);
    setVerificationError(null);

    try {
      const result = await zkEmailVerifier.verifyEmail(emlContent);
      
      if (!result.success) {
        throw new Error(result.error || 'ZK Email verification failed');
      }

      return result.emailHash;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Verification failed';
      setVerificationError(message);
      throw error;
    } finally {
      setIsVerifying(false);
    }
  };

  return {
    verifyEmail,
    isVerifying,
    verificationError,
  };
} 