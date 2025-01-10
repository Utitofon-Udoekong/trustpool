"use client";

import { useState, useEffect } from 'react';
import type { SavingsGroup, DistributionRules, PrivacySettings } from '@/types/group';
import { ErrorMessage } from '@/components/ui/ErrorMessage';
import { validateSettings } from '@/lib/validation/settingsValidation';

interface GroupSettingsProps {
    group: SavingsGroup;
    isCreator: boolean;
    onUpdateSettings: (settings: Partial<SavingsGroup>) => Promise<void>;
}

export function GroupSettings({ group, isCreator, onUpdateSettings }: GroupSettingsProps) {
    const [isEditing, setIsEditing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [settings, setSettings] = useState({
        status: group.status,
        distributionRules: {
            roundDuration: 'monthly',
            distributionOrder: 'random',
            autoDistribute: true,
        },
        privacySettings: {
            membersVisible: true,
            amountsVisible: true,
            historyVisible: true,
        }
    });

    useEffect(() => {
        if (!isCreator && !group.privacySettings.amountsVisible) {
            setSettings(prev => ({
                ...prev,
                distributionRules: {
                    ...prev.distributionRules,
                    autoDistribute: true,
                }
            }));
        }
    }, [group.privacySettings.amountsVisible, isCreator]);

    const shouldShowSection = (section: 'members' | 'amounts' | 'history') => {
        if (isCreator) return true;
        return group.privacySettings[`${section}Visible`];
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        try {
            const validationErrors = validateSettings(settings);
            if (validationErrors.length > 0) {
                setError(validationErrors.map(err => err.message).join('. '));
                return;
            }

            await onUpdateSettings(settings);
            setIsEditing(false);
        } catch (err) {
            setError('Failed to update group settings');
        }
    };

    const handlePrivacyChange = (field: keyof PrivacySettings, value: boolean) => {
        const newSettings = {
            ...settings,
            privacySettings: {
                ...settings.privacySettings,
                [field]: value
            }
        };

        const validationErrors = validateSettings(newSettings);
        if (validationErrors.length > 0) {
            setError(validationErrors.map(err => err.message).join('. '));
            return;
        }

        setSettings(newSettings);
        setError(null);
    };

    if (!isCreator) {
        return null;
    }

    return (
        <div className="space-y-6 p-4 border rounded-lg">
            <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Group Settings</h3>
                {!isEditing && (
                    <button
                        onClick={() => setIsEditing(true)}
                        className="text-sm text-blue-500 hover:text-blue-700"
                    >
                        Edit Settings
                    </button>
                )}
            </div>

            {error && (
                <ErrorMessage
                    message={error}
                    onRetry={() => setError(null)}
                />
            )}

            {isEditing ? (
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-2">
                            Group Status
                        </label>
                        <select
                            value={settings.status}
                            onChange={(e) => setSettings(prev => ({
                                ...prev,
                                status: e.target.value as SavingsGroup['status']
                            }))}
                            className="w-full px-3 py-2 border rounded-lg"
                        >
                            <option value="active">Active</option>
                            <option value="paused">Paused</option>
                            <option value="completed">Completed</option>
                        </select>
                    </div>

                    {shouldShowSection('amounts') && (
                        <div>
                            <h4 className="font-medium mb-2">Distribution Rules</h4>
                            <div className="space-y-2">
                                <label className="flex items-center">
                                    <input
                                        type="checkbox"
                                        checked={settings.distributionRules.autoDistribute}
                                        onChange={(e) => setSettings(prev => ({
                                            ...prev,
                                            distributionRules: {
                                                ...prev.distributionRules,
                                                autoDistribute: e.target.checked
                                            }
                                        }))}
                                        className="mr-2"
                                    />
                                    Auto-distribute funds
                                </label>

                                <select
                                    value={settings.distributionRules.distributionOrder}
                                    onChange={(e) => setSettings(prev => ({
                                        ...prev,
                                        distributionRules: {
                                            ...prev.distributionRules,
                                            distributionOrder: e.target.value
                                        }
                                    }))}
                                    className="w-full px-3 py-2 border rounded-lg"
                                >
                                    <option value="random">Random Order</option>
                                    <option value="sequential">Sequential Order</option>
                                </select>
                            </div>
                        </div>
                    )}

                    {isCreator && (
                        <div>
                            <h4 className="font-medium mb-2">Privacy Settings</h4>
                            <div className="space-y-2">
                                <label className="flex items-center">
                                    <input
                                        type="checkbox"
                                        checked={settings.privacySettings.membersVisible}
                                        onChange={(e) => handlePrivacyChange('membersVisible', e.target.checked)}
                                        className="mr-2"
                                    />
                                    Show member list
                                </label>

                                <label className="flex items-center">
                                    <input
                                        type="checkbox"
                                        checked={settings.privacySettings.amountsVisible}
                                        onChange={(e) => handlePrivacyChange('amountsVisible', e.target.checked)}
                                        className="mr-2"
                                    />
                                    Show contribution amounts
                                </label>

                                <label className="flex items-center">
                                    <input
                                        type="checkbox"
                                        checked={settings.privacySettings.historyVisible}
                                        onChange={(e) => handlePrivacyChange('historyVisible', e.target.checked)}
                                        className="mr-2"
                                    />
                                    Show transaction history
                                </label>
                            </div>
                        </div>
                    )}

                    <div className="flex justify-end gap-2">
                        <button
                            type="button"
                            onClick={() => setIsEditing(false)}
                            className="px-4 py-2 text-sm border rounded-lg hover:bg-gray-50"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 text-sm bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                        >
                            Save Changes
                        </button>
                    </div>
                </form>
            ) : (
                <div className="space-y-4">
                    <div>
                        <h4 className="font-medium">Status</h4>
                        <p className="text-sm">{settings.status}</p>
                    </div>

                    {shouldShowSection('amounts') && (
                        <div>
                            <h4 className="font-medium">Distribution Rules</h4>
                            <ul className="text-sm space-y-1">
                                <li>Order: {settings.distributionRules.distributionOrder}</li>
                                <li>Auto-distribute: {settings.distributionRules.autoDistribute ? 'Yes' : 'No'}</li>
                            </ul>
                        </div>
                    )}

                    {isCreator && (
                        <div>
                            <h4 className="font-medium">Privacy Settings</h4>
                            <ul className="text-sm space-y-1">
                                <li>Members visible: {settings.privacySettings.membersVisible ? 'Yes' : 'No'}</li>
                                <li>Amounts visible: {settings.privacySettings.amountsVisible ? 'Yes' : 'No'}</li>
                                <li>History visible: {settings.privacySettings.historyVisible ? 'Yes' : 'No'}</li>
                            </ul>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
} 