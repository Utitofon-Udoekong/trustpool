"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { WalletConnect } from '@/components/auth/WalletConnect';
import { AuthModal } from '@/components/auth/AuthModal';
import { useAuth } from '@/lib/auth/AuthContext';

export default function HomePage() {
    const router = useRouter();
    const { isConnected } = useAuth();
    const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

    const handleGetStarted = () => {
        if (isConnected) {
            router.push('/groups');
        } else {
            setIsAuthModalOpen(true);
        }
    };

    return (
        <div className="min-h-screen">
            {/* Header */}
            <header className="border-b">
                <div className="container mx-auto px-4 py-4">
                    <div className="flex justify-between items-center">
                        <h1 className="text-xl font-bold">TrustPool</h1>
                        <WalletConnect />
                    </div>
                </div>
            </header>

            {/* Hero Section */}
            <section className="bg-gradient-to-b from-background to-gray-50">
                <div className="container mx-auto px-4 py-20">
                    <div className="max-w-3xl mx-auto text-center">
                        <h2 className="text-4xl font-bold mb-6">
                            Privacy-First Social Savings
                        </h2>
                        <p className="text-xl mb-8 text-gray-600">
                            Join trusted savings groups with built-in privacy features and secure cross-chain transactions.
                        </p>
                        <button
                            onClick={handleGetStarted}
                            className="inline-block px-6 py-3 bg-foreground text-background rounded-lg hover:opacity-90"
                        >
                            {isConnected ? 'Go to Dashboard' : 'Get Started'}
                        </button>
                    </div>
                </div>
            </section>

            {/* Features Grid */}
            <section className="py-20">
                <div className="container mx-auto px-4">
                    <h3 className="text-2xl font-bold text-center mb-12">Why Choose TrustPool?</h3>
                    <div className="grid md:grid-cols-3 gap-8">
                        <div className="p-6 border rounded-lg">
                            <div className="w-12 h-12 bg-foreground text-background rounded-full flex items-center justify-center mb-4">
                                🔒
                            </div>
                            <h4 className="text-lg font-semibold mb-2">Privacy Protected</h4>
                            <p className="text-gray-600">
                                End-to-end encryption ensures your group&apos;s data remains private and secure.
                            </p>
                        </div>
                        <div className="p-6 border rounded-lg">
                            <div className="w-12 h-12 bg-foreground text-background rounded-full flex items-center justify-center mb-4">
                                💰
                            </div>
                            <h4 className="text-lg font-semibold mb-2">Cross-Chain USDC</h4>
                            <p className="text-gray-600">
                                Seamlessly transfer USDC across different blockchain networks.
                            </p>
                        </div>
                        <div className="p-6 border rounded-lg">
                            <div className="w-12 h-12 bg-foreground text-background rounded-full flex items-center justify-center mb-4">
                                📊
                            </div>
                            <h4 className="text-lg font-semibold mb-2">Smart Distribution</h4>
                            <p className="text-gray-600">
                                Automated and fair distribution of funds among group members.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* How It Works */}
            <section className="bg-gray-50 py-20">
                <div className="container mx-auto px-4">
                    <h3 className="text-2xl font-bold text-center mb-12">How It Works</h3>
                    <div className="max-w-3xl mx-auto">
                        <div className="space-y-8">
                            <div className="flex gap-4">
                                <div className="w-8 h-8 rounded-full bg-foreground text-background flex items-center justify-center flex-shrink-0">
                                    1
                                </div>
                                <div>
                                    <h4 className="text-lg font-semibold mb-2">Create or Join a Group</h4>
                                    <p className="text-gray-600">
                                        Start your own savings group or join an existing one with trusted members.
                                    </p>
                                </div>
                            </div>
                            <div className="flex gap-4">
                                <div className="w-8 h-8 rounded-full bg-foreground text-background flex items-center justify-center flex-shrink-0">
                                    2
                                </div>
                                <div>
                                    <h4 className="text-lg font-semibold mb-2">Make Contributions</h4>
                                    <p className="text-gray-600">
                                        Contribute USDC according to your group&apos;s schedule using any supported blockchain.
                                    </p>
                                </div>
                            </div>
                            <div className="flex gap-4">
                                <div className="w-8 h-8 rounded-full bg-foreground text-background flex items-center justify-center flex-shrink-0">
                                    3
                                </div>
                                <div>
                                    <h4 className="text-lg font-semibold mb-2">Receive Distributions</h4>
                                    <p className="text-gray-600">
                                        Get your share of the pool when it&apos;s your turn, based on your group&apos;s rules.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-20">
                <div className="container mx-auto px-4 text-center">
                    <h3 className="text-2xl font-bold mb-4">Ready to Start Saving?</h3>
                    <p className="text-gray-600 mb-8">
                        Join TrustPool today and experience secure group savings with privacy.
                    </p>
                    <Link
                        href="/groups"
                        className="inline-block px-6 py-3 bg-foreground text-background rounded-lg hover:opacity-90"
                    >
                        Create Your First Group
                    </Link>
                </div>
            </section>

            {/* Footer */}
            <footer className="border-t">
                <div className="container mx-auto px-4 py-8">
                    <div className="text-center text-sm text-gray-600">
                        © {new Date().getFullYear()} TrustPool. All rights reserved.
                    </div>
                </div>
            </footer>

            {/* Auth Modal */}
            <AuthModal 
                isOpen={isAuthModalOpen}
                onClose={() => {
                    setIsAuthModalOpen(false);
                    if (isConnected) {
                        router.push('/groups');
                    }
                }}
            />
        </div>
    );
}
