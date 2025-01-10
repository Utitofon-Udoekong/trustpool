import { useState, useCallback } from 'react';
import { ethers } from 'ethers';
import { CCTPService } from '../cctp/cctpService';
import { useXionAccount } from '../chain/useXionAccount';

export function useCCTP() {
    const { account } = useXionAccount();
    const [isTransferring, setIsTransferring] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const initiateCrossChainTransfer = useCallback(async (
        amount: string,
        sourceChain: 'ethereum' | 'xion',
        destinationChain: 'ethereum' | 'xion'
    ) => {
        if (!account || !window.ethereum) {
            throw new Error('Wallet not connected');
        }

        setIsTransferring(true);
        setError(null);

        try {
            const provider = new ethers.BrowserProvider(window.ethereum);
            const cctpService = new CCTPService(provider, sourceChain, destinationChain);

            const tx = await cctpService.initiateCrossChainTransfer(
                amount,
                account.bech32Address
            );

            await tx.wait();
            return tx.hash;
        } catch (err) {
            console.error('Cross-chain transfer failed:', err);
            setError('Failed to initiate cross-chain transfer');
            throw err;
        } finally {
            setIsTransferring(false);
        }
    }, [account]);

    return {
        initiateCrossChainTransfer,
        isTransferring,
        error
    };
} 