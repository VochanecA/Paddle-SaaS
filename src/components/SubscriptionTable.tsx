'use client';

import { FC, useState, useMemo } from 'react';
import { CheckCircle, XCircle } from 'lucide-react';

interface SubscriptionTableProps {
  subscriptions: Array<{
    id: string;
    cancel_subscription?: string;
    update_subscription_payment_method?: string;
    status?: string;
    plan_name?: string;
    price?: string;
  }>;
  rowsPerPage?: number;
}

export const SubscriptionTable: FC<SubscriptionTableProps> = ({
  subscriptions,
  rowsPerPage = 5,
}) => {
  const [currentPage, setCurrentPage] = useState(1);

  // Always sort active subscriptions first
  const sortedSubscriptions = useMemo(() => {
    return [...subscriptions].sort((a, b) => {
      const aActive = a.status === 'active' ? 1 : 0;
      const bActive = b.status === 'active' ? 1 : 0;
      return bActive - aActive; // active first
    });
  }, [subscriptions]);

  // Pagination
  const totalPages = Math.ceil(sortedSubscriptions.length / rowsPerPage);
  const paginatedData = sortedSubscriptions.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  if (!subscriptions || subscriptions.length === 0) {
    return (
      <p className="mt-4 text-sm text-gray-600 dark:text-gray-400">
        No subscriptions found for this account.
      </p>
    );
  }

  return (
    <div className="mt-6">
      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700 border border-gray-200 dark:border-gray-700 rounded-lg">
          <thead className="bg-gray-50 dark:bg-gray-800">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-600 dark:text-gray-300">
                Subscription ID
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-600 dark:text-gray-300">
                Plan
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-600 dark:text-gray-300">
                Price
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-600 dark:text-gray-300">
                Status
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-600 dark:text-gray-300">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
            {paginatedData.map((sub) => {
              const isActive = sub.status === 'active';

              return (
                <tr key={sub.id}>
                  {/* Subscription ID */}
                  <td className="px-4 py-3 text-sm font-mono text-gray-900 dark:text-white">
                    {sub.id}
                  </td>

                  {/* Plan */}
                  <td className="px-4 py-3 text-sm text-gray-800 dark:text-gray-300">
                    {sub.plan_name || 'N/A'}
                  </td>

                  {/* Price */}
                  <td className="px-4 py-3 text-sm text-gray-800 dark:text-gray-300">
                    {sub.price || '—'}
                  </td>

                  {/* Status */}
                  <td className="px-4 py-3">
                    {isActive ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Active
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300">
                        <XCircle className="h-4 w-4 mr-1" />
                        Inactive
                      </span>
                    )}
                  </td>

                  {/* Actions */}
                  <td className="px-4 py-3 text-sm">
                    <div className="flex items-center gap-3">
                      {sub.cancel_subscription && (
                        <a
                          href={sub.cancel_subscription}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 text-sm font-medium"
                        >
                          Cancel
                        </a>
                      )}
                      {sub.update_subscription_payment_method && (
                        <a
                          href={sub.update_subscription_payment_method}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 text-sm font-medium"
                        >
                          Update Payment
                        </a>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex justify-between items-center mt-4">
          <button
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            className={`px-3 py-1 rounded-md text-sm font-medium ${
              currentPage === 1
                ? 'text-gray-400 cursor-not-allowed'
                : 'text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300'
            }`}
          >
            Previous
          </button>
          <span className="text-sm text-gray-700 dark:text-gray-300">
            Page {currentPage} of {totalPages}
          </span>
          <button
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            className={`px-3 py-1 rounded-md text-sm font-medium ${
              currentPage === totalPages
                ? 'text-gray-400 cursor-not-allowed'
                : 'text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300'
            }`}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};
