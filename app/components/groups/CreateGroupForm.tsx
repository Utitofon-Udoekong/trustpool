"use client";

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@burnt-labs/ui';

interface CreateGroupFormData {
  name: string;
  description?: string;
  contributionAmount: number;
  privacySettings: {
    membersVisible: boolean;
    amountsVisible: boolean;
  };
}

interface CreateGroupFormProps {
  onSubmit: (data: CreateGroupFormData) => void;
  isLoading?: boolean;
}

export function CreateGroupForm({ onSubmit, isLoading }: CreateGroupFormProps) {
  const { register, handleSubmit, formState: { errors } } = useForm<CreateGroupFormData>();

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="space-y-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-200">
            Group Name
          </label>
          <input
            {...register("name", { required: "Name is required" })}
            type="text"
            className="mt-1 block w-full rounded-lg bg-gray-800 border border-gray-700 
            text-white px-3 py-2 focus:border-purple-500 focus:ring-purple-500"
            placeholder="Enter group name"
          />
          {errors.name && (
            <p className="mt-1 text-sm text-red-500">{errors.name.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-200">
            Description
          </label>
          <textarea
            {...register("description")}
            rows={3}
            className="mt-1 block w-full rounded-lg bg-gray-800 border border-gray-700 
            text-white px-3 py-2 focus:border-purple-500 focus:ring-purple-500"
            placeholder="Describe your savings group"
          />
        </div>

        <div>
          <label htmlFor="contributionAmount" className="block text-sm font-medium text-gray-200">
            Contribution Amount (USDC)
          </label>
          <input
            {...register("contributionAmount", { 
              required: "Amount is required",
              min: { value: 1, message: "Amount must be at least 1" }
            })}
            type="number"
            className="mt-1 block w-full rounded-lg bg-gray-800 border border-gray-700 
            text-white px-3 py-2 focus:border-purple-500 focus:ring-purple-500"
            placeholder="0.00"
          />
          {errors.contributionAmount && (
            <p className="mt-1 text-sm text-red-500">{errors.contributionAmount.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-200 mb-2">
            Privacy Settings
          </label>
          <div className="space-y-2">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                {...register("privacySettings.membersVisible")}
                className="rounded bg-gray-800 border-gray-700 text-purple-500 
                focus:ring-purple-500"
              />
              <span className="text-sm text-gray-300">Show member list</span>
            </label>
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                {...register("privacySettings.amountsVisible")}
                className="rounded bg-gray-800 border-gray-700 text-purple-500 
                focus:ring-purple-500"
              />
              <span className="text-sm text-gray-300">Show contribution amounts</span>
            </label>
          </div>
        </div>
      </div>

      <Button
        type="submit"
        disabled={isLoading}
        structure="base"
        className="w-full px-4 py-2 bg-purple-500 text-white rounded-lg 
        hover:bg-purple-600 transition-colors disabled:opacity-50"
      >
        {isLoading ? 'Creating...' : 'Create Group'}
      </Button>
    </form>
  );
} 