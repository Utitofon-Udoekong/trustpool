import { USDCTransfer } from '@/components/usdc/USDCTransfer';
import { USDCBalances } from '@/components/usdc/USDCBalances';

export default function USDCPage() {
    return (
        <div className="max-w-2xl mx-auto py-8">
            <h1 className="text-2xl font-bold mb-8">USDC Cross-Chain Transfer</h1>
            <USDCBalances />
            <div className="h-8" />
            <USDCTransfer />
        </div>
    );
} 