import { forwardRef } from 'react';

interface AmountInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    error?: string;
    network?: string;
}

export const AmountInput = forwardRef<HTMLInputElement, AmountInputProps>(
    ({ error, network, ...props }, ref) => {
        return (
            <div className="space-y-2">
                <div className="flex justify-between items-center">
                    <label className="block text-sm font-medium">
                        Amount
                    </label>
                </div>
                <div className="relative">
                    <input
                        ref={ref}
                        type="number"
                        step="0.01"
                        min="0"
                        className={`
                            w-full px-3 py-2 bg-background border rounded-lg
                            ${error ? 'border-red-500' : 'border-gray-200'}
                        `}
                        {...props}
                    />
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                        <span className="text-gray-500">USDC</span>
                    </div>
                </div>
                {error && (
                    <p className="text-sm text-red-500">{error}</p>
                )}
            </div>
        );
    }
);

AmountInput.displayName = 'AmountInput'; 