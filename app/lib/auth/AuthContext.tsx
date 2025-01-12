"use client";

import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAbstraxionAccount, useAbstraxionSigningClient } from '@burnt-labs/abstraxion';
import { authStorage } from './storage';
import { AuthError, AuthErrorCode, AUTH_ERROR_MESSAGES } from './errors';
import { TabSync } from './tabSync';

interface AuthContextType {
    user: any;
    isConnected: boolean;
    isVerified: boolean;
    isAuthenticating: boolean;
    error: AuthError | null;
    verifyEmail: (email: string) => Promise<boolean>;
    connectWallet: () => Promise<void>;
    signMessage: (message: string) => Promise<string>;
    startAuth: () => Promise<void>;
    completeAuth: () => Promise<void>;
    logout: () => void;
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
    const [isVerified, setIsVerified] = useState(false);
    const [isAuthenticating, setIsAuthenticating] = useState(false);
    const { data: account } = useAbstraxionAccount();
    const { client } = useAbstraxionSigningClient();
    const [error, setError] = useState<AuthError | null>(null);
    const [refreshInterval, setRefreshInterval] = useState<NodeJS.Timer>();
    const [isActiveTab, setIsActiveTab] = useState(false);
    const [pendingActions, setPendingActions] = useState<Array<() => Promise<void>>>([]);

    // Load persisted auth on mount
    useEffect(() => {
        const stored = authStorage.load();
        if (stored && account?.bech32Address === stored.address) {
            setIsVerified(stored.verified);
        }
    }, [account?.bech32Address]);

    // Update user when account changes
    useEffect(() => {
        if (account) {
            setUser(account);
            // Save new auth session
            authStorage.save({
                address: account.bech32Address,
                timestamp: Date.now(),
                verified: isVerified,
            });
        } else {
            setUser(null);
            setIsVerified(false);
            authStorage.clear();
        }
    }, [account, isVerified]);

    // Handle tab synchronization and conflicts
    useEffect(() => {
        const unsubscribe = TabSync.subscribe((message) => {
            switch (message.action) {
                case 'CONFLICT_CHECK':
                    // If this is an older tab, defer to the new one
                    if (TabSync.isActiveTab()) {
                        TabSync.broadcast({
                            type: 'AUTH_SYNC',
                            action: 'CONFLICT_RESOLVE',
                            data: { activeTab: TabSync.tabId }
                        });
                    }
                    break;

                case 'CONFLICT_RESOLVE':
                    if (message.data.closing) {
                        // Previous active tab is closing
                        if (!TabSync.isActiveTab()) {
                            // Compete for active status
                            TabSync.broadcast({
                                type: 'AUTH_SYNC',
                                action: 'CONFLICT_CHECK'
                            });
                        }
                    } else {
                        // Update active tab status
                        const newActiveTab = message.data.activeTab;
                        TabSync.setActiveTab(newActiveTab);
                        setIsActiveTab(newActiveTab === TabSync.tabId);
                    }
                    break;

                case 'LOGIN':
                    if (message.data?.address && !user) {
                        // Another tab logged in
                        const stored = authStorage.load();
                        if (stored?.address === message.data.address) {
                            setUser({ bech32Address: message.data.address });
                            setIsVerified(stored.verified);
                        }
                    }
                    break;

                case 'LOGOUT':
                    // Another tab logged out
                    logout();
                    break;

                case 'REFRESH':
                    if (message.data?.address === user?.bech32Address) {
                        // Another tab refreshed the session
                        const stored = authStorage.load();
                        if (stored) {
                            setIsVerified(stored.verified);
                        }
                    }
                    break;

                case 'VERIFY':
                    if (message.data?.address === user?.bech32Address) {
                        // Another tab completed verification
                        setIsVerified(true);
                    }
                    break;
            }
        });

        return () => {
            unsubscribe();
            TabSync.cleanup();
        };
    }, [user]);

    // Handle pending actions when becoming active tab
    useEffect(() => {
        if (isActiveTab && pendingActions.length > 0) {
            const executePendingActions = async () => {
                for (const action of pendingActions) {
                    try {
                        await action();
                    } catch (error) {
                        console.error('Failed to execute pending action:', error);
                    }
                }
                setPendingActions([]);
            };

            executePendingActions();
        }
    }, [isActiveTab, pendingActions]);

    // Update auth methods to handle active tab status
    const queueOrExecute = async (action: () => Promise<void>) => {
        if (isActiveTab) {
            await action();
        } else {
            setPendingActions(prev => [...prev, action]);
        }
    };

