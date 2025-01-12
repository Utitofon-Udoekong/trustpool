export default function TransactionsLoading() {
    return (
        <div className="container mx-auto px-4 py-8">
            <div className="max-w-4xl mx-auto">
                <div className="flex items-center gap-4 mb-8">
                    <div className="h-6 w-24 bg-gray-200 rounded animate-pulse" />
                    <div className="h-8 w-48 bg-gray-200 rounded animate-pulse" />
                </div>

                <div className="bg-card rounded-lg p-6">
                    <div className="flex justify-between items-center mb-6">
                        <div className="flex gap-4">
                            {[1, 2, 3].map((i) => (
                                <div 
                                    key={i}
                                    className="h-10 w-32 bg-gray-200 rounded animate-pulse"
                                />
                            ))}
                        </div>
                    </div>

                    <div className="space-y-4">
                        {[1, 2, 3, 4, 5].map((i) => (
                            <div 
                                key={i}
                                className="h-20 bg-gray-200 rounded animate-pulse"
                            />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
} 