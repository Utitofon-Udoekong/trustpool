import type { Metadata } from "next";
import { GroupService } from '@/lib/chain/groupService';

export async function generateMetadata(
    { params }: { params: { id: string } }
): Promise<Metadata> {
    try {
        const group = await GroupService.queryGroup(null, params.id);

        return {
            title: `Transactions - ${group.name}`,
            description: `View transaction history and contribution records for ${group.name}.`,
            openGraph: {
                title: `Transactions - ${group.name} | TrustPool`,
                description: `View transaction history and contribution records for ${group.name}.`,
            },
        };
    } catch (error) {
        return {
            title: 'Group Transactions',
            description: 'View group transaction history and contribution records.',
        };
    }
} 