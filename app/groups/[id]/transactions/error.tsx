'use client';

import { RetryableError } from '@/components/ui/RetryableError';
import Link from 'next/link';

export default function TransactionsError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    return (
        <div className="container mx-auto px-4 py-8">
            <div className="max-w-4xl mx-auto">
                <div className="flex items-center gap-4 mb-8">
                    <Link 
                        href={`/groups/${error.digest}`}
                        className="text-sm hover:opacity-70"
                    >
                        ← Back to Group
                    </Link>
                </div>
                <RetryableError 
                    message={error.message || 'Failed to load transactions'} 
                    onRetry={reset}
                />
            </div>
        </div>
    );
} 