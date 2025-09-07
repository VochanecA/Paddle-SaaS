'use client';

import { useState, useEffect } from 'react';
import { useTheme } from 'next-themes';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight } from 'lucide-react';


export function Hero() {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [currentTextIndex, setCurrentTextIndex] = useState(0);

  useEffect(() => {
    setMounted(true);
  }, []);

  const images = ['/bc1.jpg', '/m2.jpg', '/m3.jpg'];

  const heroTexts = [
    {
      heading: 'Build and Launch Your SaaS in Days',
      subheading:
        'A modern template with authentication, payments, and everything you need to go from idea to launch in the blink of an eye.',
    },
    {
      heading: 'Launch Your SaaS Faster with Paddle',
      subheading:
        'The all-in-one boilerplate with built-in authentication, payments, and pre-built components to accelerate your product development.',
    },
    {
      heading: 'Stop Building. Start Launching.',
      subheading:
        'Don’t get bogged down with boilerplate. Our template handles payments, auth, and more so you can focus on what matters: your product.',
    },
  ];

  useEffect(() => {
    const imageInterval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => (prevIndex + 1) % images.length);
    }, 6000);

    const textInterval = setInterval(() => {
      setCurrentTextIndex((prevIndex) => (prevIndex + 1) % heroTexts.length);
    }, 5000);

    return () => {
      clearInterval(imageInterval);
      clearInterval(textInterval);
    };
  }, [images.length, heroTexts.length]);

  if (!mounted) {
    return (
      <section className="relative py-16 md:py-24 px-4 md:px-8 overflow-hidden" />
    );
  }

  const isLight = resolvedTheme === 'light';
  const currentText = heroTexts[currentTextIndex];

  return (
    <section className="relative py-16 md:py-24 px-4 md:px-8 overflow-hidden h-screen flex items-center">
      {/* Background Images */}
      <div className="absolute inset-0">
        {images.map((src, index) => (
          <Image
            key={src}
            src={src}
            alt={`Background ${index + 1}`}
            fill
            className={`object-cover transition-opacity duration-1000 ease-in-out ${
              index === currentImageIndex ? 'opacity-100' : 'opacity-0'
            }`}
            priority={index === 0}
          />
        ))}
        {/* Dark overlay for readability */}
        <div className="absolute inset-0 bg-black/50"></div>
      </div>

      {/* Floating Blobs */}
      <div className="absolute inset-0 overflow-hidden">
        {isLight ? (
          <>
            <div className="absolute top-20 left-10 w-72 h-72 bg-blue-400 opacity-30 rounded-full animate-blob"></div>
            <div className="absolute top-40 right-20 w-96 h-96 bg-purple-400 opacity-30 rounded-full animate-blob animation-delay-2000"></div>
            <div className="absolute bottom-20 left-1/3 w-80 h-80 bg-green-400 opacity-30 rounded-full animate-blob animation-delay-4000"></div>
          </>
        ) : (
          <>
            <div className="absolute top-20 left-10 w-72 h-72 bg-cyan-500 opacity-40 rounded-full animate-blob blur-2xl"></div>
            <div className="absolute top-40 right-20 w-96 h-96 bg-fuchsia-500 opacity-40 rounded-full animate-blob animation-delay-2000 blur-2xl"></div>
            <div className="absolute bottom-20 left-1/3 w-80 h-80 bg-indigo-500 opacity-40 rounded-full animate-blob animation-delay-4000 blur-2xl"></div>
          </>
        )}
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto relative z-10 flex flex-col md:flex-row items-center md:items-start gap-12">
        {/* Left Column: Content */}
        <div className="md:w-1/2 text-center md:text-left">
          {/* Badge */}
          <div className="inline-flex items-center rounded-full bg-blue-100 px-4 py-2 text-sm font-medium text-blue-800 mb-6 dark:bg-blue-900 dark:text-blue-200">
            <span className="relative flex h-2 w-2 mr-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
            </span>
            Now with Next.js 15.5 & App Router
          </div>

          {/* Main heading */}
          <h1
            className={`text-4xl md:text-6xl lg:text-7xl font-bold mb-6 tracking-tight transition-all duration-1000 ease-in-out text-white`}
          >
            {currentText.heading}
          </h1>

          {/* Subheading */}
          <p className="text-lg md:text-xl max-w-3xl mx-auto md:mx-0 mb-10 leading-relaxed text-white">
            {currentText.subheading}
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start items-center mb-16">
            <Link
              href="/account"
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg transition-all duration-300 transform hover:-translate-y-1 shadow-lg hover:shadow-xl flex items-center"
            >
              Get Started Free
              <ArrowRight className="w-5 h-5 ml-2" />
            </Link>
            <Link
              href="/demo"
              className="border border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500 text-white font-medium py-3 px-6 rounded-lg transition-all duration-300"
            >
              View Demo
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
