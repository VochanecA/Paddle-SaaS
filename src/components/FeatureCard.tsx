// ./src/components/FeatureCard.tsx
import React from 'react';

export interface FeatureCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
}

export function FeatureCard({ title, description, icon }: FeatureCardProps) {
  return (
    <div className="bg-card text-card-foreground p-6 rounded-lg shadow-lg border border-border transition-all hover:shadow-xl h-full">
      <div className="mb-4 flex justify-center">
        {icon}
      </div>
      <h3 className="text-xl font-semibold mb-2 text-center">{title}</h3>
      <p className="text-muted-foreground text-center">{description}</p>
    </div>
  );
}