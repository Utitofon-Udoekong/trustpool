"use client";

import { Dialog } from '@headlessui/react';
import { ContributeForm } from './ContributeForm';

interface ContributeModalProps {
    groupId: string;
    isOpen: boolean;
    onClose: () => void;
}

export function ContributeModal({ groupId, isOpen, onClose }: ContributeModalProps) {
    return (
        <Dialog open={isOpen} onClose={onClose} className="relative z-50">
            <div className="fixed inset-0 bg-black/50" aria-hidden="true" />
            
            <div className="fixed inset-0 flex items-center justify-center p-4">
                <Dialog.Panel className="w-full max-w-md bg-white rounded-lg p-6">
                    <Dialog.Title className="text-lg font-semibold mb-4">
                        Make a Contribution
                    </Dialog.Title>

                    <ContributeForm 
                        groupId={groupId}
                        onSuccess={onClose}
                    />
                </Dialog.Panel>
            </div>
        </Dialog>
    );
} 