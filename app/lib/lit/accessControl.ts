import { AccessControlConditions } from '@lit-protocol/types';

export type AccessControlType = 'member' | 'creator' | 'contributor';

interface GroupAccessParams {
    groupId: string;
    contractAddress: string;
    chainId?: string;
}

export class AccessControlService {
    private static readonly DEFAULT_CHAIN = 'xion';

    /**
     * Generate access control conditions for group members
     */
    static forGroupMember({ groupId, contractAddress, chainId = this.DEFAULT_CHAIN }: GroupAccessParams): AccessControlConditions {
        return [{
            contractAddress,
            standardContractType: 'cosmos',
            chain: chainId,
            method: 'is_group_member',
            parameters: [groupId],
            returnValueTest: {
                comparator: '=',
                value: 'true'
            }
        }];
    }

    /**
     * Generate access control conditions for group creator
     */
    static forGroupCreator({ groupId, contractAddress, chainId = this.DEFAULT_CHAIN }: GroupAccessParams): AccessControlConditions {
        return [{
            contractAddress,
            standardContractType: 'cosmos',
            chain: chainId,
            method: 'get_group_creator',
            parameters: [groupId],
            returnValueTest: {
                comparator: '=',
                value: ':userAddress' // Lit Protocol will replace this with the user's address
            }
        }];
    }

    /**
     * Generate access control conditions for contributors
     */
    static forContributor({ groupId, contractAddress, chainId = this.DEFAULT_CHAIN }: GroupAccessParams): AccessControlConditions {
        return [{
            contractAddress,
            standardContractType: 'cosmos',
            chain: chainId,
            method: 'has_contributed',
            parameters: [groupId, ':userAddress'],
            returnValueTest: {
                comparator: '=',
                value: 'true'
            }
        }];
    }

    /**
     * Combine multiple access conditions with OR logic
     */
    static combineWithOr(conditions: AccessControlConditions[]): AccessControlConditions {
        return conditions.map((condition, index) => ({
            ...condition,
            operator: index > 0 ? 'or' : undefined
        }));
    }

    /**
     * Get access control conditions based on type
     */
    static getConditions(
        type: AccessControlType | AccessControlType[],
        params: GroupAccessParams
    ): AccessControlConditions {
        const types = Array.isArray(type) ? type : [type];
        const conditions = types.map(t => {
            switch (t) {
                case 'member':
                    return this.forGroupMember(params);
                case 'creator':
                    return this.forGroupCreator(params);
                case 'contributor':
                    return this.forContributor(params);
                default:
                    throw new Error(`Unknown access control type: ${t}`);
            }
        });

        return this.combineWithOr(conditions);
    }
} 