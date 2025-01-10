import type { Coin } from "@cosmjs/stargate";

export interface Member {
    address: string;
    email: string;
    joinedAt: Date;
    contributionStatus: 'pending' | 'paid' | 'overdue';
}

export interface Schedule {
    frequency: 'weekly' | 'monthly';
    startDate: Date;
    endDate: Date;
}

export interface DistributionRules {
    roundDuration: 'weekly' | 'monthly';
    distributionOrder: 'random' | 'sequential';
    autoDistribute: boolean;
}

export interface PrivacySettings {
    membersVisible: boolean;
    amountsVisible: boolean;
    historyVisible: boolean;
}

export interface SavingsGroup {
    id: string;
    name: string;
    description: string;
    contributionAmount: number;
    currency: string;
    schedule: Schedule;
    members: Member[];
    creator: string;
    totalPool: number;
    currentRound: number;
    status: 'active' | 'completed' | 'paused';
    encryptedData?: string;
    distributionRules: DistributionRules;
    privacySettings: PrivacySettings;
}

export interface GroupTransaction {
    id: string;
    groupId: string;
    type: 'contribution' | 'distribution';
    amount: Coin;
    from: string;
    to?: string;
    timestamp: Date;
    status: 'pending' | 'completed' | 'failed';
} 