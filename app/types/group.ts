export interface GroupMember {
  address: string;
  email: string;
  joinedAt: Date;
  contributionStatus: 'pending' | 'completed';
}

export interface SavingsGroup {
  id: string;
  name: string;
  description?: string;
  contributionAmount: number;
  currency: string;
  schedule: {
    frequency: 'weekly' | 'monthly';
    startDate: Date;
    endDate: Date;
  };
  members: GroupMember[];
  creator: string;
  totalPool: number;
  currentRound: number;
  status: 'active' | 'completed' | 'paused';
  encryptedData?: string; // Lit Protocol encrypted data
} 