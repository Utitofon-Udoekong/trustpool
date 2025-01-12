import Link from 'next/link';

export default function NotFound() {
    return (
        <div className="container mx-auto px-4 py-8 text-center">
            <h2 className="text-2xl font-bold mb-4">Page Not Found</h2>
            <p className="mb-4">Could not find requested resource</p>
            <Link 
                href="/"
                className="text-blue-500 hover:text-blue-700"
            >
                Return Home
            </Link>
        </div>
    );
} 