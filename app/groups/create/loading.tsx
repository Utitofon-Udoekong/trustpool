export default function CreateGroupLoading() {
    return (
        <div className="container mx-auto px-4 py-8">
            <div className="max-w-4xl mx-auto">
                <div className="flex items-center gap-4 mb-8">
                    <div className="h-6 w-24 bg-gray-200 rounded animate-pulse" />
                    <div className="h-8 w-48 bg-gray-200 rounded animate-pulse" />
                </div>

                <div className="bg-card rounded-lg p-6">
                    <div className="space-y-6">
                        {[1, 2, 3, 4].map((i) => (
                            <div key={i}>
                                <div className="h-4 w-24 bg-gray-200 rounded animate-pulse mb-2" />
                                <div className="h-10 bg-gray-200 rounded animate-pulse" />
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
} 