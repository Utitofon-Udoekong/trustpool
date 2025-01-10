"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useXionAccount } from '@/lib/chain/useXionAccount';
import { CreateGroupForm } from '@/components/groups/CreateGroupForm';
import Link from 'next/link';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

export default function CreateGroupPage() {
    const router = useRouter();
    const { isReady, account } = useXionAccount();

    useEffect(() => {
        if (isReady && !account) {
            // Redirect if not connected
            router.push('/');
        }
    }, [isReady, account, router]);

    if (!isReady || !account) {
        return (
            <main className="container mx-auto px-4 py-8">
                <LoadingSpinner />
            </main>
        );
    }

    return (
        <main className="container mx-auto px-4 py-8">
            <div className="max-w-4xl mx-auto">
                <div className="flex items-center gap-4 mb-8">
                    <Link 
                        href="/groups"
                        className="text-sm hover:opacity-70"
                    >
                        ← Back to Groups
                    </Link>
                    <h1 className="text-2xl font-bold">Create New Savings Group</h1>
                </div>

                <div className="bg-card rounded-lg p-6">
                    <CreateGroupForm />
                </div>
            </div>
        </main>
    );
} 