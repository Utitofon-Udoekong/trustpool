"use client";

import { useState } from 'react';
import { useZkEmail } from '@/lib/zk/useZkEmail';

interface EmailVerificationProps {
  onVerified: (emailHash: string) => void;
}

export function EmailVerification({ onVerified }: EmailVerificationProps) {
  const [email, setEmail] = useState('');
  const { verifyEmail, isVerifying, verificationError } = useZkEmail();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const emailHash = await verifyEmail(email);
      onVerified(emailHash);
    } catch (error) {
      console.error('Email verification failed:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-2">
          Email Address
        </label>
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full px-3 py-2 border rounded-lg"
          placeholder="Enter your email"
          disabled={isVerifying}
        />
      </div>

      {verificationError && (
        <p className="text-red-500 text-sm">{verificationError}</p>
      )}

      <button
        type="submit"
        disabled={isVerifying || !email}
        className="w-full px-4 py-2 bg-foreground text-background rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
      >
        {isVerifying ? 'Verifying...' : 'Verify Email'}
      </button>
    </form>
  );
} 