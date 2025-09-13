// src/components/Hero.tsx
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useTheme } from 'next-themes';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Sparkles, Zap, BarChart3, Shield } from 'lucide-react';

interface HeroText {
  heading: string;
  subheading: string;
}

const Hero = () => {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [currentTextIndex, setCurrentTextIndex] = useState(0);
  const [isHovering, setIsHovering] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const images: readonly string[] = ['/bc1.jpg', '/m2.jpg', '/m3.jpg'] as const;
  const heroTexts: readonly HeroText[] = [
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
        'Don\'t get bogged down with boilerplate. Our template handles payments, auth, and more so you can focus on what matters: your product.',
    },
  ] as const;

  useEffect(() => {
    if (!mounted) return;
    
    const imageInterval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => (prevIndex + 1) % images.length);
    }, 8000);
    
    const textInterval = setInterval(() => {
      setCurrentTextIndex((prevIndex) => (prevIndex + 1) % heroTexts.length);
    }, 6000);
    
    return () => {
      clearInterval(imageInterval);
      clearInterval(textInterval);
    };
  }, [images.length, heroTexts.length, mounted]);

  if (!mounted) {
    return (
      <section 
        className="relative py-16 md:py-24 px-4 md:px-8 overflow-hidden"
        aria-label="Loading hero section"
      />
    );
  }

  const isLight = resolvedTheme === 'light';
  const currentText = heroTexts[currentTextIndex];

  return (
    <section 
      className="relative py-16 md:py-24 px-4 md:px-8 overflow-hidden min-h-[90vh] flex items-center"
      aria-label="Hero section"
    >
      {/* Background Images with gradient overlay */}
      <div className="absolute inset-0">
        {images.map((src, index) => (
          <Image
            key={src}
            src={src}
            alt={`Background ${index + 1}`}
            fill
            className={`object-cover transition-opacity duration-2000 ease-in-out ${
              index === currentImageIndex ? 'opacity-100' : 'opacity-0'
            }`}
            priority={index === 0}
            sizes="100vw"
            quality={90}
          />
        ))}
        {/* Gradient overlay for better text readability */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/60 to-black/80"></div>
      </div>
      
      {/* Animated geometric shapes */}
      <div className="absolute inset-0 overflow-hidden" aria-hidden="true">
        {/* Floating orbs */}
        <div className="absolute top-20 left-10 w-64 h-64 bg-blue-500/20 rounded-full filter blur-3xl animate-float"></div>
        <div className="absolute top-40 right-20 w-80 h-80 bg-purple-500/20 rounded-full filter blur-3xl animate-float animation-delay-2000"></div>
        <div className="absolute bottom-20 left-1/3 w-72 h-72 bg-cyan-500/20 rounded-full filter blur-3xl animate-float animation-delay-4000"></div>
        
        {/* Animated lines */}
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-blue-400 to-transparent animate-pulse"></div>
        <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-purple-400 to-transparent animate-pulse animation-delay-1000"></div>
        
        {/* Corner accents */}
        <div className="absolute top-0 left-0 w-16 h-16 border-t-2 border-l-2 border-blue-400/50 rounded-tl-lg"></div>
        <div className="absolute top-0 right-0 w-16 h-16 border-t-2 border-r-2 border-purple-400/50 rounded-tr-lg"></div>
        <div className="absolute bottom-0 left-0 w-16 h-16 border-b-2 border-l-2 border-cyan-400/50 rounded-bl-lg"></div>
        <div className="absolute bottom-0 right-0 w-16 h-16 border-b-2 border-r-2 border-pink-400/50 rounded-br-lg"></div>
      </div>
      
      {/* Content */}
      <div className="max-w-7xl mx-auto relative z-10 flex flex-col lg:flex-row items-center lg:items-start gap-16 w-full">
        {/* Left Column: Content */}
        <div className="lg:w-1/2 text-center lg:text-left">
          {/* Badge with glow effect */}
          <div className="inline-flex items-center rounded-full bg-gradient-to-r from-blue-600/20 to-purple-600/20 backdrop-blur-sm border border-blue-500/30 px-4 py-2 text-sm font-medium text-blue-200 mb-8 transition-all duration-300 hover:scale-105">
            <Sparkles className="w-4 h-4 mr-2 text-blue-300" />
            <span className="relative flex h-2 w-2 mr-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-400"></span>
            </span>
            Now with Next.js 15.5 & App Router
          </div>
          
          {/* Main heading with gradient text */}
          <h1
            className="text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold mb-6 tracking-tight transition-all duration-1000 ease-in-out"
            key={currentTextIndex}
          >
            <span className="block text-white mb-2">{currentText.heading.split(' ').slice(0, -2).join(' ')}</span>
            <span className="block bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400">
              {currentText.heading.split(' ').slice(-2).join(' ')}
            </span>
          </h1>
          
          {/* Subheading with improved typography */}
          <p 
            className="text-lg md:text-xl max-w-3xl mx-auto lg:mx-0 mb-10 leading-relaxed text-gray-200"
            key={`sub-${currentTextIndex}`}
          >
            {currentText.subheading}
          </p>
          
          {/* Feature highlights */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
            <div className="flex items-center justify-center lg:justify-start">
              <div className="bg-blue-500/20 p-2 rounded-lg mr-3">
                <Zap className="w-5 h-5 text-blue-300" />
              </div>
              <span className="text-gray-200 text-sm">Lightning Fast</span>
            </div>
            <div className="flex items-center justify-center lg:justify-start">
              <div className="bg-purple-500/20 p-2 rounded-lg mr-3">
                <Shield className="w-5 h-5 text-purple-300" />
              </div>
              <span className="text-gray-200 text-sm">Secure by Default</span>
            </div>
            <div className="flex items-center justify-center lg:justify-start">
              <div className="bg-cyan-500/20 p-2 rounded-lg mr-3">
                <BarChart3 className="w-5 h-5 text-cyan-300" />
              </div>
              <span className="text-gray-200 text-sm">Analytics Ready</span>
            </div>
          </div>
          
          {/* CTA Buttons with enhanced styling */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start items-center">
            <Link
              href="/account"
              className="group relative overflow-hidden bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium py-3 px-8 rounded-lg transition-all duration-500 transform hover:-translate-y-1 shadow-lg hover:shadow-xl flex items-center justify-center"
              aria-label="Get started for free"
              onMouseEnter={() => setIsHovering(true)}
              onMouseLeave={() => setIsHovering(false)}
            >
              <span className="relative z-10 flex items-center">
                Get Started Free
                <ArrowRight className={`w-5 h-5 ml-2 transition-transform duration-300 ${isHovering ? 'translate-x-1' : ''}`} />
              </span>
              <span className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></span>
            </Link>
            <Link
              href="/demo"
              className="relative overflow-hidden bg-transparent border-2 border-white/30 text-white font-medium py-3 px-8 rounded-lg transition-all duration-300 hover:bg-white/10 hover:border-white/50 flex items-center justify-center backdrop-blur-sm"
              aria-label="View demo"
            >
              View Demo
            </Link>
          </div>
        </div>
        
        {/* Right Column: Visual elements */}
        <div className="lg:w-1/2 flex justify-center lg:justify-end">
          <div className="relative w-full max-w-lg">
            {/* Glowing card */}
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-2xl blur-xl transform rotate-3"></div>
            <div className="relative bg-gray-900/60 backdrop-blur-lg border border-white/10 rounded-2xl p-8 transform -rotate-3 transition-transform duration-500 hover:rotate-0">
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-3 h-3 rounded-full bg-red-500 mr-2"></div>
                    <div className="w-3 h-3 rounded-full bg-yellow-500 mr-2"></div>
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  </div>
                  <div className="text-xs text-gray-400">Terminal</div>
                </div>
                
                <div className="font-mono text-sm space-y-2">
                  <div className="text-green-400">$ npm create saas-starter</div>
                  <div className="text-gray-300">Creating a new SaaS app in ./my-saas-app</div>
                  <div className="text-gray-300">Installing dependencies...</div>
                  <div className="text-blue-400 animate-pulse">✓ Done!</div>
                  <div className="text-gray-300">Starting development server...</div>
                  <div className="text-purple-400">🚀 Ready in 2.5s</div>
                </div>
                
                <div className="pt-4 border-t border-gray-800">
                  <div className="flex items-center text-xs text-gray-400">
                    <div className="w-2 h-2 rounded-full bg-green-500 mr-2 animate-pulse"></div>
                    Server running on localhost:3000
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Bottom wave */}
      <div className="absolute bottom-0 left-0 w-full overflow-hidden leading-none">
        <svg className="relative block w-full h-16" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320" preserveAspectRatio="none">
          <path fill="currentColor" fillOpacity="0.1" d="M0,192L60,186.7C120,181,240,171,360,181.3C480,192,600,224,720,224C840,224,960,192,1080,181.3C1200,171,1320,181,1380,186.7L1440,192L1440,320L1380,320C1320,320,1200,320,1080,320C960,320,840,320,720,320C600,320,480,320,360,320C240,320,120,320,60,320L0,320Z"></path>
        </svg>
      </div>
    </section>
  );
};

export default Hero;