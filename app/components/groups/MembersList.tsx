"use client";

import { useState } from 'react';
import type { Member } from '@/types/group';
import { ErrorMessage } from '@/components/ui/ErrorMessage';

interface MembersListProps {
    members: Member[];
    isCreator: boolean;
    onInviteMember: (email: string) => Promise<void>;
    onRemoveMember: (address: string) => Promise<void>;
}

export function MembersList({ 
    members, 
    isCreator,
    onInviteMember,
    onRemoveMember 
}: MembersListProps) {
    const [email, setEmail] = useState('');
    const [isInviting, setIsInviting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleInvite = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsInviting(true);
        setError(null);

        try {
            await onInviteMember(email);
            setEmail('');
        } catch (err) {
            setError('Failed to invite member');
        } finally {
            setIsInviting(false);
        }
    };

    return (
        <div className="space-y-6">
            {error && (
                <ErrorMessage
                    message={error}
                    onRetry={() => setError(null)}
                />
            )}
            <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold">Members ({members.length})</h2>
                {isCreator && (
                    <form onSubmit={handleInvite} className="flex gap-2">
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Enter email to invite"
                            className="px-3 py-2 border rounded-lg"
                            disabled={isInviting}
                        />
                        <button
                            type="submit"
                            disabled={isInviting || !email}
                            className="px-4 py-2 bg-foreground text-background rounded-lg hover:opacity-90 disabled:opacity-50"
                        >
                            {isInviting ? 'Inviting...' : 'Invite'}
                        </button>
                    </form>
                )}
            </div>

            <div className="space-y-2">
                {members.map((member) => (
                    <div 
                        key={member.address}
                        className="flex justify-between items-center p-4 border rounded-lg"
                    >
                        <div>
                            <p className="font-medium">{member.email}</p>
                            <p className="text-sm opacity-70">{member.address}</p>
                            <p className="text-sm">
                                Joined {new Date(member.joinedAt).toLocaleDateString()}
                            </p>
                        </div>
                        <div className="flex items-center gap-4">
                            <span className={`px-2 py-1 rounded-full text-sm ${
                                member.contributionStatus === 'paid' ? 'bg-green-100 text-green-800' :
                                member.contributionStatus === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-red-100 text-red-800'
                            }`}>
                                {member.contributionStatus}
                            </span>
                            {isCreator && (
                                <button
                                    onClick={() => onRemoveMember(member.address)}
                                    className="text-red-500 hover:text-red-700"
                                >
                                    Remove
                                </button>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
} 