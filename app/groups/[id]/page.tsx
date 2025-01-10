"use client";

import { useEffect, useState } from 'react';
import { useGroup } from '@/lib/hooks/useGroup';
import { useXionAccount } from '@/lib/chain/useXionAccount';
import type { Coin } from "@cosmjs/stargate";
import { MembersList } from '@/components/groups/MembersList';
import { ContributionSchedule } from '@/components/groups/ContributionSchedule';
import { SavingsGroup, Schedule } from '@/types/group';
import { GroupService } from '@/lib/chain/groupService';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { RetryableError } from '@/components/ui/RetryableError';
import { ErrorMessage } from '@/components/ui/ErrorMessage';
import { GroupSettings } from '@/components/groups/GroupSettings';
import Link from 'next/link';

export default function GroupDetailsPage({ params }: { params: { id: string } }) {
    const { account, isReady, sendTransaction } = useXionAccount();
    const { 
        group, 
        transactions, 
        contribute, 
        isLoading,
        fetchGroup,
        fetchTransactions
    } = useGroup(params.id);

    const [error, setError] = useState<string | null>(null);
    const [transactionError, setTransactionError] = useState<string | null>(null);

    useEffect(() => {
        const loadData = async () => {
            try {
                setError(null);
                if (isReady) {
                    await Promise.all([fetchGroup(), fetchTransactions()]);
                }
            } catch (err) {
                console.error('Failed to load group data:', err);
                setError('Failed to load group data');
            }
        };

        loadData();
    }, [isReady, fetchGroup, fetchTransactions]);

    const handleContribute = async () => {
        if (!group) return;
        setTransactionError(null);

        try {
            const amount: Coin = {
                denom: group.currency,
                amount: group.contributionAmount.toString()
            };

            await contribute(amount);
            await fetchTransactions();
        } catch (error) {
            console.error('Contribution failed:', error);
            setTransactionError('Failed to process contribution');
        }
    };

    const handleInviteMember = async (email: string) => {
        if (!group) return;
        
        try {
            const msg = GroupService.inviteMemberMsg(group.id, email);
            await sendTransaction(msg);
            await fetchGroup(); // Refresh group data
            alert('Member invited successfully');
        } catch (error) {
            console.error('Failed to invite member:', error);
            alert('Failed to invite member. Please try again.');
        }
    };

    const handleRemoveMember = async (address: string) => {
        if (!group) return;
        
        try {
            const msg = GroupService.removeMemberMsg(group.id, address);
            await sendTransaction(msg);
            await fetchGroup(); // Refresh group data
            alert('Member removed successfully');
        } catch (error) {
            console.error('Failed to remove member:', error);
            alert('Failed to remove member. Please try again.');
        }
    };

    const handleUpdateSchedule = async (newSchedule: Schedule) => {
        if (!group) return;
        
        try {
            const msg = GroupService.updateScheduleMsg(group.id, newSchedule);
            await sendTransaction(msg);
            await fetchGroup(); // Refresh group data
            alert('Schedule updated successfully');
        } catch (error) {
            console.error('Failed to update schedule:', error);
            alert('Failed to update schedule. Please try again.');
        }
    };

    const handleUpdateSettings = async (settings: Partial<SavingsGroup>) => {
        if (!group) return;
        
        try {
            const msg = await GroupService.updateGroupSettingsMsg(group.id, {
                status: settings.status,
                distributionRules: settings.distributionRules,
                privacySettings: settings.privacySettings,
            });
            await sendTransaction(msg);
            await fetchGroup(); // Refresh group data
            alert('Settings updated successfully');
        } catch (error) {
            console.error('Failed to update settings:', error);
            throw error; // Let the component handle the error
        }
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
                    onRetry={() => {
                        fetchGroup();
                        fetchTransactions();
                    }}
                />
            </main>
        );
    }

    return (
        <main className="container mx-auto px-4 py-8">
            <div className="max-w-4xl mx-auto">
                <div className="flex justify-between items-start mb-8">
                    <div>
                        <h1 className="text-3xl font-bold">{group.name}</h1>
                        <p className="text-lg opacity-70 mt-2">{group.description}</p>
                    </div>
                    <div className={`px-3 py-1 rounded-full text-sm ${
                        group.status === 'active' ? 'bg-green-100 text-green-800' : 
                        group.status === 'paused' ? 'bg-yellow-100 text-yellow-800' : 
                        'bg-red-100 text-red-800'
                    }`}>
                        {group.status}
                    </div>
                </div>

                <div className="grid md:grid-cols-3 gap-6 mb-8">
                    <div className="p-4 border rounded-lg">
                        <h3 className="text-sm font-medium opacity-70">Contribution</h3>
                        <p className="text-2xl font-semibold mt-1">
                            {group.contributionAmount} {group.currency}
                        </p>
                    </div>
                    <div className="p-4 border rounded-lg">
                        <h3 className="text-sm font-medium opacity-70">Total Pool</h3>
                        <p className="text-2xl font-semibold mt-1">
                            {group.totalPool} {group.currency}
                        </p>
                    </div>
                    <div className="p-4 border rounded-lg">
                        <h3 className="text-sm font-medium opacity-70">Members</h3>
                        <p className="text-2xl font-semibold mt-1">
                            {group.members.length}
                        </p>
                    </div>
                </div>

                <div className="space-y-6">
                    <div>
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-semibold">Recent Transactions</h3>
                            <Link
                                href={`/groups/${group.id}/transactions`}
                                className="text-sm text-blue-500 hover:text-blue-700"
                            >
                                View All →
                            </Link>
                        </div>
                        {transactions.length === 0 ? (
                            <p>No transactions yet</p>
                        ) : (
                            <div className="space-y-2">
                                {transactions.map((tx) => (
                                    <div 
                                        key={tx.id}
                                        className="flex justify-between items-center p-4 border rounded-lg"
                                    >
                                        <div>
                                            <p className="font-medium">{tx.type}</p>
                                            <p className="text-sm opacity-70">
                                                {new Date(tx.timestamp).toLocaleDateString()}
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-medium">
                                                {tx.amount.amount} {tx.amount.denom}
                                            </p>
                                            <p className="text-sm opacity-70">{tx.status}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {group.status === 'active' && (
                        <button
                            onClick={handleContribute}
                            disabled={isLoading}
                            className="w-full px-4 py-2 bg-foreground text-background rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
                        >
                            {isLoading ? 'Processing...' : 'Make Contribution'}
                        </button>
                    )}
                </div>

                <div className="mt-8">
                    <ContributionSchedule
                        schedule={group.schedule}
                        contributionAmount={group.contributionAmount}
                        currency={group.currency}
                        isCreator={account?.bech32Address === group.creator}
                        onUpdateSchedule={handleUpdateSchedule}
                    />
                </div>

                <div className="mt-12">
                    <MembersList
                        members={group.members}
                        isCreator={account?.bech32Address === group.creator}
                        onInviteMember={handleInviteMember}
                        onRemoveMember={handleRemoveMember}
                    />
                </div>

                <div className="mt-8">
                    <GroupSettings
                        group={group}
                        isCreator={account?.bech32Address === group.creator}
                        onUpdateSettings={handleUpdateSettings}
                    />
                </div>

                {transactionError && (
                    <div className="mb-4">
                        <ErrorMessage
                            message={transactionError}
                            onRetry={() => setTransactionError(null)}
                        />
                    </div>
                )}
            </div>
        </main>
    );
} 