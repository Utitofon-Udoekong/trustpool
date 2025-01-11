import { useState } from 'react';
import { useUSDC } from '@/lib/hooks/useUSDC';

export function USDCTransfer() {
    const { transferFromEthereum, isLoading, error, transferStatus } = useUSDC();
    const [amount, setAmount] = useState('');

    const handleTransfer = async () => {
        try {
            const result = await transferFromEthereum(amount);
            console.log('Transfer completed:', result);
        } catch (err) {
            console.error('Transfer failed:', err);
        }
    };

    const getStatusMessage = () => {
        switch (transferStatus.step) {
            case 'burning':
                return 'Burning USDC on Ethereum...';
            case 'attesting':
                return 'Waiting for Circle attestation...';
            case 'receiving':
                return 'Receiving on Noble chain...';
            case 'transferring':
                return 'Transferring to Xion...';
            case 'complete':
                return 'Transfer complete!';
            default:
                return '';
        }
    };

    return (
        <div className="p-4 space-y-4">
            <div className="space-y-2">
                <label className="block text-sm font-medium">
                    Amount (USDC)
                </label>
                <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full px-3 py-2 border rounded"
                    placeholder="Enter amount"
                    disabled={isLoading}
                />
            </div>

            <button
                onClick={handleTransfer}
                disabled={isLoading || !amount}
                className="w-full px-4 py-2 text-white bg-blue-600 rounded hover:bg-blue-700 disabled:bg-blue-300"
            >
                {isLoading ? 'Processing...' : 'Transfer USDC'}
            </button>

            {isLoading && (
                <div className="space-y-2">
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div 
                            className="bg-blue-600 h-2.5 rounded-full transition-all duration-500"
                            style={{ width: `${transferStatus.progress}%` }}
                        />
                    </div>
                    <p className="text-sm text-center text-gray-600">
                        {getStatusMessage()}
                    </p>
                </div>
            )}

            {error && (
                <div className="p-3 text-sm text-red-600 bg-red-100 rounded">
                    {error}
                </div>
            )}
        </div>
    );
} 