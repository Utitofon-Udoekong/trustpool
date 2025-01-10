"use client";

import { useState } from 'react';
import { useAuth } from '@/lib/auth/AuthContext';
import { useLit } from '@/lib/lit/useLit';
import type { SavingsGroup } from '@/types/group';

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
  const { user, isConnected } = useAuth();
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
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isConnected || !isInitialized) {
      alert('Please connect your wallet and wait for initialization');
      return;
    }

    setIsSubmitting(true);

    try {
      // Calculate end date based on duration
      const startDate = new Date(formData.startDate);
      const endDate = new Date(startDate);
      endDate.setMonth(endDate.getMonth() + parseInt(formData.duration));

      // Create the group data
      const groupData: Partial<SavingsGroup> = {
        name: formData.name,
        description: formData.description,
        contributionAmount: parseFloat(formData.contributionAmount),
        currency: formData.currency,
        schedule: {
          frequency: formData.frequency,
          startDate,
          endDate,
        },
        members: [{ 
          address: user.address, 
          email: '', 
          joinedAt: new Date(),
          contributionStatus: 'pending'
        }],
        creator: user.address,
        totalPool: 0,
        currentRound: 0,
        status: 'active'
      };

      // Encrypt sensitive group data
      const encryptedData = await encryptGroupData(
        {
          members: groupData.members,
          privateNotes: formData.description
        },
      );

      // TODO: Store group data on-chain using XION
      console.log('Group created:', { 
        ...groupData, 
        encryptedData 
      });
      
    } catch (error) {
      console.error('Error creating group:', error);
      alert('Failed to create group. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl mx-auto">
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
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">
          Description
        </label>
        <textarea
          value={formData.description}
          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
          className="w-full px-3 py-2 border rounded-lg"
          rows={3}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-2">
            Contribution Amount
          </label>
          <input
            type="number"
            required
            min="0"
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
            <option value="XION">XION</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
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

      <button
        type="submit"
        disabled={!isConnected || !isInitialized || isSubmitting}
        className="w-full px-4 py-2 bg-foreground text-background rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
      >
        {isSubmitting ? 'Creating...' : 'Create Savings Group'}
      </button>
    </form>
  );
} 