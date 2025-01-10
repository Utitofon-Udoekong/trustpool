"use client";

import { useState } from 'react';
import type { Schedule } from '@/types/group';
import { ErrorMessage } from '@/components/ui/ErrorMessage';

interface ContributionScheduleProps {
    schedule: Schedule;
    contributionAmount: number;
    currency: string;
    isCreator: boolean;
    onUpdateSchedule: (schedule: Schedule) => Promise<void>;
}

export function ContributionSchedule({
    schedule,
    contributionAmount,
    currency,
    isCreator,
    onUpdateSchedule
}: ContributionScheduleProps) {
    const [isEditing, setIsEditing] = useState(false);
    const [newSchedule, setNewSchedule] = useState(schedule);
    const [isUpdating, setIsUpdating] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        
        try {
            await onUpdateSchedule(newSchedule);
            setIsEditing(false);
        } catch (err) {
            setError('Failed to update schedule');
        }
    };

    const nextContributionDate = () => {
        const now = new Date();
        const start = new Date(schedule.startDate);
        const end = new Date(schedule.endDate);

        if (now > end || now < start) return null;

        if (schedule.frequency === 'weekly') {
            // Calculate next weekly date
            const nextDate = new Date(start);
            while (nextDate <= now) {
                nextDate.setDate(nextDate.getDate() + 7);
            }
            return nextDate;
        } else {
            // Calculate next monthly date
            const nextDate = new Date(start);
            while (nextDate <= now) {
                nextDate.setMonth(nextDate.getMonth() + 1);
            }
            return nextDate;
        }
    };

    const next = nextContributionDate();

    return (
        <div className="space-y-4 p-4 border rounded-lg">
            {error && (
                <ErrorMessage
                    message={error}
                    onRetry={() => setError(null)}
                />
            )}
            <div className="flex justify-between items-start">
                <div>
                    <h3 className="text-lg font-semibold">Contribution Schedule</h3>
                    <p className="text-sm opacity-70">
                        {contributionAmount} {currency} {schedule.frequency}
                    </p>
                </div>
                {isCreator && !isEditing && (
                    <button
                        onClick={() => setIsEditing(true)}
                        className="text-sm text-blue-500 hover:text-blue-700"
                    >
                        Edit Schedule
                    </button>
                )}
            </div>

            {isEditing ? (
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">
                            Frequency
                        </label>
                        <select
                            value={newSchedule.frequency}
                            onChange={(e) => setNewSchedule(prev => ({
                                ...prev,
                                frequency: e.target.value as 'weekly' | 'monthly'
                            }))}
                            className="w-full px-3 py-2 border rounded-lg"
                        >
                            <option value="weekly">Weekly</option>
                            <option value="monthly">Monthly</option>
                        </select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">
                                Start Date
                            </label>
                            <input
                                type="date"
                                value={newSchedule.startDate.toISOString().split('T')[0]}
                                onChange={(e) => setNewSchedule(prev => ({
                                    ...prev,
                                    startDate: new Date(e.target.value)
                                }))}
                                className="w-full px-3 py-2 border rounded-lg"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">
                                End Date
                            </label>
                            <input
                                type="date"
                                value={newSchedule.endDate.toISOString().split('T')[0]}
                                onChange={(e) => setNewSchedule(prev => ({
                                    ...prev,
                                    endDate: new Date(e.target.value)
                                }))}
                                className="w-full px-3 py-2 border rounded-lg"
                            />
                        </div>
                    </div>

                    <div className="flex justify-end gap-2">
                        <button
                            type="button"
                            onClick={() => setIsEditing(false)}
                            className="px-3 py-1 text-sm"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isUpdating}
                            className="px-3 py-1 bg-foreground text-background rounded-lg text-sm"
                        >
                            {isUpdating ? 'Updating...' : 'Update Schedule'}
                        </button>
                    </div>
                </form>
            ) : (
                <div className="space-y-2">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <p className="text-sm font-medium">Start Date</p>
                            <p className="text-sm">
                                {new Date(schedule.startDate).toLocaleDateString()}
                            </p>
                        </div>
                        <div>
                            <p className="text-sm font-medium">End Date</p>
                            <p className="text-sm">
                                {new Date(schedule.endDate).toLocaleDateString()}
                            </p>
                        </div>
                    </div>

                    {next && (
                        <div className="mt-4 p-3 bg-green-50 rounded-lg">
                            <p className="text-sm font-medium text-green-800">
                                Next contribution due: {next.toLocaleDateString()}
                            </p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
} 