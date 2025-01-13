import { forwardRef } from 'react';
import Image from 'next/image';
import { SUPPORTED_NETWORKS } from '@/lib/chain/networks';

interface NetworkSelectorProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
    error?: string;
}

export const NetworkSelector = forwardRef<HTMLSelectElement, NetworkSelectorProps>(
    ({ error, ...props }, ref) => {
        return (
            <div className="space-y-2">
                <label className="block text-sm font-medium">
                    Source Network
                </label>
                <div className="relative">
                    <select
                        ref={ref}
                        className={`
                            w-full px-3 py-2 bg-background border rounded-lg appearance-none
                            ${error ? 'border-red-500' : 'border-gray-200'}
                        `}
                        {...props}
                    >
                        <option value="">Select Network</option>
                        {SUPPORTED_NETWORKS.map(network => (
                            <option key={network.chainId} value={network.name}>
                                {network.name} USDC
                            </option>
                        ))}
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                        <svg className="w-4 h-4 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                            <path
                                fillRule="evenodd"
                                d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                                clipRule="evenodd"
                            />
                        </svg>
                    </div>
                </div>
                {error && (
                    <p className="text-sm text-red-500">{error}</p>
                )}
            </div>
        );
    }
);

NetworkSelector.displayName = 'NetworkSelector'; 