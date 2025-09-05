'use client';

import { useState, useEffect } from 'react';
import { useTheme } from 'next-themes';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight } from 'lucide-react';

export function Hero() {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false); // New state to check if the component is mounted on the client
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [currentTextIndex, setCurrentTextIndex] = useState(0);

  // Set the mounted state to true after the component has mounted on the client
  useEffect(() => {
    setMounted(true);
  }, []);

  const images = [
    '/bc1.jpg',
    '/bc2.jpg',
    '/bc3.jpg',
    '/bc4.jpg',
    '/bc5.jpg',
  ];

  const heroTexts = [
    {
      heading: "Build and Launch Your SaaS in Days",
      subheading: "A modern template with authentication, payments, and everything you need to go from idea to launch in the blink of an eye.",
    },
    {
      heading: "Launch Your SaaS Faster with Paddle",
      subheading: "The all-in-one boilerplate with built-in authentication, payments, and pre-built components to accelerate your product development.",
    },
    {
      heading: "Stop Building. Start Launching.",
      subheading: "Don't get bogged down with boilerplate. Our template handles payments, auth, and more so you can focus on what matters: your product.",
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

  // If the component is not yet mounted on the client, return a loading state or null
  // This prevents the hydration error by not rendering theme-dependent classes on the server
  if (!mounted) {
    return (
      <section className="relative py-16 md:py-24 px-4 md:px-8 overflow-hidden">
        {/* You can render a basic, theme-agnostic skeleton here if you want to prevent a flash of unstyled content */}
      </section>
    );
  }

  const isLight = resolvedTheme === 'light';
  const currentText = heroTexts[currentTextIndex];

  return (
    <section className={`relative py-16 md:py-24 px-4 md:px-8 overflow-hidden transition-colors duration-500 ${isLight ? 'bg-white' : 'bg-gray-900'}`}>
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
          <h1 className={`text-4xl md:text-6xl lg:text-7xl font-bold mb-6 tracking-tight transition-all duration-1000 ease-in-out ${isLight ? 'text-gray-900' : 'text-white'}`}>
            {currentText.heading.split(' ').map((word, index, arr) => {
              const gradientWord = word.toLowerCase();
              const needsGradient = ['faster', 'paddle', 'launching'].includes(gradientWord);
              
              if (needsGradient) {
                // Check if this is the first word that needs a gradient
                const firstGradientIndex = arr.findIndex(w => ['faster', 'paddle', 'launching'].includes(w.toLowerCase()));
                if (index === firstGradientIndex) {
                  return (
                    <span
                      key={index}
                      className={`bg-clip-text text-transparent bg-gradient-to-r transition-all duration-1000 ease-in-out ${
                        isLight
                          ? 'from-orange-600 to-amber-500'
                          : 'from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400'
                      }`}
                    >
                      {arr.slice(index).join(' ')}
                    </span>
                  );
                } else {
                  return null; // Skip subsequent words that are part of the gradient span
                }
              }

              // If a previous word triggered the gradient, skip rendering this one
              const previousWords = arr.slice(0, index);
              const hasPreviousGradientWord = previousWords.some(w => ['faster', 'paddle', 'launching'].includes(w.toLowerCase()));
              if (hasPreviousGradientWord) {
                return null;
              }

              return (
                <span key={index}>
                  {word}
                  {index === arr.length - 1 ? '' : ' '}
                </span>
              );
            })}
          </h1>
          
          {/* Subheading */}
          <p className="text-lg md:text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto md:mx-0 mb-10 leading-relaxed transition-opacity duration-1000 ease-in-out">
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
              className="border border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500 text-gray-700 dark:text-gray-300 font-medium py-3 px-6 rounded-lg transition-all duration-300"
            >
              View Demo
            </Link>
          </div>
        </div>
        
        {/* Right Column: Rotating Image Carousel */}
        <div className="relative w-full md:w-1/2 aspect-video rounded-3xl overflow-hidden shadow-2xl border border-gray-200 dark:border-gray-700">
          {images.map((src, index) => (
            <Image
              key={src}
              src={src}
              alt={`App screenshot ${index + 1}`}
              fill
              className={`object-cover transition-opacity duration-1000 ease-in-out ${
                index === currentImageIndex ? 'opacity-100' : 'opacity-0'
              }`}
              sizes="(max-width: 768px) 100vw, 50vw"
            />
          ))}
        </div>
      </div>
      
      {/* Stats Section */}
      <div className="max-w-7xl mx-auto relative z-10 mt-16 md:mt-24">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="text-4xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400">100%</div>
            <div className="text-gray-600 dark:text-gray-400 mt-2">Faster Development</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400">24/7</div>
            <div className="text-gray-600 dark:text-gray-400 mt-2">Support Included</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400">30+</div>
            <div className="text-gray-600 dark:text-gray-400 mt-2">Pre-built Components</div>
          </div>
        </div>
      </div>
    </section>
  );
}