import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

export default function GroupDetailsLoading() {
    return (
        <div className="container mx-auto px-4 py-8">
            <div className="max-w-4xl mx-auto">
                <div className="h-8 w-48 bg-gray-200 rounded animate-pulse mb-8" />
                <div className="space-y-4">
                    <div className="h-32 bg-gray-200 rounded animate-pulse" />
                    <div className="h-64 bg-gray-200 rounded animate-pulse" />
                    <div className="h-48 bg-gray-200 rounded animate-pulse" />
                </div>
            </div>
        </div>
    );
} 