'use client';

import { useState, useEffect } from 'react';
import { useTheme } from 'next-themes';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Users, Target, Heart, Globe, Award, Clock, Shield, Star } from 'lucide-react';

export default function AboutUsPage() {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  const isLight = resolvedTheme === 'light';

  // Team members data
  const teamMembers = [
    {
      name: 'Sarah Johnson',
      role: 'CEO & Founder',
      image: '/team/sarah-johnson.jpg',
      bio: 'Former tech executive with 15+ years of experience in SaaS and enterprise software.'
    },
    {
      name: 'Michael Chen',
      role: 'CTO',
      image: '/team/michael-chen.jpg',
      bio: 'Software architect specializing in scalable cloud infrastructure and AI technologies.'
    },
    {
      name: 'Emily Rodriguez',
      role: 'Head of Product',
      image: '/team/emily-rodriguez.jpg',
      bio: 'Product management expert with a passion for user-centered design and innovation.'
    },
    {
      name: 'David Kim',
      role: 'Lead Developer',
      image: '/team/david-kim.jpg',
      bio: 'Full-stack developer with expertise in modern web technologies and DevOps.'
    }
  ];

  // Company milestones
  const milestones = [
    {
      year: '2020',
      title: 'Company Founded',
      description: 'Started with a vision to revolutionize the industry'
    },
    {
      year: '2021',
      title: 'Seed Funding',
      description: 'Raised $2M in seed funding from top investors'
    },
    {
      year: '2022',
      title: 'Product Launch',
      description: 'Launched our flagship product to early customers'
    },
    {
      year: '2023',
      title: 'Series A',
      description: 'Closed $10M Series A funding round'
    },
    {
      year: '2024',
      title: 'Global Expansion',
      description: 'Expanded to serve customers in 50+ countries'
    }
  ];

  // Values
  const values = [
    {
      icon: Target,
      title: 'Innovation',
      description: 'We constantly push boundaries and embrace new technologies to deliver cutting-edge solutions.'
    },
    {
      icon: Heart,
      title: 'Customer Success',
      description: 'Our customers\' success is our success. We go above and beyond to ensure they achieve their goals.'
    },
    {
      icon: Shield,
      title: 'Integrity',
      description: 'We operate with honesty, transparency, and the highest ethical standards in everything we do.'
    },
    {
      icon: Users,
      title: 'Collaboration',
      description: 'We believe great things happen when diverse minds come together to solve complex problems.'
    }
  ];

  return (
    <div className={`min-h-screen transition-colors duration-300 ${isLight ? 'bg-white' : 'bg-gradient-to-b from-gray-900 to-gray-800'}`}>
      {/* Hero Section */}
      <section className="relative py-20">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-purple-600/10 dark:from-blue-900/20 dark:to-purple-900/20" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center"
          >
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">
              About Us
            </h1>
            <p className={`text-xl max-w-3xl mx-auto mb-8 transition-colors duration-300 ${isLight ? 'text-gray-700' : 'text-gray-300'}`}>
              We&apos;re on a mission to transform the way businesses operate through innovative technology and exceptional user experiences.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Our Story Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <h2 className="text-3xl font-bold mb-6 transition-colors duration-300 text-gray-900 dark:text-white">
                Our Story
              </h2>
              <div className={`space-y-4 transition-colors duration-300 ${isLight ? 'text-gray-600' : 'text-gray-400'}`}>
                <p>
                  Founded in 2020, our company was born from a simple observation: businesses were struggling with outdated, 
                  inefficient tools that hindered rather than helped their growth. We set out to change that.
                </p>
                <p>
                  What started as a small team of passionate engineers and designers has grown into a diverse organization 
                  serving thousands of customers worldwide. Our journey has been guided by a commitment to excellence, 
                  innovation, and customer satisfaction.
                </p>
                <p>
                  Today, we continue to push the boundaries of what&apos;s possible, helping businesses of all sizes achieve 
                  their full potential through our cutting-edge solutions.
                </p>
              </div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="relative"
            >
              <div className={`rounded-3xl overflow-hidden shadow-2xl ${isLight ? 'bg-gray-100' : 'bg-gray-800'}`}>
                <div className="aspect-video relative">
                  <Image
                    src="/blogs/images/image1.jpg"
                    alt="Our team working together"
                    fill
                    className="object-cover"
                  />
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className={`py-16 ${isLight ? 'bg-gray-50' : 'bg-gray-900'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold mb-4 transition-colors duration-300 text-gray-900 dark:text-white">
              Our Values
            </h2>
            <p className={`text-lg max-w-2xl mx-auto transition-colors duration-300 ${isLight ? 'text-gray-600' : 'text-gray-400'}`}>
              These core principles guide everything we do and define who we are as a company.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => {
              const IconComponent = value.icon;
              return (
                <motion.div
                  key={value.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className={`text-center p-6 rounded-2xl transition-colors duration-300 ${
                    isLight 
                      ? 'bg-white border border-gray-200 shadow-md hover:shadow-lg' 
                      : 'bg-gray-800 border border-gray-700 shadow-lg hover:shadow-xl'
                  }`}
                >
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 mb-4">
                    <IconComponent size={32} />
                  </div>
                  <h3 className="text-xl font-semibold mb-3 transition-colors duration-300 text-gray-900 dark:text-white">
                    {value.title}
                  </h3>
                  <p className={`transition-colors duration-300 ${isLight ? 'text-gray-600' : 'text-gray-400'}`}>
                    {value.description}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold mb-4 transition-colors duration-300 text-gray-900 dark:text-white">
              Meet Our Team
            </h2>
            <p className={`text-lg max-w-2xl mx-auto transition-colors duration-300 ${isLight ? 'text-gray-600' : 'text-gray-400'}`}>
              Talented individuals dedicated to making a difference and driving innovation forward.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {teamMembers.map((member, index) => (
              <motion.div
                key={member.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className={`text-center rounded-2xl overflow-hidden transition-colors duration-300 ${
                  isLight 
                    ? 'bg-white border border-gray-200 shadow-md hover:shadow-lg' 
                    : 'bg-gray-800 border border-gray-700 shadow-lg hover:shadow-xl'
                }`}
              >
                <div className="relative h-48 w-full">
                  <Image
                    src={member.image}
                    alt={member.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-semibold mb-2 transition-colors duration-300 text-gray-900 dark:text-white">
                    {member.name}
                  </h3>
                  <p className={`text-blue-600 dark:text-blue-400 font-medium mb-3`}>
                    {member.role}
                  </p>
                  <p className={`text-sm transition-colors duration-300 ${isLight ? 'text-gray-600' : 'text-gray-400'}`}>
                    {member.bio}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Milestones Section */}
      <section className={`py-16 ${isLight ? 'bg-gray-50' : 'bg-gray-900'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold mb-4 transition-colors duration-300 text-gray-900 dark:text-white">
              Our Journey
            </h2>
            <p className={`text-lg max-w-2xl mx-auto transition-colors duration-300 ${isLight ? 'text-gray-600' : 'text-gray-400'}`}>
              Key milestones that have shaped our company and driven our growth.
            </p>
          </motion.div>

          <div className="relative">
            {/* Timeline line */}
            <div className={`absolute left-1/2 transform -translate-x-1/2 w-1 h-full ${isLight ? 'bg-blue-200' : 'bg-blue-800'}`} />
            
            <div className="space-y-12">
              {milestones.map((milestone, index) => (
                <motion.div
                  key={milestone.year}
                  initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className={`relative flex items-center ${index % 2 === 0 ? 'flex-row' : 'flex-row-reverse'}`}
                >
                  {/* Timeline dot */}
                  <div className={`absolute left-1/2 transform -translate-x-1/2 w-4 h-4 rounded-full ${isLight ? 'bg-blue-600' : 'bg-blue-400'} z-10`} />
                  
                  {/* Content */}
                  <div className={`w-5/12 p-6 rounded-2xl ${
                    isLight 
                      ? 'bg-white border border-gray-200 shadow-md' 
                      : 'bg-gray-800 border border-gray-700 shadow-lg'
                  }`}>
                    <div className={`text-2xl font-bold mb-2 ${isLight ? 'text-blue-600' : 'text-blue-400'}`}>
                      {milestone.year}
                    </div>
                    <h3 className="text-lg font-semibold mb-2 transition-colors duration-300 text-gray-900 dark:text-white">
                      {milestone.title}
                    </h3>
                    <p className={`transition-colors duration-300 ${isLight ? 'text-gray-600' : 'text-gray-400'}`}>
                      {milestone.description}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { icon: Users, number: '10K+', label: 'Happy Customers' },
              { icon: Globe, number: '50+', label: 'Countries' },
              { icon: Award, number: '15+', label: 'Industry Awards' },
              { icon: Clock, number: '99.9%', label: 'Uptime' }
            ].map((stat, index) => {
              const IconComponent = stat.icon;
              return (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="text-center"
                >
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 mb-4">
                    <IconComponent size={32} />
                  </div>
                  <div className="text-3xl font-bold mb-2 transition-colors duration-300 text-gray-900 dark:text-white">
                    {stat.number}
                  </div>
                  <div className={`transition-colors duration-300 ${isLight ? 'text-gray-600' : 'text-gray-400'}`}>
                    {stat.label}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className={`py-20 ${isLight ? 'bg-gradient-to-r from-blue-50 to-purple-50' : 'bg-gradient-to-r from-blue-900/20 to-purple-900/20'}`}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-3xl font-bold mb-6 transition-colors duration-300 text-gray-900 dark:text-white">
              Ready to Join Our Journey?
            </h2>
            <p className={`text-lg mb-8 max-w-2xl mx-auto transition-colors duration-300 ${isLight ? 'text-gray-600' : 'text-gray-400'}`}>
              Whether you&apos;re looking to use our products or join our team, we&apos;d love to hear from you.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors shadow-md hover:shadow-lg">
                Get Started
              </button>
              <button className={`px-8 py-3 rounded-lg font-medium border transition-colors ${
                isLight 
                  ? 'border-gray-300 text-gray-700 hover:bg-gray-50' 
                  : 'border-gray-600 text-gray-300 hover:bg-gray-800'
              } shadow-md hover:shadow-lg`}>
                View Careers
              </button>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}