    // Handle session refresh
    const refreshSession = useCallback(async () => {
        try {
            const stored = authStorage.load();
            if (!stored || !account) return;

            if (authStorage.needsRefresh(stored)) {
                // Verify the session is still valid
                const isValid = await verifySession();
                if (isValid) {
                    authStorage.refresh(account.bech32Address);
                    TabSync.broadcast({
                        type: 'AUTH_SYNC',
                        action: 'REFRESH',
                        data: { address: account.bech32Address }
                    });
                } else {
                    // Session invalid, force logout
                    logout();
                }
            }
        } catch (err) {
            console.error('Session refresh failed:', err);
            logout();
        }
    }, [account]);

    // Start refresh interval when connected
    useEffect(() => {
        if (isConnected && !refreshInterval) {
            const interval = setInterval(
                refreshSession,
                SESSION_CONFIG.REFRESH_CHECK_INTERVAL
            );
            setRefreshInterval(interval);
        }

        return () => {
            if (refreshInterval) {
                clearInterval(refreshInterval);
                setRefreshInterval(undefined);
            }
        };
    }, [isConnected, refreshInterval, refreshSession]);

    // Add session verification
    const verifySession = async (): Promise<boolean> => {
        if (!account || !client) return false;

        try {
            // Verify the session is still valid with the chain
            // This could be a simple query or message signing
            const timestamp = Date.now().toString();
            await signMessage(timestamp);
            return true;
        } catch (err) {
            console.error('Session verification failed:', err);
            return false;
        }
    };

    const verifyEmail = async (email: string) => {
        try {
            setError(null);
            // ZK email verification implementation
            const success = true; // Replace with actual verification
            if (success) {
                setIsVerified(true);
                authStorage.update({ verified: true });
                return true;
            }
            throw new AuthError(
                'Email verification failed',
                AuthErrorCode.VERIFICATION_FAILED
            );
        } catch (err) {
            const authError = err instanceof AuthError 
                ? err 
                : new AuthError(
                    'Unexpected error during verification',
                    AuthErrorCode.VERIFICATION_FAILED,
                    err
                );
            setError(authError);
            throw authError;
        }
    };

    const connectWallet = async () => {
        try {
            setError(null);
            if (!client) {
                throw new AuthError(
                    AUTH_ERROR_MESSAGES[AuthErrorCode.NOT_INITIALIZED],
                    AuthErrorCode.NOT_INITIALIZED
                );
            }
            // Additional connection logic
        } catch (err) {
            const authError = err instanceof AuthError 
                ? err 
                : new AuthError(
                    'Failed to connect wallet',
                    AuthErrorCode.CONNECTION_FAILED,
                    err
                );
            setError(authError);
            throw authError;
        }
    };

    const signMessage = async (message: string) => {
        if (!client || !account) {
            throw new Error('Wallet not connected');
        }
        // Implement message signing using the client
        return '';
    };

    const startAuth = async () => {
        await queueOrExecute(async () => {
            setIsAuthenticating(true);
            try {
                setError(null);
                await connectWallet();
                if (account) {
                    const timestamp = Date.now().toString();
                    await signMessage(timestamp);
                    authStorage.save({
                        address: account.bech32Address,
                        timestamp: Date.now(),
                        verified: false,
                        lastRefresh: Date.now(),
                    });
                    TabSync.broadcast({
                        type: 'AUTH_SYNC',
                        action: 'LOGIN',
                        data: { address: account.bech32Address }
                    });
                }
            } catch (err) {
                const authError = err instanceof AuthError 
                    ? err 
                    : new AuthError(
                        'Authentication failed',
                        AuthErrorCode.CONNECTION_FAILED,
                        err
                    );
                setError(authError);
                throw authError;
            } finally {
                setIsAuthenticating(false);
            }
        });
    };

    const completeAuth = async () => {
        await queueOrExecute(async () => {
            try {
                setError(null);
                if (!account) {
                    throw new AuthError(
                        'No wallet connected',
                        AuthErrorCode.INVALID_STATE
                    );
                }
                authStorage.update({ verified: true });
                setIsVerified(true);
                TabSync.broadcast({
                    type: 'AUTH_SYNC',
                    action: 'VERIFY',
                    data: { address: account.bech32Address }
                });
            } catch (err) {
                const authError = err instanceof AuthError 
                    ? err 
                    : new AuthError(
                        'Failed to complete authentication',
                        AuthErrorCode.VERIFICATION_FAILED,
                        err
                    );
                setError(authError);
                throw authError;
            }
        });
    };

    const logout = () => {
        if (refreshInterval) {
            clearInterval(refreshInterval);
            setRefreshInterval(undefined);
        }
        authStorage.clear();
        setUser(null);
        setIsVerified(false);
        TabSync.broadcast({
            type: 'AUTH_SYNC',
            action: 'LOGOUT'
        });
    };

    return (
        <AuthContext.Provider 
            value={{ 
                user,
                isConnected: !!account,
                isVerified,
                isAuthenticating,
                error,
                verifyEmail,
                connectWallet,
                signMessage,
                startAuth,
                completeAuth,
                logout
            }}
        >
            {children}
        </AuthContext.Provider>
    );
} 