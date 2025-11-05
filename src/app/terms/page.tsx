'use client';

import { useState, useEffect } from 'react';
import { useTheme } from 'next-themes';
import { FileText, Shield, Scale, AlertCircle, Clock, UserCheck } from 'lucide-react';

const sections = [
  {
    id: 'acceptance',
    title: 'Acceptance of Terms',
    description: 'By accessing or using our web application (the "Service"), you agree to be bound by these Terms of Service ("Terms"). If you do not agree, you must not use the Service.',
    icon: FileText,
    details: [
      'These Terms form a binding legal agreement between you and the Service provider.',
      'We reserve the right to modify these Terms at any time. Continued use constitutes acceptance of changes.',
      'You must be at least 18 years old or have legal capacity to enter into these Terms.'
    ]
  },
  {
    id: 'user-responsibilities',
    title: 'User Responsibilities',
    description: 'You are responsible for maintaining the confidentiality of your account and for all activities under your account.',
    icon: UserCheck,
    details: [
      'Provide accurate information and update it as necessary.',
      'Use the Service only for lawful purposes and in compliance with all applicable laws.',
      'Do not attempt to reverse engineer, decompile, or disrupt the Service in any way.',
      'You indemnify us against any claims arising from your use of the Service.'
    ]
  },
  {
    id: 'intellectual-property',
    title: 'Intellectual Property Rights',
    description: 'All rights, title, and interest in the Service, including software, design, and content, are owned exclusively by the provider.',
    icon: Shield,
    details: [
      'You are granted a limited, non-exclusive, revocable license to use the Service for personal or internal business purposes.',
      'No ownership rights are transferred; all IP remains with the provider.',
      'Any feedback you provide becomes our property without compensation.',
      'Unauthorized use, copying, or distribution of IP is strictly prohibited and may result in legal action.'
    ]
  },
  {
    id: 'limitations-of-liability',
    title: 'Limitations of Liability',
    description: 'To the maximum extent permitted by law, the provider shall not be liable for any indirect, incidental, or consequential damages.',
    icon: Scale,
    details: [
      'Our total liability shall not exceed the amount you paid us in the past 12 months.',
      'The Service is provided "as is" without warranties of any kind, express or implied.',
      'We are not liable for data loss, interruptions, or third-party content.',
      'You assume all risks associated with using the Service.'
    ]
  },
  {
    id: 'termination',
    title: 'Termination and Suspension',
    description: 'We may suspend or terminate your access to the Service at our sole discretion.',
    icon: AlertCircle,
    details: [
      'Immediate termination for violations of these Terms or illegal activities.',
      'Upon termination, your right to use the Service ends immediately; we retain your data as per our Privacy Policy.',
      'No refunds for prepaid services upon termination.',
      'Survival: Sections on IP, liability, and indemnification survive termination.'
    ]
  },
  {
    id: 'governing-law',
    title: 'Governing Law and Dispute Resolution',
    description: 'These Terms are governed by the laws of [Your Jurisdiction, e.g., Delaware, USA], without regard to conflict of laws principles.',
    icon: Clock,
    details: [
      'Any disputes shall be resolved exclusively in the courts of [Your Jurisdiction].',
      'You waive any right to class actions or jury trials.',
      'Prevailing party entitled to recover attorneys\' fees and costs.',
      'These Terms constitute the entire agreement between the parties.'
    ]
  }
];

export default function TermsPage() {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  const isLight = resolvedTheme === 'light';

  return (
    <div className={`min-h-screen py-12 transition-colors duration-300 ${isLight ? 'bg-white' : 'bg-gradient-to-b from-gray-900 to-gray-800'}`}>
      <div className="max-w-4xl mx-auto px-4">
        {/* Header Section */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 dark:bg-blue-900/30 mb-4">
            <FileText className="w-8 h-8 text-blue-600 dark:text-blue-400" />
          </div>
          <h1 className="text-4xl font-bold mb-4 transition-colors duration-300 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">
            Terms of Service
          </h1>
          <p className={`text-xl max-w-2xl mx-auto transition-colors duration-300 ${isLight ? 'text-gray-700' : 'text-gray-300'}`}>
            Please read these Terms carefully. They protect both you and the provider of this Service.
          </p>
          <p className={`text-sm mt-2 transition-colors duration-300 ${isLight ? 'text-gray-500' : 'text-gray-400'}`}>
            Last updated: September 11, 2025
          </p>
        </div>

        {/* Sections Grid */}
        <div className="space-y-8 mb-16">
          {sections.map((section) => {
            const IconComponent = section.icon;
            return (
              <div
                key={section.id}
                className={`rounded-2xl p-6 transition-all duration-300 hover:scale-105 ${
                  isLight
                    ? 'bg-white border border-gray-200 shadow-md hover:shadow-lg'
                    : 'bg-gray-800 border border-gray-700 shadow-lg hover:shadow-xl'
                }`}
              >
                <div className="flex items-start mb-4">
                  <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5">
                    <IconComponent size={20} />
                  </div>
                  <div className="ml-3">
                    <h3 className={`text-xl font-semibold transition-colors duration-300 ${isLight ? 'text-gray-900' : 'text-white'}`}>
                      {section.title}
                    </h3>
                    <p className={`mt-1 transition-colors duration-300 ${isLight ? 'text-gray-600' : 'text-gray-400'}`}>
                      {section.description}
                    </p>
                  </div>
                </div>
                <ul className="space-y-2 ml-8">
                  {section.details.map((detail, i) => (
                    <li key={i} className={`flex items-start transition-colors duration-300 ${isLight ? 'text-gray-700' : 'text-gray-300'}`}>
                      <span className="text-sm mr-2 flex-shrink-0">•</span>
                      <span className="text-sm">{detail}</span>
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
            Have Questions?
          </h2>
          <p className={`mb-6 max-w-2xl mx-auto transition-colors duration-300 ${isLight ? 'text-gray-700' : 'text-gray-300'}`}>
            If anything is unclear, reach out to our support team for clarification.
          </p>
          <button className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors">
            Contact Support
          </button>
        </div>
      </div>
    </div>
  );
}