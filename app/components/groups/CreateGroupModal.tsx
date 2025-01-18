"use client";

import { Dialog } from '@headlessui/react';
import { CreateGroupForm } from './CreateGroupForm';

interface CreateGroupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateGroupFormData) => void;
  isLoading?: boolean;
}

export function CreateGroupModal({ 
  isOpen, 
  onClose, 
  onSubmit, 
  isLoading 
}: CreateGroupModalProps) {
  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/70" aria-hidden="true" />
      
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="w-full max-w-md bg-gray-800 rounded-lg p-6 border border-gray-700">
          <Dialog.Title className="text-2xl font-bold text-center mb-6 text-white">
            Create New Savings Group
          </Dialog.Title>

          <CreateGroupForm onSubmit={onSubmit} isLoading={isLoading} />

          <button
            onClick={onClose}
            className="mt-4 w-full px-4 py-2 border border-gray-600 text-gray-300 
            rounded-lg hover:bg-gray-700 transition-colors"
          >
            Cancel
          </button>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
} 