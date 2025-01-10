"use client";

import { useState, useCallback } from 'react';
import { useXionAccount } from '../chain/useXionAccount';
import { GroupService } from '../chain/groupService';
import type { Coin } from "@cosmjs/stargate";
import type { SavingsGroup, GroupTransaction } from "@/types/group";

export function useGroup(groupId?: string) {
    const { account, client, sendTransaction, isReady } = useXionAccount();
    const [isLoading, setIsLoading] = useState(false);
    const [group, setGroup] = useState<SavingsGroup | null>(null);
    const [transactions, setTransactions] = useState<GroupTransaction[]>([]);

    const createGroup = async (params: {
        name: string;
        description: string;
        contributionAmount: Coin;
        encryptedData: string;
    }) => {
        if (!isReady) throw new Error('Chain connection not ready');
        setIsLoading(true);

        try {
            const msg = GroupService.createGroupMsg(params);
            return await sendTransaction(msg);
        } finally {
            setIsLoading(false);
        }
    };

    const joinGroup = async (id: string) => {
        if (!isReady) throw new Error('Chain connection not ready');
        setIsLoading(true);

        try {
            const msg = GroupService.joinGroupMsg(id);
            return await sendTransaction(msg);
        } finally {
            setIsLoading(false);
        }
    };

    const fetchGroup = useCallback(async () => {
        if (!groupId || !client) return;
        
        try {
            const groupData = await GroupService.queryGroup(client, groupId);
            setGroup(groupData);
        } catch (error) {
            console.error('Error fetching group:', error);
        }
    }, [groupId, client]);

    const fetchTransactions = useCallback(async (page?: number, limit?: number) => {
        if (!groupId || !client) return;
        
        try {
            const response = await GroupService.queryGroupTransactions(client, groupId, page, limit);
            setTransactions(response.transactions);
            return response;
        } catch (error) {
            console.error('Error fetching transactions:', error);
            throw error;
        }
    }, [groupId, client]);

    const contribute = async (amount: Coin) => {
        if (!groupId || !isReady) throw new Error('Not ready');
        setIsLoading(true);

        try {
            const msg = GroupService.contributeMsg(groupId, amount);
            const response = await sendTransaction(msg);
            await fetchTransactions();
            return response;
        } finally {
            setIsLoading(false);
        }
    };

    const distributePool = async (round: number) => {
        if (!groupId || !isReady) throw new Error('Not ready');
        setIsLoading(true);

        try {
            const msg = GroupService.distributePoolMsg(groupId, round);
            const response = await sendTransaction(msg);
            await Promise.all([fetchGroup(), fetchTransactions()]);
            return response;
        } finally {
            setIsLoading(false);
        }
    };

    const updateStatus = async (status: SavingsGroup['status']) => {
        if (!groupId || !isReady) throw new Error('Not ready');
        setIsLoading(true);

        try {
            const msg = GroupService.updateGroupStatusMsg(groupId, status);
            const response = await sendTransaction(msg);
            await fetchGroup();
            return response;
        } finally {
            setIsLoading(false);
        }
    };

    return {
        createGroup,
        joinGroup,
        isLoading,
        isReady,
        account,
        group,
        transactions,
        contribute,
        distributePool,
        updateStatus,
        fetchGroup,
        fetchTransactions,
    };
} 