"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth/AuthContext';
import { Abstraxion } from "@burnt-labs/abstraxion";
import { AuthError } from '@/lib/auth/errors';
import { TabSync } from '@/lib/auth/tabSync';

interface AuthModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function AuthModal({ isOpen, onClose }: AuthModalProps) {
    const { 
        isConnected, 
        isVerified, 
        completeAuth,
        error 
    } = useAuth();
    const [step, setStep] = useState<'connect' | 'verify'>('connect');
    const [localError, setLocalError] = useState<string | null>(null);

    // Reset error when step changes
    useEffect(() => {
        setLocalError(null);
    }, [step]);

    // Handle auth error
    useEffect(() => {
        if (error) {
            setLocalError(error.message);
        }
    }, [error]);

    // Reset step when modal opens
    useEffect(() => {
        if (isOpen) {
            setStep(isConnected && !isVerified ? 'verify' : 'connect');
        }
    }, [isOpen, isConnected, isVerified]);

    // Handle session expiration
    useEffect(() => {
        const handleStorageChange = (e: StorageEvent) => {
            if (e.key === 'trustpool_auth' && !e.newValue) {
                // Session was cleared in another tab
                setLocalError('Session expired. Please reconnect.');
                setStep('connect');
            }
        };

        window.addEventListener('storage', handleStorageChange);
        return () => window.removeEventListener('storage', handleStorageChange);
    }, []);

    // Handle auth sync events
    useEffect(() => {
        const unsubscribe = TabSync.subscribe((message) => {
            switch (message.action) {
                case 'LOGIN':
                    if (step === 'connect') {
                        setStep('verify');
                    }
                    break;
                case 'LOGOUT':
                    setStep('connect');
                    setLocalError('Session ended in another tab');
                    break;
                case 'VERIFY':
                    onClose();
                    break;
            }
        });

        return unsubscribe;
    }, [step, onClose]);

    if (!isOpen) return null;

    const handleComplete = async () => {
        try {
            setLocalError(null);
            await completeAuth();
            onClose();
        } catch (err) {
            if (err instanceof AuthError) {
                setLocalError(err.message);
            } else {
                setLocalError('An unexpected error occurred');
            }
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
                <div className="text-center mb-6">
                    <h2 className="text-2xl font-bold mb-2">Welcome to TrustPool</h2>
                    <p className="text-gray-600">
                        {step === 'connect' 
                            ? 'Connect your wallet to get started'
                            : 'Verify your account to continue'
                        }
                    </p>
                </div>

                {localError && (
                    <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                        {localError}
                    </div>
                )}

                {step === 'connect' ? (
                    <div>
                        <Abstraxion
                            onClose={() => {
                                if (isConnected) {
                                    setStep('verify');
                                } else {
                                    onClose();
                                }
                            }}
                        />
                    </div>
                ) : (
                    <div className="space-y-4">
                        <button
                            onClick={handleComplete}
                            className="w-full px-4 py-2 bg-foreground text-background rounded-lg hover:opacity-90"
                        >
                            Continue to App
                        </button>
                        <button
                            onClick={onClose}
                            className="w-full px-4 py-2 border rounded-lg hover:bg-gray-50"
                        >
                            Skip Verification
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
} 