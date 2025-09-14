'use client';

import { useState, useEffect } from 'react';
import { useTheme } from 'next-themes';
import { CheckCircle, Zap, Shield, BarChart3, Code, Globe, Users, Database, Lock, Cloud, Bell, Workflow } from 'lucide-react';

const features = [
  {
    title: 'Lightning Fast Performance!',
    description: 'Our optimized architecture delivers sub-second response times even at scale.',
    icon: Zap,
    highlights: ['Edge caching', 'CDN integration', 'Optimized queries']
  },
  {
    title: 'Enterprise-grade Security',
    description: 'Protect your data with bank-level security measures and compliance certifications.',
    icon: Shield,
    highlights: ['SOC 2 compliant', 'End-to-end encryption', 'Regular security audits']
  },
  {
    title: 'Advanced Analytics',
    description: 'Gain deep insights with customizable dashboards and real-time reporting.',
    icon: BarChart3,
    highlights: ['Custom metrics', 'Export capabilities', 'Real-time data']
  },
  {
    title: 'Developer Friendly',
    description: 'Comprehensive API and SDKs for seamless integration with your stack.',
    icon: Code,
    highlights: ['REST & GraphQL APIs', 'Webhooks', 'Extensive documentation']
  },
  {
    title: 'Global Infrastructure',
    description: 'Deploy anywhere with our worldwide network of data centers.',
    icon: Globe,
    highlights: ['Multi-region support', '99.9% uptime SLA', 'Auto-scaling']
  },
  {
    title: 'Team Collaboration',
    description: 'Work together efficiently with role-based access and sharing controls.',
    icon: Users,
    highlights: ['Role-based permissions', 'Shared workspaces', 'Comment threads']
  },
  {
    title: 'Unlimited Storage',
    description: 'Store as much data as you need without worrying about limits.',
    icon: Database,
    highlights: ['Scalable storage', 'Automatic backups', 'Data retention policies']
  },
  {
    title: 'Advanced Access Controls',
    description: 'Fine-grained permissions to control exactly who can see and do what.',
    icon: Lock,
    highlights: ['Custom roles', '2FA enforcement', 'SSO integration']
  },
  {
    title: 'Cloud Native',
    description: 'Built for the cloud with containerized architecture and microservices.',
    icon: Cloud,
    highlights: ['Kubernetes native', 'Disaster recovery', 'Zero-downtime updates']
  },
  {
    title: 'Smart Notifications',
    description: 'Get alerted about what matters with customizable notification rules.',
    icon: Bell,
    highlights: ['Custom alerts', 'Multi-channel delivery', 'Do not disturb']
  },
  {
    title: 'Automated Workflows',
    description: 'Streamline processes with powerful automation and workflow tools.',
    icon: Workflow,
    highlights: ['Visual workflow builder', 'Custom triggers', 'API integrations']
  }
];

const categories = [
  { id: 'all', name: 'All Features' },
  { id: 'performance', name: 'Performance' },
  { id: 'security', name: 'Security' },
  { id: 'collaboration', name: 'Collaboration' },
  { id: 'development', name: 'Development' }
];

