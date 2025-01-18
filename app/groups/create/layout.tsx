export default function CreateGroupLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="bg-gray-900 min-h-screen">
            <div className="container mx-auto px-4 py-8">
                <div className="max-w-4xl mx-auto bg-gray-800 rounded-lg shadow-lg border border-gray-700">
                    {children}
                </div>
            </div>
        </div>
    );
} 