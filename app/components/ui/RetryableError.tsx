interface RetryableErrorProps {
    message: string;
    onRetry: () => void;
}

export function RetryableError({ message, onRetry }: RetryableErrorProps) {
    return (
        <div className="flex flex-col items-center justify-center p-8 text-center">
            <div className="mb-4">
                <svg className="h-12 w-12 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
            </div>
            <h3 className="text-lg font-medium mb-2">Something went wrong</h3>
            <p className="text-sm text-gray-600 mb-4">{message}</p>
            <button
                onClick={onRetry}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
            >
                Try Again
            </button>
        </div>
    );
} 