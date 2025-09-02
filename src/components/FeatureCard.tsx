// src/components/FeatureCard.tsx
import React from 'react';
import { 
  Zap, 
  Shield, 
  Code, 
  Database, 
  Cloud, 
  Users,
  CreditCard,
  Lock,
  BarChart3,
  Globe,
  MessageSquare,
  Settings,
  LucideIcon
} from 'lucide-react';

// Define the props interface for the FeatureCard component
interface FeatureCardProps {
  title: string;
  description: string;
  iconName: IconName;
}

// Define specific icon names as a union type
type IconName = 
  | 'zap' 
  | 'shield' 
  | 'code' 
  | 'database' 
  | 'cloud' 
  | 'users'
  | 'credit-card'
  | 'lock'
  | 'bar-chart'
  | 'globe'
  | 'message-square'
  | 'settings';

// Icon mapping with proper typing
const iconMap: Record<IconName, LucideIcon> = {
  'zap': Zap,
  'shield': Shield,
  'code': Code,
  'database': Database,
  'cloud': Cloud,
  'users': Users,
  'credit-card': CreditCard,
  'lock': Lock,
  'bar-chart': BarChart3,
  'globe': Globe,
  'message-square': MessageSquare,
  'settings': Settings
};

/**
 * A reusable card component to display a feature with an icon, title, and description.
 * It is styled to be theme-aware with Tailwind CSS classes with blueish accents.
 */
export const FeatureCard: React.FC<FeatureCardProps> = ({ title, description, iconName }) => {
  const IconComponent = iconMap[iconName] || Zap;
  
  return (
    <div className="bg-background-alt p-6 rounded-3xl shadow-lg border border-foreground/10 hover:border-accent/30 transition-all duration-300 hover:shadow-xl">
      <div className="mb-4 p-3 bg-accent/10 rounded-2xl inline-flex">
        <IconComponent className="w-8 h-8 text-accent" />
      </div>
      <h3 className="text-xl font-semibold text-foreground mb-2">
        {title}
      </h3>
      <p className="text-foreground/70">
        {description}
      </p>
    </div>
  );
};

// Define feature type for the grid
interface FeatureItem {
  title: string;
  description: string;
  iconName: IconName;
}

// Example usage component (optional - you can remove this if you don't need it)
export const FeaturesGrid: React.FC = () => {
  const features: FeatureItem[] = [
    {
      title: "Blazing Fast",
      description: "Built with performance in mind using the latest technologies and optimizations.",
      iconName: "zap",
    },
    {
      title: "Secure Authentication",
      description: "Enterprise-grade security with OAuth, 2FA, and secure session management.",
      iconName: "shield",
    },
    {
      title: "Clean Code",
      description: "Well-structured, maintainable codebase with TypeScript and modern patterns.",
      iconName: "code",
    },
    {
      title: "Scalable Database",
      description: "Ready for scale with optimized database queries and connection pooling.",
      iconName: "database",
    },
    {
      title: "Cloud Ready",
      description: "Deploy anywhere with Docker and cloud-native architecture built-in.",
      iconName: "cloud",
    },
    {
      title: "Team Collaboration",
      description: "Built-in support for teams, roles, and collaborative features.",
      iconName: "users",
    },
    {
      title: "Payment Processing",
      description: "Integrated Stripe payments with subscription management.",
      iconName: "credit-card",
    },
    {
      title: "Data Protection",
      description: "GDPR compliant with end-to-end encryption and data privacy.",
      iconName: "lock",
    },
    {
      title: "Analytics Dashboard",
      description: "Comprehensive analytics to track your product's performance.",
      iconName: "bar-chart",
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {features.map((feature, index) => (
        <FeatureCard
          key={index}
          title={feature.title}
          description={feature.description}
          iconName={feature.iconName}
        />
      ))}
    </div>
  );
};

// Available icon names for reference
export const availableIcons: IconName[] = Object.keys(iconMap) as IconName[];