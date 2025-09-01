'use client';

import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';

export function Hero() {
  return (
    <section className="relative py-24 px-4 md:px-8 bg-white dark:bg-gray-900 transition-colors duration-500">
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center justify-between gap-16">
        {/* Text Content */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="lg:w-1/2 text-center lg:text-left"
        >
          <h1 className="text-5xl lg:text-7xl font-extrabold leading-tight mb-6">
            <span className="text-red-600 dark:text-white">Launch Your SaaS</span>
            <br />
            <span className="block text-orange-500 dark:text-cyan-300 mt-2">
              Faster Than Ever
            </span>
          </h1>
          <p className="text-lg text-gray-700 dark:text-gray-300 max-w-xl mx-auto lg:mx-0 mb-10">
            A modern, production-ready starter kit with authentication, billing, and scalable infrastructure — so you can focus on building your product, not boilerplate.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
            <Link
              href="/auth/signup"
              className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-white bg-red-600 hover:bg-red-700 dark:bg-orange-500 dark:hover:bg-orange-600 rounded-xl transition-transform transform hover:scale-105 shadow-lg"
            >
              Get Started
              <svg
                className="ml-2 w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M14 5l7 7m0 0l-7 7m7-7H3"
                />
              </svg>
            </Link>
            <Link
              href="/pricing"
              className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold border-2 border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors"
            >
              View Pricing
            </Link>
          </div>
        </motion.div>

        {/* Hero Image */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="lg:w-1/2 flex justify-center lg:justify-end"
        >
          <div className="relative w-full max-w-md h-72 lg:h-96 rounded-3xl overflow-hidden shadow-xl">
            <Image
              src="/hero.jpeg"
              alt="Hero Image"
              fill
              className="object-cover"
              priority
            />
          </div>
        </motion.div>
      </div>
    </section>
  );
}
