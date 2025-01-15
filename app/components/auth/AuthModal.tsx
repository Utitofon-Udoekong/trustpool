"use client";

import { Dialog, DialogPanel, DialogTitle } from '@headlessui/react';
import {
  Abstraxion,
  useAbstraxionAccount,
  useModal
} from "@burnt-labs/abstraxion";
import { Button } from "@burnt-labs/ui";

interface AuthModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function AuthModal({ isOpen, onClose }: AuthModalProps) {
    const { data: { bech32Address }, isConnected } = useAbstraxionAccount();
    const [, setShow] = useModal();

    if (isConnected && bech32Address) {
        onClose();
        return null;
    }

    return (
        <Dialog open={isOpen} onClose={onClose} className="relative z-50">
            <div className="fixed inset-0 bg-black/70" aria-hidden="true" />
            
            <div className="fixed inset-0 flex items-center justify-center p-4">
                <DialogPanel className="w-full max-w-md bg-gray-800 rounded-lg p-6 border border-gray-700">
                    <DialogTitle className="text-2xl font-bold text-center mb-6 text-white">
                        Welcome to TrustPool
                    </DialogTitle>

                    <p className="text-center text-gray-300 mb-8">
                        Connect your wallet to get started
                    </p>

                    <div className="space-y-4">
                        <Button
                            fullWidth
                            onClick={() => setShow(true)}
                            structure="base"
                            className="w-full px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
                        >
                            Connect Wallet
                        </Button>

                        <button
                            onClick={onClose}
                            className="w-full px-4 py-2 border border-gray-600 text-gray-300 rounded-lg hover:bg-gray-700 transition-colors"
                        >
                            Cancel
                        </button>
                    </div>

                    <Abstraxion onClose={() => {
                        setShow(false);
                        if (isConnected) {
                            onClose();
                        }
                    }} />
                </DialogPanel>
            </div>
        </Dialog>
    );
} 