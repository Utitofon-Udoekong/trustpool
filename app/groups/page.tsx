"use client";

import { useEffect, useState } from 'react';
import { useXionAccount } from '@/lib/chain/useXionAccount';
import { GroupService } from '@/lib/chain/groupService';
import type { SavingsGroup } from '@/types/group';
import Link from 'next/link';

export default function GroupsPage() {
    const { account, client, isReady } = useXionAccount();
    const [groups, setGroups] = useState<SavingsGroup[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (isReady && account) {
            GroupService.queryUserGroups(client, account.bech32Address)
                .then(setGroups)
                .finally(() => setIsLoading(false));
        }
    }, [isReady, account, client]);

    return (
        <main className="container mx-auto px-4 py-8">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-2xl font-bold">My Savings Groups</h1>
                <Link 
                    href="/groups/create"
                    className="px-4 py-2 bg-foreground text-background rounded-lg"
                >
                    Create New Group
                </Link>
            </div>

            {isLoading ? (
                <p>Loading groups...</p>
            ) : groups.length === 0 ? (
                <p>No groups found. Create one to get started!</p>
            ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {groups.map((group) => (
                        <Link 
                            key={group.id} 
                            href={`/groups/${group.id}`}
                            className="p-4 border rounded-lg hover:border-foreground transition-colors"
                        >
                            <h2 className="text-lg font-semibold">{group.name}</h2>
                            <p className="text-sm opacity-70">{group.description}</p>
                            <div className="mt-4 flex justify-between items-center">
                                <span className="text-sm">
                                    {group.contributionAmount} {group.currency}
                                </span>
                                <span className={`text-sm ${
                                    group.status === 'active' ? 'text-green-500' : 
                                    group.status === 'paused' ? 'text-yellow-500' : 
                                    'text-red-500'
                                }`}>
                                    {group.status}
                                </span>
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </main>
    );
} 