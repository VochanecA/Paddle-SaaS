'use client';

import { useState, useEffect } from 'react';
import { useTheme } from 'next-themes';
import { Shield, Lock, EyeOff, Database, Cookie, Server } from 'lucide-react';

const privacySections = [
  {
    title: 'Information We Collect',
    icon: Database,
    content: `We collect information you provide directly to us, such as when you create an account, update your profile, or contact us for support. This may include:
    - Personal identification information (name, email address, etc.)
    - Account credentials and preferences
    - Content you create, upload, or share through our services
    - Communications with us
    
    We automatically collect certain information about your device and usage of our services through cookies and similar technologies.`
  },
  {
    title: 'How We Use Your Information',
    icon: Server,
    content: `We use the information we collect to:
    - Provide, maintain, and improve our services
    - Develop new products, features, and functionality
    - Communicate with you about products, services, offers, and events
    - Monitor and analyze trends, usage, and activities
    - Detect, investigate, and prevent security incidents and other malicious, deceptive, or illegal activity
    - Protect the rights and property of [Your Company Name] and others`
  },
  {
    title: 'Information Sharing',
    icon: Shield,
    content: `We do not sell your personal information. We may share your information in the following circumstances:
    - With service providers who need access to such information to carry out work on our behalf
    - In response to a request for information if we believe disclosure is required by law
    - In connection with, or during negotiations of, any merger, sale of company assets, financing, or acquisition
    - With your consent or at your direction
    
    We require all third parties to respect the security of your personal information and to treat it in accordance with the law.`
  },
  {
    title: 'Data Security',
    icon: Lock,
    content: `We implement appropriate technical and organizational measures to protect the security of your personal information. However, please note that no method of transmission over the Internet or electronic storage is 100% secure.
    
    We have procedures in place to deal with any suspected personal data breach and will notify you and any applicable regulator of a breach where we are legally required to do so.`
  },
  {
    title: 'Your Rights',
    icon: EyeOff,
    content: `Depending on your location, you may have the following rights regarding your personal information:
    - Access and receive a copy of your personal information
    - Rectify or update inaccurate or incomplete personal information
    - Delete your personal information under certain circumstances
    - Restrict or object to our processing of your personal information
    - Data portability
    - Withdraw consent at any time where we rely on consent to process your information
    
    To exercise any of these rights, please contact us using the details provided below.`
  },
  {
    title: 'Cookies and Tracking',
    icon: Cookie,
    content: `We use cookies and similar tracking technologies to track activity on our service and hold certain information. Cookies are files with a small amount of data which may include an anonymous unique identifier.
    
    You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent. However, if you do not accept cookies, you may not be able to use some portions of our service.`
  }
];

export default function PrivacyPage() {
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
          <h1 className="text-4xl font-bold mb-4 transition-colors duration-300 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">
            Privacy Policy
          </h1>
          <p className={`text-xl max-w-2xl mx-auto transition-colors duration-300 ${isLight ? 'text-gray-700' : 'text-gray-300'}`}>
            Last updated: {new Date().toLocaleDateString()}
          </p>
          <p className={`mt-4 max-w-2xl mx-auto transition-colors duration-300 ${isLight ? 'text-gray-600' : 'text-gray-400'}`}>
            Your privacy is important to us. This Privacy Policy explains how we collect, use, disclose, and safeguard your information.
          </p>
        </div>

        {/* Introduction */}
        <div className={`rounded-2xl p-6 mb-8 transition-colors duration-300 ${isLight ? 'bg-blue-50 border border-blue-100' : 'bg-blue-900/20 border border-blue-800/30'}`}>
          <p className={`transition-colors duration-300 ${isLight ? 'text-gray-700' : 'text-gray-300'}`}>
            Please read this privacy policy carefully. By accessing or using our service, you acknowledge that you have read, understood, and agree to be bound by all the terms of this privacy policy. If you do not agree to this privacy policy, please do not access or use our services.
          </p>
        </div>

        {/* Privacy Sections */}
        <div className="space-y-8 mb-12">
          {privacySections.map((section, index) => {
            const IconComponent = section.icon;
            return (
              <div key={index} className={`rounded-2xl p-6 transition-colors duration-300 ${isLight ? 'bg-white border border-gray-200 shadow-md' : 'bg-gray-800 border border-gray-700 shadow-lg'}`}>
                <div className="flex items-center mb-4">
                  <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
                    <IconComponent size={24} />
                  </div>
                  <h3 className={`text-xl font-semibold ml-3 transition-colors duration-300 ${isLight ? 'text-gray-900' : 'text-white'}`}>
                    {section.title}
                  </h3>
                </div>
                <div className={`prose max-w-none transition-colors duration-300 ${isLight ? 'text-gray-600' : 'text-gray-400'}`}>
                  {section.content.split('\n').map((paragraph, i) => (
                    <p key={i} className="mb-4">{paragraph}</p>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Contact Information */}
        <div className={`rounded-2xl p-8 transition-colors duration-300 ${isLight ? 'bg-gray-50 border border-gray-200' : 'bg-gray-800 border border-gray-700'}`}>
          <h2 className="text-2xl font-bold mb-4 transition-colors duration-300 text-gray-900 dark:text-white">
            Contact Us
          </h2>
          <p className={`mb-4 transition-colors duration-300 ${isLight ? 'text-gray-600' : 'text-gray-400'}`}>
            If you have any questions about this Privacy Policy, please contact us:
          </p>
          <ul className={`space-y-2 transition-colors duration-300 ${isLight ? 'text-gray-600' : 'text-gray-400'}`}>
            <li>• By email: privacy@yourcompany.com</li>
            <li>• Through our website: yourwebsite.com/contact</li>
            <li>• By mail: [Your Company Address]</li>
          </ul>
        </div>

        {/* Changes to Policy */}
        <div className="mt-8 text-center">
          <p className={`transition-colors duration-300 ${isLight ? 'text-gray-600' : 'text-gray-400'}`}>
            We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the &quot;Last updated&quot; date.
          </p>
        </div>
      </div>
    </div>
  );
}