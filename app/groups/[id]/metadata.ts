import type { Metadata } from "next";
import { GroupService } from '@/lib/chain/groupService';

export async function generateMetadata(
    { params }: { params: { id: string } }
): Promise<Metadata> {
    try {
        const group = await GroupService.queryGroup(null, params.id);

        return {
            title: group.name,
            description: group.description,
            openGraph: {
                title: `${group.name} | TrustPool`,
                description: group.description,
            },
        };
    } catch (error) {
        return {
            title: 'Savings Group',
            description: 'View group details, members, and contribution history.',
        };
    }
} 