export default function FeaturesPage() {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [activeCategory, setActiveCategory] = useState('all');

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null; 
  }

  const isLight = resolvedTheme === 'light';

  return (
    <div className={`min-h-screen py-12 transition-colors duration-300 ${isLight ? 'bg-white' : 'bg-gradient-to-b from-gray-900 to-gray-800'}`}>
      <div className="max-w-6xl mx-auto px-4">
        {/* Header Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4 transition-colors duration-300 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">
            Powerful Features
          </h1>
          <p className={`text-xl max-w-2xl mx-auto transition-colors duration-300 ${isLight ? 'text-gray-700' : 'text-gray-300'}`}>
            Everything you need to streamline your workflow, boost productivity, and scale your business.
          </p>
        </div>

        {/* Category Filters */}
        <div className="flex flex-wrap justify-center gap-4 mb-12">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setActiveCategory(category.id)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                activeCategory === category.id
                  ? 'bg-blue-600 text-white'
                  : isLight
                  ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
              }`}
            >
              {category.name}
            </button>
          ))}
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {features.map((feature, index) => {
            const IconComponent = feature.icon;
            return (
              <div
                key={index}
                className={`rounded-2xl p-6 transition-all duration-300 hover:scale-105 ${
                  isLight
                    ? 'bg-white border border-gray-200 shadow-md hover:shadow-lg'
                    : 'bg-gray-800 border border-gray-700 shadow-lg hover:shadow-xl'
                }`}
              >
                <div className="flex items-center mb-4">
                  <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
                    <IconComponent size={24} />
                  </div>
                  <h3 className={`text-xl font-semibold ml-3 transition-colors duration-300 ${isLight ? 'text-gray-900' : 'text-white'}`}>
                    {feature.title}
                  </h3>
                </div>
                <p className={`mb-4 transition-colors duration-300 ${isLight ? 'text-gray-600' : 'text-gray-400'}`}>
                  {feature.description}
                </p>
                <ul className="space-y-2">
                  {feature.highlights.map((highlight, i) => (
                    <li key={i} className="flex items-start">
                      <CheckCircle size={16} className="text-green-500 mt-0.5 mr-2 flex-shrink-0" />
                      <span className={`text-sm transition-colors duration-300 ${isLight ? 'text-gray-700' : 'text-gray-300'}`}>
                        {highlight}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>

        {/* CTA Section */}
        <div className={`rounded-2xl p-8 text-center transition-colors duration-300 ${isLight ? 'bg-gradient-to-r from-blue-50 to-purple-50' : 'bg-gradient-to-r from-blue-900/30 to-purple-900/30'}`}>
          <h2 className="text-2xl font-bold mb-4 transition-colors duration-300 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">
            Ready to get started?
          </h2>
          <p className={`mb-6 max-w-2xl mx-auto transition-colors duration-300 ${isLight ? 'text-gray-700' : 'text-gray-300'}`}>
            Join thousands of teams that are using our platform to transform their workflow and boost productivity.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors">
              Start Free Trial
            </button>
            <button className={`px-6 py-3 rounded-lg font-medium border transition-colors ${
              isLight 
                ? 'border-gray-300 text-gray-700 hover:bg-gray-50' 
                : 'border-gray-600 text-gray-300 hover:bg-gray-800'
            }`}>
              Schedule a Demo
            </button>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mt-16">
          <h2 className="text-2xl font-bold text-center mb-8 transition-colors duration-300 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">
            Frequently Asked Questions
          </h2>
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <div>
              <h3 className="font-semibold text-lg mb-2 transition-colors duration-300 text-gray-900 dark:text-white">
                How easy is it to migrate my data?
              </h3>
              <p className="text-gray-600 dark:text-gray-300 transition-colors duration-300">
                We provide comprehensive migration tools and support to make your transition seamless. Most customers complete migration in under 48 hours.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-2 transition-colors duration-300 text-gray-900 dark:text-white">
                Can I customize the platform for my needs?
              </h3>
              <p className="text-gray-600 dark:text-gray-300 transition-colors duration-300">
                Yes, our platform offers extensive customization options through our API, white-labeling, and custom workflow capabilities.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-2 transition-colors duration-300 text-gray-900 dark:text-white">
                What kind of support do you offer?
              </h3>
              <p className="text-gray-600 dark:text-gray-300 transition-colors duration-300">
                All plans include email support with 24-hour response time. Higher tiers include priority support, dedicated account management, and 24/7 phone support.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-2 transition-colors duration-300 text-gray-900 dark:text-white">
                Do you offer on-premise deployment?
              </h3>
              <p className="text-gray-600 dark:text-gray-300 transition-colors duration-300">
                Yes, we offer on-premise deployment options for Enterprise customers with specific security or compliance requirements.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}