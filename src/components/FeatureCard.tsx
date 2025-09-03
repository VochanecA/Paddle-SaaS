import React from 'react';

export interface FeatureCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
}

export function FeatureCard({ title, description, icon }: FeatureCardProps) {
  return (
    <div className="relative p-6 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 transition-all duration-300 hover:shadow-2xl h-full overflow-hidden group">
      {/* Background gradients/blobs, similar to Hero section */}
      <div className="absolute inset-0 z-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
        <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl blur opacity-30 dark:opacity-20"></div>
      </div>
      
      {/* Card content */}
      <div className="relative z-10 flex flex-col items-center text-center">
        <div className="mb-4">
          <div className="p-3 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400">
            {icon}
          </div>
        </div>
        <h3 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">{title}</h3>
        <p className="text-gray-600 dark:text-gray-300">{description}</p>
      </div>
    </div>
  );
}