"use client";

import { useState, useEffect } from 'react';
import { useGroup } from '@/lib/hooks/useGroup';
import { useXionAccount } from '@/lib/chain/useXionAccount';
import type { GroupTransaction } from '@/types/group';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { RetryableError } from '@/components/ui/RetryableError';
import Link from 'next/link';
import { TransactionDetails } from '@/components/transactions/TransactionDetails';
import { GroupService } from '@/lib/chain/groupService';
import { Pagination } from '@/components/ui/Pagination';
import { Search } from '@/components/ui/Search';
import { useParams } from 'next/navigation';
type FilterType = 'all' | 'contribution' | 'distribution';
type SortField = 'date' | 'amount';
type SortOrder = 'asc' | 'desc';

export default function TransactionsPage() {
    const {id} = useParams()
    const { account, isReady, sendTransaction } = useXionAccount();
    const { group, transactions, isLoading, fetchTransactions } = useGroup(id as string);
    const [error, setError] = useState<string | null>(null);
    const [filter, setFilter] = useState<FilterType>('all');
    const [sortField, setSortField] = useState<SortField>('date');
    const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
    const [filteredTransactions, setFilteredTransactions] = useState<GroupTransaction[]>([]);
    const [selectedTransaction, setSelectedTransaction] = useState<GroupTransaction | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalTransactions, setTotalTransactions] = useState(0);
    const [pageSize, setPageSize] = useState(10);
    const [searchQuery, setSearchQuery] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(searchQuery);
        }, 300);

        return () => clearTimeout(timer);
    }, [searchQuery]);

    useEffect(() => {
        const loadData = async () => {
            try {
                setError(null);
                if (isReady) {
                    const { total } = await fetchTransactions(currentPage, pageSize) ?? {total: 0};
                    setTotalTransactions(total);
                }
            } catch (err) {
                console.error('Failed to load transactions:', err);
                setError('Failed to load transactions');
            }
        };

        loadData();
    }, [isReady, currentPage, pageSize, debouncedSearch, fetchTransactions]);

    useEffect(() => {
        if (!transactions) return;

        let filtered = [...transactions];

        // Apply search
        if (debouncedSearch) {
            const searchLower = debouncedSearch.toLowerCase();
            filtered = filtered.filter(tx => 
                tx.from.toLowerCase().includes(searchLower) ||
                (tx.to && tx.to.toLowerCase().includes(searchLower)) ||
                tx.amount.denom.toLowerCase().includes(searchLower) ||
                tx.type.toLowerCase().includes(searchLower)
            );
        }

        // Apply filter
        if (filter !== 'all') {
            filtered = filtered.filter(tx => tx.type === filter);
        }

        // Apply sort
        filtered.sort((a, b) => {
            if (sortField === 'date') {
                const dateA = new Date(a.timestamp).getTime();
                const dateB = new Date(b.timestamp).getTime();
                return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
            } else {
                const amountA = parseInt(a.amount.amount);
                const amountB = parseInt(b.amount.amount);
                return sortOrder === 'asc' ? amountA - amountB : amountB - amountA;
            }
        });

        setFilteredTransactions(filtered);
    }, [transactions, filter, sortField, sortOrder, debouncedSearch]);

    const handleExport = () => {
        if (!filteredTransactions.length) return;

        const csv = [
            ['Date', 'Type', 'Amount', 'From', 'To', 'Status'].join(','),
            ...filteredTransactions.map(tx => [
                new Date(tx.timestamp).toLocaleDateString(),
                tx.type,
                `${tx.amount.amount} ${tx.amount.denom}`,
                tx.from,
                tx.to || '',
                tx.status
            ].join(','))
        ].join('\n');

        const blob = new Blob([csv], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `transactions-${id}.csv`;
        a.click();
        window.URL.revokeObjectURL(url);
    };

    const handleStatusUpdate = async (status: GroupTransaction['status']) => {
        if (!selectedTransaction || !group) return;

        try {
            const msg = GroupService.updateTransactionStatusMsg(
                group.id,
                selectedTransaction.id,
                status
            );
            await sendTransaction(msg);
            await fetchTransactions(); // Refresh transactions
            setSelectedTransaction(null); // Close modal
        } catch (error) {
            console.error('Failed to update transaction status:', error);
            throw error;
        }
    };

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
    };

    const handlePageSizeChange = (newSize: number) => {
        setPageSize(newSize);
        setCurrentPage(1); // Reset to first page when changing page size
    };

    if (isLoading || !group) {
        return (
            <main className="container mx-auto px-4 py-8">
                <LoadingSpinner />
            </main>
        );
    }

    if (error) {
        return (
            <main className="container mx-auto px-4 py-8">
                <RetryableError 
                    message={error}
                    onRetry={() => fetchTransactions()}
                />
            </main>
        );
    }

    return (
        <main className="container mx-auto px-4 py-8">
            <div className="max-w-4xl mx-auto">
                <div className="flex items-center gap-4 mb-8">
                    <Link 
                        href={`/groups/${id}`}
                        className="text-sm hover:opacity-70"
                    >
                        ← Back to Group
                    </Link>
                    <h1 className="text-2xl font-bold">Transaction History</h1>
                </div>

                <div className="bg-card rounded-lg p-6">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                        <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
                            <Search
                                value={searchQuery}
                                onChange={setSearchQuery}
                                placeholder="Search transactions..."
                                className="w-full md:w-64"
                            />

                            <select
                                value={filter}
                                onChange={(e) => setFilter(e.target.value as FilterType)}
                                className="px-3 py-2 border rounded-lg"
                            >
                                <option value="all">All Transactions</option>
                                <option value="contribution">Contributions</option>
                                <option value="distribution">Distributions</option>
                            </select>

                            <select
                                value={`${sortField}-${sortOrder}`}
                                onChange={(e) => {
                                    const [field, order] = e.target.value.split('-');
                                    setSortField(field as SortField);
                                    setSortOrder(order as SortOrder);
                                }}
                                className="px-3 py-2 border rounded-lg"
                            >
                                <option value="date-desc">Newest First</option>
                                <option value="date-asc">Oldest First</option>
                                <option value="amount-desc">Highest Amount</option>
                                <option value="amount-asc">Lowest Amount</option>
                            </select>
                        </div>

                        <div className="flex items-center gap-4">
                            <select
                                value={pageSize}
                                onChange={(e) => handlePageSizeChange(Number(e.target.value))}
                                className="px-3 py-2 border rounded-lg"
                            >
                                <option value="10">10 per page</option>
                                <option value="25">25 per page</option>
                                <option value="50">50 per page</option>
                                <option value="100">100 per page</option>
                            </select>

                            <button
                                onClick={handleExport}
                                disabled={!filteredTransactions.length}
                                className="px-4 py-2 bg-foreground text-background rounded-lg hover:opacity-90 disabled:opacity-50"
                            >
                                Export CSV
                            </button>
                        </div>
                    </div>

                    <div className="space-y-2">
                        {filteredTransactions.length === 0 ? (
                            <p className="text-center py-8 text-gray-500">
                                No transactions found
                            </p>
                        ) : (
                            filteredTransactions.map((tx) => (
                                <div 
                                    key={tx.id}
                                    className="flex justify-between items-center p-4 border rounded-lg hover:bg-gray-50 cursor-pointer"
                                    onClick={() => setSelectedTransaction(tx)}
                                >
                                    <div>
                                        <p className="font-medium">{tx.type}</p>
                                        <p className="text-sm opacity-70">
                                            {new Date(tx.timestamp).toLocaleDateString()}
                                        </p>
                                        <p className="text-sm">
                                            From: {tx.from}
                                            {tx.to && ` → To: ${tx.to}`}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-medium">
                                            {tx.amount.amount} {tx.amount.denom}
                                        </p>
                                        <p className="text-sm opacity-70">{tx.status}</p>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    {filteredTransactions.length > 0 && (
                        <div className="mt-6">
                            <Pagination
                                currentPage={currentPage}
                                totalPages={Math.ceil(totalTransactions / pageSize)}
                                onPageChange={handlePageChange}
                            />
                        </div>
                    )}
                </div>
            </div>

            {selectedTransaction && (
                <TransactionDetails
                    transaction={selectedTransaction}
                    onClose={() => setSelectedTransaction(null)}
                    onUpdateStatus={handleStatusUpdate}
                    isCreator={account?.bech32Address === group?.creator}
                />
            )}
        </main>
    );
} 