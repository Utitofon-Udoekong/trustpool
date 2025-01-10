"use client";

import { useAbstraxionAccount, useAbstraxionSigningClient } from "@burnt-labs/abstraxion";
import { useState, useEffect } from "react";

export function useXionAccount() {
    const { data: account } = useAbstraxionAccount();
    const { client } = useAbstraxionSigningClient();
    const [isReady, setIsReady] = useState(false);

    useEffect(() => {
        if (account && client) {
            setIsReady(true);
        }
    }, [account, client]);

    const sendTransaction = async (message: any) => {
        if (!client || !account) {
            throw new Error('Client or account not initialized');
        }

        try {
            const response = await client.signAndBroadcast(
                account.bech32Address,
                [message],
                'auto'
            );
            return response;
        } catch (error) {
            console.error('Transaction failed:', error);
            throw error;
        }
    };

    return {
        account,
        client,
        isReady,
        sendTransaction
    };
} 