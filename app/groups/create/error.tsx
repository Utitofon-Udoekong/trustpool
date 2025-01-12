'use client';

import { RetryableError } from '@/components/ui/RetryableError';
import Link from 'next/link';

export default function CreateGroupError({
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
                        href="/groups"
                        className="text-sm hover:opacity-70"
                    >
                        ← Back to Groups
                    </Link>
                </div>
                <RetryableError 
                    message={error.message || 'Failed to create group'} 
                    onRetry={reset}
                />
            </div>
        </div>
    );
} 