import type { SavingsGroup, DistributionRules, PrivacySettings } from '@/types/group';

interface ValidationError {
    field: string;
    message: string;
}

interface SettingsValidation {
    status?: SavingsGroup['status'];
    distributionRules?: DistributionRules;
    privacySettings?: PrivacySettings;
}

export function validateSettings(settings: SettingsValidation): ValidationError[] {
    const errors: ValidationError[] = [];

    // Status validation
    if (settings.status && !['active', 'paused', 'completed'].includes(settings.status)) {
        errors.push({
            field: 'status',
            message: 'Invalid group status'
        });
    }

    // Distribution rules validation
    if (settings.distributionRules) {
        const { roundDuration, distributionOrder } = settings.distributionRules;

        if (roundDuration && !['weekly', 'monthly'].includes(roundDuration)) {
            errors.push({
                field: 'distributionRules.roundDuration',
                message: 'Invalid round duration'
            });
        }

        if (distributionOrder && !['random', 'sequential'].includes(distributionOrder)) {
            errors.push({
                field: 'distributionRules.distributionOrder',
                message: 'Invalid distribution order'
            });
        }
    }

    // Privacy settings validation
    if (settings.privacySettings) {
        const { membersVisible, amountsVisible, historyVisible } = settings.privacySettings;

        // At least one visibility option must be enabled
        if (!membersVisible && !amountsVisible && !historyVisible) {
            errors.push({
                field: 'privacySettings',
                message: 'At least one visibility option must be enabled'
            });
        }

        // Members must be visible if amounts are visible
        if (amountsVisible && !membersVisible) {
            errors.push({
                field: 'privacySettings.membersVisible',
                message: 'Members must be visible if amounts are visible'
            });
        }

        // History requires amounts to be visible
        if (historyVisible && !amountsVisible) {
            errors.push({
                field: 'privacySettings.historyVisible',
                message: 'Transaction history requires amounts to be visible'
            });
        }
    }

    return errors;
} 