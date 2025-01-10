"use client";

import { useState } from 'react';
import { useZkEmail } from '@/lib/zk/useZkEmail';

interface EmailVerificationProps {
  onVerified: (emailHash: string) => void;
}

export function EmailVerification({ onVerified }: EmailVerificationProps) {
  const [file, setFile] = useState<File | null>(null);
  const { verifyEmail, isVerifying, verificationError } = useZkEmail();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile && selectedFile.name.endsWith('.eml')) {
      setFile(selectedFile);
    } else {
      alert('Please select a valid .eml file');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;

    try {
      const emlContent = await file.text();
      const emailHash = await verifyEmail(emlContent);
      if (emailHash) {
        onVerified(emailHash);
      }
    } catch (error) {
      console.error('Email verification failed:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-2">
          Email Verification
        </label>
        <p className="text-sm text-gray-600 mb-4">
          Please export your email as an .eml file and upload it here for verification.
          Your email content will remain private through zero-knowledge proofs.
        </p>
        <input
          type="file"
          accept=".eml"
          onChange={handleFileChange}
          disabled={isVerifying}
          className="w-full px-3 py-2 border rounded-lg"
        />
      </div>

      {verificationError && (
        <p className="text-red-500 text-sm">{verificationError}</p>
      )}

      <button
        type="submit"
        disabled={isVerifying || !file}
        className="w-full px-4 py-2 bg-foreground text-background rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
      >
        {isVerifying ? 'Verifying...' : 'Verify Email'}
      </button>
    </form>
  );
} 