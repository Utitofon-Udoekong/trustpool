"use client";

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { WalletConnect } from '@/components/auth/WalletConnect';

export default function GroupsLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();

    const isActive = (path: string) => {
        return pathname.startsWith(path);
    };

    return (
        <div className="min-h-screen">
            <header className="border-b">
                <div className="container mx-auto px-4 py-4">
                    <div className="flex justify-between items-center">
                        <nav className="flex items-center gap-8">
                            <Link 
                                href="/"
                                className="text-xl font-bold"
                            >
                                TrustPool
                            </Link>
                            <Link 
                                href="/groups"
                                className={`hover:opacity-70 ${
                                    isActive('/groups') ? 'font-medium' : ''
                                }`}
                            >
                                My Groups
                            </Link>
                        </nav>
                        <WalletConnect />
                    </div>
                </div>
            </header>
            <main>{children}</main>
        </div>
    );
} 