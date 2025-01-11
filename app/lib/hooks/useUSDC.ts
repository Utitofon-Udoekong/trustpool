import { useState, useCallback } from 'react';
import { ethers } from 'ethers';
import { useXionAccount } from '../chain/useXionAccount';
import { NobleConnection } from '../chain/nobleConnection';
import { CCTPService } from '../cctp/cctpService';

export function useUSDC() {
    const { account, sendTransaction } = useXionAccount();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [transferStatus, setTransferStatus] = useState<{
        step: 'idle' | 'burning' | 'attesting' | 'receiving' | 'transferring' | 'complete';
        progress: number;
    }>({ step: 'idle', progress: 0 });

    // Transfer USDC from Ethereum to Xion via Noble
    const transferFromEthereum = useCallback(async (amount: string) => {
        if (!account || !window.ethereum) {
            throw new Error('Wallet not connected');
        }
        
        setIsLoading(true);
        setError(null);
        setTransferStatus({ step: 'burning', progress: 0 });

        try {
            // Initialize providers and service
            const ethereumProvider = new ethers.BrowserProvider(window.ethereum);
            const cctpService = new CCTPService(
                ethereumProvider,
                'ethereum-goerli',
                'noble-testnet'
            );

            // 1. CCTP transfer from Ethereum to Noble
            setTransferStatus({ step: 'burning', progress: 25 });
            const { transactionHash, messageBytes } = await cctpService.initiateCrossChainTransfer(
                amount,
                account.bech32Address
            );

            // 2. Wait for attestation
            setTransferStatus({ step: 'attesting', progress: 50 });
            let attestation: string | null = null;
            let attempts = 0;
            const maxAttempts = 30; // 5 minutes max wait time

            while (!attestation && attempts < maxAttempts) {
                try {
                    attestation = await cctpService.getMessageAttestation(messageBytes);
                } catch (err) {
                    attempts++;
                    await new Promise(resolve => setTimeout(resolve, 10000)); // Wait 10 seconds between attempts
                }
            }

            if (!attestation) {
                throw new Error('Failed to get attestation after maximum attempts');
            }

            // 3. Receive message on Noble
            setTransferStatus({ step: 'receiving', progress: 75 });
            const receiveTx = await cctpService.receiveMessage(messageBytes, attestation);
            await receiveTx.wait();

            // 4. IBC transfer from Noble to Xion
            setTransferStatus({ step: 'transferring', progress: 90 });
            const ibcMsg = await NobleConnection.transferUSDC(
                amount,
                account.bech32Address,
                account.bech32Address
            );
            
            const ibcTxHash = await sendTransaction(ibcMsg);

            setTransferStatus({ step: 'complete', progress: 100 });

            return {
                cctpTxHash: transactionHash,
                attestation,
                ibcTxHash
            };
        } catch (err) {
            console.error('USDC transfer failed:', err);
            setError(err instanceof Error ? err.message : 'Failed to transfer USDC');
            throw err;
        } finally {
            setIsLoading(false);
        }
    }, [account, sendTransaction]);

    // Get USDC balance on both chains
    const getBalances = useCallback(async () => {
        if (!account) return { xion: '0', noble: '0' };
        
        try {
            const [xionBalance, nobleBalance] = await Promise.all([
                NobleConnection.getUSDCBalance(account.bech32Address),
                NobleConnection.getNativeUSDCBalance(account.bech32Address)
            ]);

            return {
                xion: xionBalance.value.amount || '0',
                noble: nobleBalance.value.amount || '0'
            };
        } catch (err) {
            console.error('Failed to get USDC balances:', err);
            return { xion: '0', noble: '0' };
        }
    }, [account]);

    // Check transfer status
    const checkTransferStatus = useCallback(async (messageHash: string) => {
        if (!window.ethereum) throw new Error('Wallet not connected');

        const provider = new ethers.BrowserProvider(window.ethereum);
        const cctpService = new CCTPService(
            provider,
            'ethereum-goerli',
            'noble-testnet'
        );

        return cctpService.getMessageStatus(messageHash);
    }, []);

    return {
        transferFromEthereum,
        getBalances,
        checkTransferStatus,
        isLoading,
        error,
        transferStatus
    };
} 