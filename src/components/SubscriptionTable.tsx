'use client';

import React, { FC, useEffect, useMemo, useState } from 'react';
import { CheckCircle, XCircle, ChevronDown, ChevronRight } from 'lucide-react';

type Subscription = {
  id: string;
  cancel_subscription?: string;
  update_subscription_payment_method?: string;
  status?: string;
  plan_name?: string;
  price?: string;
};

interface SubscriptionTableProps {
  subscriptions?: Subscription[];
  rowsPerPage?: number;
}

export const SubscriptionTable: FC<SubscriptionTableProps> = ({
  subscriptions = [],
  rowsPerPage = 5,
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [isOpen, setIsOpen] = useState(false); // Hide as per default
  // Reset page when data changes
  useEffect(() => {
    setCurrentPage(1);
  }, [subscriptions, rowsPerPage]);

  // Sort active subs first
  const sortedSubscriptions = useMemo(() => {
    return [...subscriptions].sort((a, b) => {
      const aActive = a.status === 'active' ? 1 : 0;
      const bActive = b.status === 'active' ? 1 : 0;
      return bActive - aActive;
    });
  }, [subscriptions]);

  const totalPages = Math.max(1, Math.ceil(sortedSubscriptions.length / rowsPerPage));
  const paginatedData = sortedSubscriptions.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  return (
    <div className="mt-6 w-full">
      {/* Collapsible Card */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm">
        {/* Header */}
        <button
          type="button"
          onClick={() => setIsOpen((prev) => !prev)}
          className="w-full flex justify-between items-center px-4 py-3 text-left"
        >
          <span className="text-base font-medium text-gray-900 dark:text-white">
            Subscriptions
          </span>
          {isOpen ? (
            <ChevronDown className="h-5 w-5 text-gray-500" />
          ) : (
            <ChevronRight className="h-5 w-5 text-gray-500" />
          )}
        </button>

        {/* Content */}
        {isOpen && (
          <div className="px-4 pb-4">
            {subscriptions.length === 0 ? (
              <p className="text-sm text-gray-600 dark:text-gray-400">
                No subscriptions found.
              </p>
            ) : (
              <>
                {/* -------------------------
                    Desktop Table (≥ md)
                ------------------------- */}
                <div className="hidden md:block w-full overflow-x-auto">
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
                            <td className="px-4 py-3 text-sm font-mono text-gray-900 dark:text-white break-all">
                              {sub.id}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-800 dark:text-gray-300">
                              {sub.plan_name ?? 'N/A'}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-800 dark:text-gray-300">
                              {sub.price ?? '—'}
                            </td>
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
                            <td className="px-4 py-3 text-sm">
                              <div className="flex flex-wrap gap-3">
                                {sub.cancel_subscription && (
                                  <a
                                    href={sub.cancel_subscription}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 font-medium"
                                  >
                                    Cancel
                                  </a>
                                )}
                                {sub.update_subscription_payment_method && (
                                  <a
                                    href={sub.update_subscription_payment_method}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 font-medium"
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

                {/* -------------------------
                    Mobile Cards (< md)
                ------------------------- */}
                <div className="block md:hidden space-y-4">
                  {paginatedData.map((sub) => {
                    const isActive = sub.status === 'active';
                    return (
                      <article
                        key={sub.id}
                        className="w-full bg-white dark:bg-gray-900 rounded-lg shadow-sm p-4 border border-gray-200 dark:border-gray-700"
                        aria-labelledby={`sub-${sub.id}`}
                      >
                        <div className="flex items-start justify-between mb-3 gap-x-2">
                          <h4
                            id={`sub-${sub.id}`}
                            className="font-mono text-sm text-gray-900 dark:text-white break-all"
                          >
                            {sub.id}
                          </h4>
                          {isActive ? (
                            <span className="inline-flex items-center px-2.5 py-0.5 mt-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
                              <CheckCircle className="h-4 w-4 mr-1" />
                              Active
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2.5 py-0.5 mt-1 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300">
                              <XCircle className="h-4 w-4 mr-1" />
                              Inactive
                            </span>
                          )}
                        </div>
                        <dl className="text-sm text-gray-700 dark:text-gray-300">
                          <div className="mb-1">
                            <dt className="font-medium inline">Plan:</dt>{' '}
                            <dd className="inline">{sub.plan_name ?? 'N/A'}</dd>
                          </div>
                          <div className="mb-2">
                            <dt className="font-medium inline">Price:</dt>{' '}
                            <dd className="inline">{sub.price ?? '—'}</dd>
                          </div>
                        </dl>
                        <div className="flex flex-wrap gap-3 mt-3">
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
                      </article>
                    );
                  })}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex justify-between items-center mt-4">
                    <button
                      type="button"
                      aria-disabled={currentPage === 1}
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
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
                      type="button"
                      aria-disabled={currentPage === totalPages}
                      onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
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
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
