// src/components/Hero.tsx
'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useTheme } from 'next-themes';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Sparkles, Zap, BarChart3, Shield } from 'lucide-react';

interface HeroText {
  heading: string;
  subheading: string;
}

// Constants outside component to prevent recreation
const IMAGES = ['/m1.jpg', '/bc2.jpg', '/bc3.jpg'] as const;
const HERO_TEXTS: readonly HeroText[] = [
  {
    heading: 'Build and Launch Your SaaS in Days',
    subheading: 'A modern template with authentication, payments, and everything you need to go from idea to launch in the blink of an eye.',
  },
  {
    heading: 'Launch Your SaaS Faster with Paddle',
    subheading: 'The all-in-one boilerplate with built-in authentication, payments, and pre-built components to accelerate your product development.',
  },
  {
    heading: 'Stop Building. Start Launching.',
    subheading: 'Don\'t get bogged down with boilerplate. Our template handles payments, auth, and more so you can focus on what matters: your product.',
  },
] as const;

const Hero = () => {
  const [mounted, setMounted] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [currentTextIndex, setCurrentTextIndex] = useState(0);
  const [isHovering, setIsHovering] = useState(false);
  const [imageError, setImageError] = useState<boolean[]>(new Array(IMAGES.length).fill(false));

  // Memoized values
  const currentText = useMemo(() => HERO_TEXTS[currentTextIndex], [currentTextIndex]);

  // Handle image errors
  const handleImageError = useCallback((index: number) => {
    setImageError(prev => {
      const newErrors = [...prev];
      newErrors[index] = true;
      return newErrors;
    });
  }, []);

  // Optimized image handling with fallback
  const imageElements = useMemo(() => 
    IMAGES.map((src, index) => {
      // If image failed to load, use gradient background
      if (imageError[index]) {
        return (
          <div
            key={src}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
              index === currentImageIndex ? 'opacity-100' : 'opacity-0'
            } ${
              index === 0 ? 'bg-gradient-to-br from-blue-900 to-purple-900' :
              index === 1 ? 'bg-gradient-to-br from-purple-900 to-pink-900' :
              'bg-gradient-to-br from-cyan-900 to-blue-900'
            }`}
          />
        );
      }

      return (
        <Image
          key={src}
          src={src}
          alt={`Background ${index + 1}`}
          fill
          className={`object-cover transition-opacity duration-1000 ease-in-out ${
            index === currentImageIndex ? 'opacity-100' : 'opacity-0'
          }`}
          priority={index === 0}
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 100vw, 100vw"
          quality={85}
          onError={() => handleImageError(index)}
        />
      );
    }), [currentImageIndex, imageError, handleImageError]
  );

  // Single useEffect for all intervals
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    const imageInterval = setInterval(() => {
      setCurrentImageIndex(prev => (prev + 1) % IMAGES.length);
    }, 5000);
    
    const textInterval = setInterval(() => {
      setCurrentTextIndex(prev => (prev + 1) % HERO_TEXTS.length);
    }, 4000);
    
    return () => {
      clearInterval(imageInterval);
      clearInterval(textInterval);
    };
  }, [mounted]);

  // Debug: log current image index
  useEffect(() => {
    if (mounted) {
      console.log('Current image index:', currentImageIndex, 'Image:', IMAGES[currentImageIndex]);
    }
  }, [currentImageIndex, mounted]);

  // Optimized event handlers
  const handleMouseEnter = useCallback(() => setIsHovering(true), []);
  const handleMouseLeave = useCallback(() => setIsHovering(false), []);

  // Early return for unmounted state
  if (!mounted) {
    return (
      <section 
        className="relative py-16 md:py-24 px-4 md:px-8 overflow-hidden min-h-[600px] flex items-center bg-gray-900"
        aria-label="Loading hero section"
      >
        <div className="max-w-7xl mx-auto w-full text-center">
          <div className="animate-pulse">
            <div className="h-8 w-64 bg-gray-700 rounded mx-auto mb-6"></div>
            <div className="h-16 w-3/4 bg-gray-700 rounded mx-auto mb-4"></div>
            <div className="h-4 w-1/2 bg-gray-700 rounded mx-auto mb-8"></div>
            <div className="h-12 w-48 bg-gray-700 rounded mx-auto"></div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section 
      className="relative py-16 md:py-24 px-4 md:px-8 overflow-hidden min-h-[600px] flex items-center"
      aria-label="Hero section"
    >
      {/* Background Images with optimized loading */}
      <div className="absolute inset-0">
        {imageElements}
        {/* Reduced gradient overlay for better text readability */}
        <div 
          className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/40 to-black/60"
          aria-hidden="true"
        />
      </div>
      
      {/* Simplified geometric shapes */}
      <div className="absolute inset-0 overflow-hidden" aria-hidden="true">
        <div className="absolute top-20 left-10 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl"></div>
        <div className="absolute top-40 right-20 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 left-1/3 w-72 h-72 bg-cyan-500/10 rounded-full blur-3xl"></div>
      </div>
      
      {/* Content */}
      <div className="max-w-7xl mx-auto relative z-10 flex flex-col lg:flex-row items-center lg:items-start gap-12 w-full">
        {/* Left Column: Content */}
        <div className="lg:w-1/2 text-center lg:text-left">
          {/* Badge with reduced effects */}
          <div 
            className="inline-flex items-center rounded-full bg-gray-900/80 backdrop-blur-sm border border-blue-500/20 px-4 py-2 text-sm font-medium text-blue-200 mb-8"
            role="status"
            aria-label="Latest version badge"
          >
            <Sparkles className="w-4 h-4 mr-2 text-blue-300" aria-hidden="true" />
            <span className="sr-only">Status: </span>
            Now with Next.js 15.5 & App Router
          </div>
          
          {/* Optimized heading with proper semantic structure */}
          <div className="mb-6">
            <h1 className="text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold text-white mb-4 leading-tight">
              {currentText.heading}
            </h1>
          </div>
          
          {/* Subheading */}
          <p 
            className="text-lg md:text-xl max-w-3xl mx-auto lg:mx-0 mb-8 leading-relaxed text-gray-200"
          >
            {currentText.subheading}
          </p>
          
          {/* Feature highlights */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-8" role="list" aria-label="Key features">
            <div className="flex items-center justify-center lg:justify-start" role="listitem">
              <div className="bg-blue-500/20 p-2 rounded-lg mr-3" aria-hidden="true">
                <Zap className="w-4 h-4 text-blue-300" />
              </div>
              <span className="text-gray-200 text-sm">Lightning Fast</span>
            </div>
            <div className="flex items-center justify-center lg:justify-start" role="listitem">
              <div className="bg-purple-500/20 p-2 rounded-lg mr-3" aria-hidden="true">
                <Shield className="w-4 h-4 text-purple-300" />
              </div>
              <span className="text-gray-200 text-sm">Secure by Default</span>
            </div>
            <div className="flex items-center justify-center lg:justify-start" role="listitem">
              <div className="bg-cyan-500/20 p-2 rounded-lg mr-3" aria-hidden="true">
                <BarChart3 className="w-4 h-4 text-cyan-300" />
              </div>
              <span className="text-gray-200 text-sm">Analytics Ready</span>
            </div>
          </div>
          
          {/* CTA Buttons with proper contrast and semantics */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start items-center">
            <Link
              href="/account"
              className="group relative bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-8 rounded-lg transition-colors duration-300 flex items-center justify-center shadow-lg focus:outline-none focus:ring-4 focus:ring-blue-500/50"
              aria-label="Get started for free"
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
            >
              Get Started Free
              <ArrowRight 
                className={`w-5 h-5 ml-2 transition-transform duration-300 ${
                  isHovering ? 'translate-x-1' : ''
                }`} 
                aria-hidden="true"
              />
            </Link>
            <Link
              href="/demo"
              className="bg-transparent border-2 border-white/30 hover:border-white/50 text-white font-medium py-3 px-8 rounded-lg transition-all duration-300 hover:bg-white/10 flex items-center justify-center focus:outline-none focus:ring-4 focus:ring-white/50"
              aria-label="View demo"
            >
              View Demo
            </Link>
          </div>
        </div>
        
        {/* Right Column: Visual elements with reduced complexity */}
        <div className="lg:w-1/2 flex justify-center lg:justify-end">
          <div className="relative w-full max-w-md">
            {/* Code preview card */}
            <div 
              className="relative bg-gray-900/80 backdrop-blur-lg border border-white/10 rounded-xl p-6"
              role="complementary"
              aria-label="Code example"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between" aria-hidden="true">
                  <div className="flex items-center">
                    <div className="w-2 h-2 rounded-full bg-red-500 mr-1.5"></div>
                    <div className="w-2 h-2 rounded-full bg-yellow-500 mr-1.5"></div>
                    <div className="w-2 h-2 rounded-full bg-green-500"></div>
                  </div>
                  <div className="text-xs text-gray-400">Terminal</div>
                </div>
                
                <div className="font-mono text-sm space-y-1.5" aria-label="Terminal commands">
                  <div className="text-green-400" role="text">$ npm create saas-starter</div>
                  <div className="text-gray-300" role="text">Creating new SaaS app...</div>
                  <div className="text-gray-300" role="text">Installing dependencies...</div>
                  <div className="text-blue-400" role="text">✓ Done! Ready in 2.5s</div>
                </div>
                
                <div className="pt-3 border-t border-gray-800" aria-hidden="true">
                  <div className="flex items-center text-xs text-gray-400">
                    <div className="w-1.5 h-1.5 rounded-full bg-green-500 mr-1.5"></div>
                    Server running on localhost:3000
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Bottom decorative wave */}
      <div className="absolute bottom-0 left-0 w-full overflow-hidden" aria-hidden="true">
        <svg 
          className="block w-full h-12" 
          xmlns="http://www.w3.org/2000/svg" 
          viewBox="0 0 1440 120" 
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <path 
            fill="currentColor" 
            fillOpacity="0.1" 
            d="M0,64L80,58.7C160,53,320,43,480,48C640,53,800,75,960,74.7C1120,75,1280,53,1360,42.7L1440,32L1440,120L1360,120C1280,120,1120,120,960,120C800,120,640,120,480,120C320,120,160,120,80,120L0,120Z"
          />
        </svg>
      </div>
    </section>
  );
};

export default Hero;