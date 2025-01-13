"use client";

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { NetworkSelector } from './NetworkSelector';
import { AmountInput } from './AmountInput';
import { LoadingSpinner } from '../ui/LoadingSpinner';
import { useToast } from '../ui/Toast';
import { formatUSDC } from '@/lib/format';
import { useUSDCBalance } from '@/lib/hooks/useUSDCBalance';

const ContributionSchema = z.object({
    network: z.enum(['Ethereum', 'Arbitrum', 'Avalanche', 'Optimism', 'Base']),
    amount: z.string()
        .refine(val => !isNaN(Number(val)), 'Must be a valid number')
        .refine(val => Number(val) > 0, 'Amount must be greater than 0')
});

type ContributionForm = z.infer<typeof ContributionSchema>;

interface ContributeFormProps {
    groupId: string;
    onSuccess?: () => void;
}

export function ContributeForm({ groupId, onSuccess }: ContributeFormProps) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { toast } = useToast();
    const { register, handleSubmit, watch, formState: { errors } } = useForm<ContributionForm>({
        resolver: zodResolver(ContributionSchema)
    });

    const selectedNetwork = watch('network');
    const { data: balance } = useUSDCBalance(selectedNetwork);

    const onSubmit = async (data: ContributionForm) => {
        try {
            setIsSubmitting(true);
            // TODO: Implement contribution logic
            toast({
                title: 'Contribution Started',
                description: `Contributing ${formatUSDC(data.amount)} from ${data.network}`,
            });
            onSuccess?.();
        } catch (error) {
            console.error('Contribution failed:', error);
            toast({
                title: 'Contribution Failed',
                description: 'Failed to process your contribution. Please try again.',
                variant: 'destructive',
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-4">
                <NetworkSelector
                    {...register('network')}
                    error={errors.network?.message}
                />

                <AmountInput
                    {...register('amount')}
                    error={errors.amount?.message}
                    balance={balance}
                    network={selectedNetwork}
                />
            </div>

            <button
                type="submit"
                disabled={isSubmitting}
                className="w-full px-4 py-2 bg-foreground text-background rounded-lg hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {isSubmitting ? (
                    <LoadingSpinner className="w-5 h-5 mx-auto" />
                ) : (
                    'Contribute'
                )}
            </button>
        </form>
    );
} 