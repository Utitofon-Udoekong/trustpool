"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useGroup } from '@/lib/hooks/useGroup';
import { useLit } from '@/lib/lit/useLit';
import type { Schedule } from '@/types/group';
import { validateGroup } from '@/lib/validation/groupValidation';
import { ErrorMessage } from '@/components/ui/ErrorMessage';

interface FormData {
    name: string;
    description: string;
    contributionAmount: string;
    currency: string;
    frequency: 'weekly' | 'monthly';
    startDate: string;
    duration: string;
}

export function CreateGroupForm() {
    const router = useRouter();
    const { createGroup, isLoading, isReady } = useGroup();
    const { encryptGroupData, isInitialized } = useLit();
    const [formData, setFormData] = useState<FormData>({
        name: '',
        description: '',
        contributionAmount: '',
        currency: 'USDC',
        frequency: 'monthly',
        startDate: '',
        duration: '6',
    });
    const [errors, setErrors] = useState<{ field: string; message: string }[]>([]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrors([]);
        
        if (!isReady || !isInitialized) {
            alert('Please connect your wallet and wait for initialization');
            return;
        }

        try {
            // Calculate end date based on duration
            const startDate = new Date(formData.startDate);
            const endDate = new Date(startDate);
            endDate.setMonth(endDate.getMonth() + parseInt(formData.duration));

            // Create schedule object
            const schedule: Schedule = {
                frequency: formData.frequency,
                startDate,
                endDate,
            };

            // Validate form data
            const validationErrors = validateGroup({
                name: formData.name,
                description: formData.description,
                contributionAmount: formData.contributionAmount,
                currency: formData.currency,
                schedule,
            });

            if (validationErrors.length > 0) {
                setErrors(validationErrors);
                return;
            }

            // Create group data
            const groupId = crypto.randomUUID();
            const groupData = {
                id: groupId,
                name: formData.name,
                description: formData.description,
                contributionAmount: {
                    amount: (parseFloat(formData.contributionAmount) * 1_000_000).toString(), // Convert to micro units
                    denom: formData.currency,
                },
                schedule,
            };

            // Encrypt sensitive data
            const encryptedData = await encryptGroupData(groupData, groupData.id);

            // Create group on chain
            const result = await createGroup({
                name: formData.name,
                description: formData.description,
                contributionAmount: groupData.contributionAmount,
                encryptedData: JSON.stringify(encryptedData),
            });

            if (result) {
                router.push('/groups');
            }
        } catch (error) {
            console.error('Failed to create group:', error);
            setErrors([{ field: 'submit', message: 'Failed to create group. Please try again.' }]);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl mx-auto">
            {errors.length > 0 && (
                <ErrorMessage
                    title="Validation Error"
                    message={errors.map(e => e.message).join('. ')}
                />
            )}
            <div>
                <label className="block text-sm font-medium mb-2">
                    Group Name
                </label>
                <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-3 py-2 border rounded-lg"
                    placeholder="Enter group name"
                />
            </div>

            <div>
                <label className="block text-sm font-medium mb-2">
                    Description
                </label>
                <textarea
                    required
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    className="w-full px-3 py-2 border rounded-lg"
                    rows={3}
                    placeholder="Describe your savings group"
                />
            </div>

            <div className="grid md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium mb-2">
                        Contribution Amount
                    </label>
                    <input
                        type="number"
                        required
                        min="0"
                        step="0.000001"
                        value={formData.contributionAmount}
                        onChange={(e) => setFormData(prev => ({ ...prev, contributionAmount: e.target.value }))}
                        className="w-full px-3 py-2 border rounded-lg"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium mb-2">
                        Currency
                    </label>
                    <select
                        value={formData.currency}
                        onChange={(e) => setFormData(prev => ({ ...prev, currency: e.target.value }))}
                        className="w-full px-3 py-2 border rounded-lg"
                    >
                        <option value="USDC">USDC</option>
                        <option value="USDT">USDT</option>
                    </select>
                </div>
            </div>

            <div className="grid md:grid-cols-3 gap-4">
                <div>
                    <label className="block text-sm font-medium mb-2">
                        Frequency
                    </label>
                    <select
                        value={formData.frequency}
                        onChange={(e) => setFormData(prev => ({ 
                            ...prev, 
                            frequency: e.target.value as 'weekly' | 'monthly' 
                        }))}
                        className="w-full px-3 py-2 border rounded-lg"
                    >
                        <option value="weekly">Weekly</option>
                        <option value="monthly">Monthly</option>
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium mb-2">
                        Start Date
                    </label>
                    <input
                        type="date"
                        required
                        value={formData.startDate}
                        onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
                        className="w-full px-3 py-2 border rounded-lg"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium mb-2">
                        Duration (months)
                    </label>
                    <input
                        type="number"
                        required
                        min="3"
                        max="24"
                        value={formData.duration}
                        onChange={(e) => setFormData(prev => ({ ...prev, duration: e.target.value }))}
                        className="w-full px-3 py-2 border rounded-lg"
                    />
                </div>
            </div>

            <button
                type="submit"
                disabled={!isReady || !isInitialized || isLoading}
                className="w-full px-4 py-2 bg-foreground text-background rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
            >
                {isLoading ? 'Creating...' : 'Create Savings Group'}
            </button>
        </form>
    );
} 