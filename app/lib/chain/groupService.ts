import { Coin } from "@cosmjs/stargate";
import type { SavingsGroup, GroupTransaction, Member, Schedule, DistributionRules, PrivacySettings } from "@/types/group";
import { useLit } from '../lit/useLit';

interface CreateGroupParams {
    name: string;
    description: string;
    contributionAmount: Coin;
    encryptedData: string;
}

interface GroupData {
    id: string;
    name: string;
    description: string;
    contributionAmount: Coin;
    creator: string;
    totalPool: Coin;
    currentRound: number;
    status: 'active' | 'completed' | 'paused';
    encryptedData: string;
}

export class GroupService {
    static createGroupMsg(params: CreateGroupParams) {
        // Create the message for group creation
        return {
            typeUrl: "/trustpool.v1.MsgCreateGroup",
            value: {
                ...params,
            },
        };
    }

    static joinGroupMsg(groupId: string) {
        return {
            typeUrl: "/trustpool.v1.MsgJoinGroup",
            value: {
                groupId,
            },
        };
    }

    static contributeMsg(groupId: string, amount: Coin) {
        return {
            typeUrl: "/trustpool.v1.MsgContribute",
            value: {
                groupId,
                amount,
            },
        };
    }

    // Query functions
    static async queryGroup(client: any, groupId: string): Promise<SavingsGroup> {
        const response: GroupData = await client.queryContract({
            address: process.env.NEXT_PUBLIC_TRUSTPOOL_CONTRACT!,
            query: {
                get_group: { group_id: groupId },
            },
        });

        // Decrypt the encrypted data
        const decryptedData = await useLit().decryptGroupData(
            JSON.parse(response.encryptedData),
            groupId
        );

        return {
            ...this.transformGroupData(response),
            ...decryptedData,
        };
    }

    static async queryUserGroups(client: any, address: string): Promise<SavingsGroup[]> {
        const response: GroupData[] = await client.queryContract({
            address: process.env.NEXT_PUBLIC_TRUSTPOOL_CONTRACT!,
            query: {
                get_user_groups: { address },
            },
        });
        return response.map(this.transformGroupData);
    }

    static async queryGroupTransactions(
        client: any, 
        groupId: string,
        page: number = 1,
        limit: number = 10
    ): Promise<{ transactions: GroupTransaction[]; total: number }> {
        const response = await client.queryContract({
            address: process.env.NEXT_PUBLIC_TRUSTPOOL_CONTRACT!,
            query: {
                get_group_transactions: { 
                    group_id: groupId,
                    page,
                    limit,
                },
            },
        });
        return response;
    }

    static distributePoolMsg(groupId: string, round: number) {
        return {
            typeUrl: "/trustpool.v1.MsgDistributePool",
            value: {
                groupId,
                round,
            },
        };
    }

    static updateGroupStatusMsg(groupId: string, status: SavingsGroup['status']) {
        return {
            typeUrl: "/trustpool.v1.MsgUpdateGroupStatus",
            value: {
                groupId,
                status,
            },
        };
    }

    static async queryMemberContributions(
        client: any,
        groupId: string,
        address: string
    ): Promise<GroupTransaction[]> {
        const response = await client.queryContract({
            address: process.env.NEXT_PUBLIC_TRUSTPOOL_CONTRACT!,
            query: {
                get_member_contributions: { 
                    group_id: groupId,
                    address,
                },
            },
        });
        return response;
    }

    static inviteMemberMsg(groupId: string, email: string) {
        return {
            typeUrl: "/trustpool.v1.MsgInviteMember",
            value: {
                groupId,
                email,
            },
        };
    }

    static removeMemberMsg(groupId: string, address: string) {
        return {
            typeUrl: "/trustpool.v1.MsgRemoveMember",
            value: {
                groupId,
                address,
            },
        };
    }

    static async queryMembers(
        client: any,
        groupId: string
    ): Promise<Member[]> {
        const response = await client.queryContract({
            address: process.env.NEXT_PUBLIC_TRUSTPOOL_CONTRACT!,
            query: {
                get_members: { group_id: groupId },
            },
        });
        return response;
    }

    static updateScheduleMsg(groupId: string, schedule: Schedule) {
        return {
            typeUrl: "/trustpool.v1.MsgUpdateSchedule",
            value: {
                groupId,
                schedule: {
                    frequency: schedule.frequency,
                    startDate: schedule.startDate.toISOString(),
                    endDate: schedule.endDate.toISOString(),
                },
            },
        };
    }

    static async updateGroupSettingsMsg(groupId: string, settings: {
        status?: SavingsGroup['status'];
        distributionRules?: DistributionRules;
        privacySettings?: PrivacySettings;
    }) {
        // Only status is stored unencrypted
        const { status, ...sensitiveSettings } = settings;

        // Encrypt sensitive settings if they exist
        let encryptedData: string | undefined;
        if (Object.keys(sensitiveSettings).length > 0) {
            const encrypted = await useLit().encryptGroupData(sensitiveSettings, groupId);
            encryptedData = JSON.stringify(encrypted);
        }

        return {
            typeUrl: "/trustpool.v1.MsgUpdateGroupSettings",
            value: {
                groupId,
                status,
                encryptedData,
            },
        };
    }

    static updateTransactionStatusMsg(groupId: string, transactionId: string, status: GroupTransaction['status']) {
        return {
            typeUrl: "/trustpool.v1.MsgUpdateTransactionStatus",
            value: {
                groupId,
                transactionId,
                status,
            },
        };
    }

    private static transformGroupData(data: GroupData): SavingsGroup {
        return {
            ...data,
            currency: data.contributionAmount.denom,
            contributionAmount: parseInt(data.contributionAmount.amount),
            totalPool: parseInt(data.totalPool.amount),
            schedule: {
                frequency: 'monthly',
                startDate: new Date(),
                endDate: new Date(),
            },
            members: [],
            distributionRules: {
                roundDuration: 'monthly',
                distributionOrder: 'random',
                autoDistribute: true,
            },
            privacySettings: {
                membersVisible: true,
                amountsVisible: true,
                historyVisible: true,
            }
        };
    }
} 