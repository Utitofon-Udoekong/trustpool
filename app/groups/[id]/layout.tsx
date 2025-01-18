"use client";

import { usePathname, useParams } from 'next/navigation';
import Link from 'next/link';
import { useGroup } from '@/lib/hooks/useGroup';

export default function GroupDetailsLayout({
    children,
}: {
    children: React.ReactNode,
}) {
    const pathname = usePathname();
    const {id} = useParams()
    const { group } = useGroup(id as string);

    const isActive = (path: string) => pathname === path;

    if (!group) return children;

    return (
        <div>
            <div className="border-b">
                <div className="container mx-auto px-4 py-4">
                    <div className="max-w-4xl mx-auto">
                        <h1 className="text-2xl font-bold mb-4">{group.name}</h1>
                        <nav className="flex gap-4">
                            <Link 
                                href={`/groups/${id}`}
                                className={`px-3 py-2 rounded-lg ${
                                    isActive(`/groups/${id}`)
                                        ? 'bg-foreground text-background'
                                        : 'hover:bg-gray-100'
                                }`}
                            >
                                Overview
                            </Link>
                            <Link 
                                href={`/groups/${id}/transactions`}
                                className={`px-3 py-2 rounded-lg ${
                                    isActive(`/groups/${id}/transactions`)
                                        ? 'bg-foreground text-background'
                                        : 'hover:bg-gray-100'
                                }`}
                            >
                                Transactions
                            </Link>
                        </nav>
                    </div>
                </div>
            </div>
            {children}
        </div>
    );
} 