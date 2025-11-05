'use client';

import React, { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useToast } from '@/components/ToastProvider';

interface PasswordChangeFormProps {
  onSuccess?: () => void;
}

interface FormState {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
  isLoading: boolean;
}

const PasswordChangeForm: React.FC<PasswordChangeFormProps> = ({ 
  onSuccess 
}) => {
  const [formState, setFormState] = useState<FormState>({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
    isLoading: false,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const { addToast } = useToast();

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formState.currentPassword.trim()) {
      newErrors.currentPassword = 'Current password is required';
    }

    if (!formState.newPassword.trim()) {
      newErrors.newPassword = 'New password is required';
    } else if (formState.newPassword.length < 6) {
      newErrors.newPassword = 'Password must be at least 6 characters long';
    }

    if (!formState.confirmPassword.trim()) {
      newErrors.confirmPassword = 'Please confirm your new password';
    } else if (formState.newPassword !== formState.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setFormState((prev) => ({ ...prev, isLoading: true }));
    setErrors({});

    try {
      const supabase = createClient();
      
      const { error } = await supabase.auth.updateUser({
        password: formState.newPassword,
      });

      if (error) {
        throw new Error(error.message);
      }

      // Show success toast
      addToast({
        type: 'success',
        title: 'Success!',
        message: 'Your password has been successfully changed.',
      });
      
      // Reset form
      setFormState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
        isLoading: false,
      });

      onSuccess?.();
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to change password';
      
      // Show error toast
      addToast({
        type: 'error',
        title: 'Error',
        message: errorMessage,
      });
      
      setErrors({ submit: errorMessage });
    } finally {
      setFormState((prev) => ({ ...prev, isLoading: false }));
    }
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    const { name, value } = event.target;
    setFormState((prev) => ({ ...prev, [name]: value }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Current Password
        </label>
        <input
          type="password"
          id="currentPassword"
          name="currentPassword"
          value={formState.currentPassword}
          onChange={handleInputChange}
          disabled={formState.isLoading}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 dark:bg-gray-800 dark:text-white"
          aria-describedby={errors.currentPassword ? 'currentPassword-error' : undefined}
        />
        {errors.currentPassword && (
          <p id="currentPassword-error" className="mt-1 text-sm text-red-600 dark:text-red-400">
            {errors.currentPassword}
          </p>
        )}
      </div>

      <div>
        <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          New Password
        </label>
        <input
          type="password"
          id="newPassword"
          name="newPassword"
          value={formState.newPassword}
          onChange={handleInputChange}
          disabled={formState.isLoading}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 dark:bg-gray-800 dark:text-white"
          aria-describedby={errors.newPassword ? 'newPassword-error' : undefined}
        />
        {errors.newPassword && (
          <p id="newPassword-error" className="mt-1 text-sm text-red-600 dark:text-red-400">
            {errors.newPassword}
          </p>
        )}
      </div>

      <div>
        <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Confirm New Password
        </label>
        <input
          type="password"
          id="confirmPassword"
          name="confirmPassword"
          value={formState.confirmPassword}
          onChange={handleInputChange}
          disabled={formState.isLoading}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 dark:bg-gray-800 dark:text-white"
          aria-describedby={errors.confirmPassword ? 'confirmPassword-error' : undefined}
        />
        {errors.confirmPassword && (
          <p id="confirmPassword-error" className="mt-1 text-sm text-red-600 dark:text-red-400">
            {errors.confirmPassword}
          </p>
        )}
      </div>

      {errors.submit && (
        <div className="rounded-md bg-red-50 dark:bg-red-900/50 p-4 border border-red-200 dark:border-red-800">
          <p className="text-sm text-red-800 dark:text-red-200">{errors.submit}</p>
        </div>
      )}

      <button
        type="submit"
        disabled={formState.isLoading}
        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-blue-700 dark:hover:bg-blue-800"
      >
        {formState.isLoading ? 'Changing Password...' : 'Change Password'}
      </button>
    </form>
  );
};

export default PasswordChangeForm;