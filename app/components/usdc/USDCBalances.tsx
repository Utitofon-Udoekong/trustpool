import { useEffect, useState } from 'react';
import { useUSDC } from '@/lib/hooks/useUSDC';

export function USDCBalances() {
    const { getBalances } = useUSDC();
    const [balances, setBalances] = useState({ xion: '0', noble: '0' });
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchBalances = async () => {
            try {
                const result = await getBalances();
                setBalances(result);
            } catch (err) {
                console.error('Failed to fetch balances:', err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchBalances();
        // Refresh every 30 seconds
        const interval = setInterval(fetchBalances, 30000);
        return () => clearInterval(interval);
    }, [getBalances]);

    return (
        <div className="p-4 space-y-4">
            <h2 className="text-lg font-semibold">USDC Balances</h2>
            
            {isLoading ? (
                <div className="text-center text-gray-600">Loading balances...</div>
            ) : (
                <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 bg-white rounded shadow">
                        <div className="text-sm text-gray-600">Xion</div>
                        <div className="text-xl font-semibold">{balances.xion} USDC</div>
                    </div>
                    <div className="p-3 bg-white rounded shadow">
                        <div className="text-sm text-gray-600">Noble</div>
                        <div className="text-xl font-semibold">{balances.noble} USDC</div>
                    </div>
                </div>
            )}
        </div>
    );
} 