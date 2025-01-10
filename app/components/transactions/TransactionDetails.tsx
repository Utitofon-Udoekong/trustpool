"use client";

import { useEffect, useState } from 'react';
import type { GroupTransaction } from '@/types/group';

interface TransactionDetailsProps {
    transaction: GroupTransaction;
    onClose: () => void;
    onUpdateStatus?: (status: GroupTransaction['status']) => Promise<void>;
    isCreator?: boolean;
}

export function TransactionDetails({ 
    transaction, 
    onClose,
    onUpdateStatus,
    isCreator 
}: TransactionDetailsProps) {
    const [isUpdating, setIsUpdating] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleStatusUpdate = async (newStatus: GroupTransaction['status']) => {
        if (!onUpdateStatus) return;
        setIsUpdating(true);
        setError(null);

        try {
            await onUpdateStatus(newStatus);
        } catch (err) {
            setError('Failed to update transaction status');
        } finally {
            setIsUpdating(false);
        }
    };

    // Close on escape key
    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', handleEscape);
        return () => window.removeEventListener('keydown', handleEscape);
    }, [onClose]);

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div 
                className="bg-white rounded-lg p-6 max-w-lg w-full mx-4 relative"
                onClick={e => e.stopPropagation()}
            >
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
                >
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>

                <h2 className="text-xl font-semibold mb-4">Transaction Details</h2>

                <div className="space-y-4">
                    <div>
                        <h3 className="text-sm font-medium text-gray-500">Type</h3>
                        <p className="mt-1">{transaction.type}</p>
                    </div>

                    <div>
                        <h3 className="text-sm font-medium text-gray-500">Amount</h3>
                        <p className="mt-1">
                            {transaction.amount.amount} {transaction.amount.denom}
                        </p>
                    </div>

                    <div>
                        <h3 className="text-sm font-medium text-gray-500">Status</h3>
                        {isCreator && onUpdateStatus ? (
                            <div className="mt-1">
                                <select
                                    value={transaction.status}
                                    onChange={(e) => handleStatusUpdate(e.target.value as GroupTransaction['status'])}
                                    disabled={isUpdating}
                                    className="w-full px-3 py-2 border rounded-lg"
                                >
                                    <option value="pending">Pending</option>
                                    <option value="completed">Completed</option>
                                    <option value="failed">Failed</option>
                                </select>
                                {error && (
                                    <p className="text-sm text-red-600 mt-1">{error}</p>
                                )}
                            </div>
                        ) : (
                            <p className={`mt-1 ${
                                transaction.status === 'completed' ? 'text-green-600' :
                                transaction.status === 'pending' ? 'text-yellow-600' :
                                'text-red-600'
                            }`}>
                                {transaction.status}
                            </p>
                        )}
                    </div>

                    <div>
                        <h3 className="text-sm font-medium text-gray-500">Date</h3>
                        <p className="mt-1">
                            {new Date(transaction.timestamp).toLocaleString()}
                        </p>
                    </div>

                    <div>
                        <h3 className="text-sm font-medium text-gray-500">From</h3>
                        <p className="mt-1 break-all">{transaction.from}</p>
                    </div>

                    {transaction.to && (
                        <div>
                            <h3 className="text-sm font-medium text-gray-500">To</h3>
                            <p className="mt-1 break-all">{transaction.to}</p>
                        </div>
                    )}

                    <div className="pt-4 border-t">
                        <button
                            onClick={() => {
                                // Copy transaction ID to clipboard
                                navigator.clipboard.writeText(transaction.id);
                                alert('Transaction ID copied to clipboard');
                            }}
                            className="text-sm text-blue-500 hover:text-blue-700"
                        >
                            Copy Transaction ID
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
} 