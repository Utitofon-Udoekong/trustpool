"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAbstraxionAccount } from '@burnt-labs/abstraxion';
import { WalletConnect } from '@/components/auth/WalletConnect';
import { AuthModal } from '@/components/auth/AuthModal';
import { Logo } from '@/components/icons/Logo';


export default function HomePage() {
    const router = useRouter();
    const { isConnected } = useAbstraxionAccount();
    const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

    const handleGetStarted = () => {
        if (isConnected) {
            router.push('/groups');
        } else {
            setIsAuthModalOpen(true);
        }
    };

    return (
        <div className="min-h-screen bg-gray-900 text-white">
            {/* Header */}
            <header className="border-b border-gray-800">
                <div className="container mx-auto px-4 py-4">
                    <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                            <Logo className="w-8 h-8" />
                            <h1 className="text-xl font-bold">TrustPool</h1>
                        </div>
                        <WalletConnect />
                    </div>
                </div>
            </header>

            {/* Hero Section */}
            <section className="relative">
                {/* Background gradient */}
                <div className="absolute inset-0 bg-gradient-to-b from-purple-900/20 to-gray-900" />
                
                <div className="container mx-auto px-4 py-32 relative">
                    <div className="max-w-3xl mx-auto text-center">
                        <h2 className="text-5xl font-bold mb-6 bg-gradient-to-r from-purple-400 to-pink-400 text-transparent bg-clip-text">
                            Privacy-First Social Savings
                        </h2>
                        <p className="text-xl mb-8 text-gray-300">
                            Join trusted savings groups with built-in privacy features and secure cross-chain transactions.
                        </p>
                        <button
                            onClick={handleGetStarted}
                            className="inline-block px-8 py-4 bg-purple-500 rounded-lg hover:bg-purple-600 transition-colors text-lg font-medium"
                        >
                            {isConnected ? 'Go to Dashboard' : 'Get Started'}
                        </button>
                    </div>
                </div>
            </section>

            {/* Features Grid */}
            <section className="py-20 bg-gray-800/50">
                <div className="container mx-auto px-4">
                    <h3 className="text-3xl font-bold text-center mb-12">Why Choose TrustPool?</h3>
                    <div className="grid md:grid-cols-3 gap-8">
                        <div className="p-6 rounded-lg bg-gray-800 border border-gray-700 hover:border-purple-500 transition-colors">
                            <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center mb-4">
                                🔒
                            </div>
                            <h4 className="text-lg font-semibold mb-2">Privacy Protected</h4>
                            <p className="text-gray-400">
                                End-to-end encryption ensures your group&apos;s data remains private and secure.
                            </p>
                        </div>
                        <div className="p-6 rounded-lg bg-gray-800 border border-gray-700 hover:border-purple-500 transition-colors">
                            <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center mb-4">
                                💰
                            </div>
                            <h4 className="text-lg font-semibold mb-2">Cross-Chain USDC</h4>
                            <p className="text-gray-400">
                                Seamlessly transfer USDC across different blockchain networks.
                            </p>
                        </div>
                        <div className="p-6 rounded-lg bg-gray-800 border border-gray-700 hover:border-purple-500 transition-colors">
                            <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center mb-4">
                                📊
                            </div>
                            <h4 className="text-lg font-semibold mb-2">Smart Distribution</h4>
                            <p className="text-gray-400">
                                Automated and fair distribution of funds based on your group&apos;s rules.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* How It Works */}
            <section className="py-20">
                <div className="container mx-auto px-4">
                    <h3 className="text-3xl font-bold text-center mb-12">How It Works</h3>
                    <div className="max-w-3xl mx-auto">
                        <div className="space-y-12">
                            <div className="flex gap-6 items-start">
                                <div className="w-12 h-12 rounded-full bg-purple-500 flex items-center justify-center flex-shrink-0 text-xl font-bold">
                                    1
                                </div>
                                <div>
                                    <h4 className="text-xl font-semibold mb-2">Create or Join a Group</h4>
                                    <p className="text-gray-400">
                                        Start your own savings group or join an existing one with trusted members.
                                        Set your contribution schedule and privacy preferences.
                                    </p>
                                </div>
                            </div>
                            <div className="flex gap-6 items-start">
                                <div className="w-12 h-12 rounded-full bg-purple-500 flex items-center justify-center flex-shrink-0 text-xl font-bold">
                                    2
                                </div>
                                <div>
                                    <h4 className="text-xl font-semibold mb-2">Make Contributions</h4>
                                    <p className="text-gray-400">
                                        Contribute USDC according to your group&apos;s schedule using any supported blockchain.
                                        All transactions are secure and private.
                                    </p>
                                </div>
                            </div>
                            <div className="flex gap-6 items-start">
                                <div className="w-12 h-12 rounded-full bg-purple-500 flex items-center justify-center flex-shrink-0 text-xl font-bold">
                                    3
                                </div>
                                <div>
                                    <h4 className="text-xl font-semibold mb-2">Receive Distributions</h4>
                                    <p className="text-gray-400">
                                        Get your share of the pool when it&apos;s your turn, based on your group&apos;s rules.
                                        Track progress and manage your savings easily.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-20 bg-gradient-to-t from-purple-900/20 to-gray-900">
                <div className="container mx-auto px-4 text-center">
                    <h3 className="text-3xl font-bold mb-4">Ready to Start Saving?</h3>
                    <p className="text-gray-300 mb-8 text-lg">
                        Join TrustPool today and experience secure group savings with privacy.
                    </p>
                    <button
                        onClick={handleGetStarted}
                        className="inline-block px-8 py-4 bg-purple-500 rounded-lg hover:bg-purple-600 transition-colors text-lg font-medium"
                    >
                        Create Your First Group
                    </button>
                </div>
            </section>

            {/* Footer */}
            <footer className="border-t border-gray-800">
                <div className="container mx-auto px-4 py-8">
                    <div className="text-center text-sm text-gray-500">
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
