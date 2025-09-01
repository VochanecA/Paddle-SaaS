// src/components/FeatureCard.jsx
import React from 'react';

// Define the props interface for the FeatureCard component
interface FeatureCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
}

/**
 * A reusable card component to display a feature with an icon, title, and description.
 * It is styled to be theme-aware with Tailwind CSS classes.
 */
export const FeatureCard: React.FC<FeatureCardProps> = ({ title, description, icon }) => {
  return (
    <div className="bg-white dark:bg-red-500 p-6 rounded-3xl shadow-lg border border-gray-300 dark:border-gray-700 transition-transform transform hover:scale-105 duration-300">
      <div className="mb-4">
        {/* The icon is passed as a prop and rendered directly */}
        {icon}
      </div>
      <h3 className="text-xl font-semibold text-foreground dark:text-foreground mb-2">
        {title}
      </h3>
      <p className="text-gray-600 dark:text-gray-300">
        {description}
      </p>
    </div>
  );
};
