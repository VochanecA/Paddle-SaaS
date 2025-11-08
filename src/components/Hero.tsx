'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import Link from 'next/link';
import { ArrowRight, Sparkles, Zap, BarChart3, Shield, Play, Star, CheckCircle, HeartPulse, Stethoscope, Clock, Users, Activity } from 'lucide-react';

interface HeroText {
  heading: string;
  subheading: string;
}

// Constants
// Constants
const HERO_TEXTS: readonly HeroText[] = [
  {
    heading: 'AI Medicinski Asistent za Hitne Slučajeve',
    subheading: 'Trenutna AI analiza pacijenata, DICOM snimki i trijaža. Analizirajte RTG, CT, MR snimke uz napredne AI algoritme za brže i preciznije dijagnoze.',
  },
  {
    heading: 'Revolucionarni AI za Analizu Medicinskih Snimki',
    subheading: 'Napredna AI analiza DICOM formata - RTG, CT, MR i ultrazvuk. Automatsko prepoznavanje anomalija i generisanje detaljnih medicinskih izvještaja.',
  },
  {
    heading: 'Pametna Trijaža i DICOM Analiza',
    subheading: 'Kombinujte analizu vitalnih znakova sa AI analizom medicinskih snimki. Kompletno rješenje za brzu i preciznu medicinsku procjenu.',
  },
  {
    heading: 'AI Analiza Medicinskih Slika u Realnom Vremenu',
    subheading: 'Učitajte DICOM, PNG ili JPG snimke i dobijte trenutnu AI analizu. Detektujte fracture, tumore, anomalije i više sa visokom tačnošću.',
  },
  {
    heading: 'Napredna DICOM Analiza sa Veštačkom Inteligencijom',
    subheading: 'Specjalizovani AI modeli za različite modalitete: radiografije, CT skenovi, MRI, ultrazvuk. Detaljni nalazi i preporuke za svaku snimku.',
  },
] as const;

const Hero = () => {
  const [mounted, setMounted] = useState(false);
  const [currentTextIndex, setCurrentTextIndex] = useState(0);
  const [isHovering, setIsHovering] = useState(false);

  // Memoized values
  const currentText = useMemo(() => HERO_TEXTS[currentTextIndex], [currentTextIndex]);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    const textInterval = setInterval(() => {
      setCurrentTextIndex(prev => (prev + 1) % HERO_TEXTS.length);
    }, 4000);
    
    return () => {
      clearInterval(textInterval);
    };
  }, [mounted]);

  // Optimized event handlers
  const handleMouseEnter = useCallback(() => setIsHovering(true), []);
  const handleMouseLeave = useCallback(() => setIsHovering(false), []);

  // Early return for unmounted state
  if (!mounted) {
    return (
      <section 
        className="relative py-20 md:py-32 px-4 md:px-8 overflow-hidden bg-gradient-to-br from-slate-900 via-blue-900 to-purple-900"
        aria-label="Loading hero section"
      >
        <div className="max-w-7xl mx-auto w-full text-center">
          <div className="animate-pulse">
            <div className="h-8 w-64 bg-slate-700 rounded-lg mx-auto mb-6"></div>
            <div className="h-16 w-3/4 bg-slate-700 rounded-lg mx-auto mb-4"></div>
            <div className="h-4 w-1/2 bg-slate-700 rounded-lg mx-auto mb-8"></div>
            <div className="h-12 w-48 bg-slate-700 rounded-lg mx-auto"></div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section 
      className="relative py-20 md:py-32 px-4 md:px-8 overflow-hidden bg-gradient-to-br from-slate-900 via-blue-900 to-purple-900"
      aria-label="Hero section - AI Medicinski Asistent"
    >
      {/* Background Elements - CSS only, no images */}
      <div className="absolute inset-0 overflow-hidden" aria-hidden="true">
        {/* Medical-themed grid pattern */}
        <div 
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
                             linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
            backgroundSize: '50px 50px'
          }}
        />
        
        {/* Animated medical-themed gradient orbs */}
        <div className="absolute top-1/4 -left-10 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl animate-pulse-slow"></div>
        <div className="absolute top-1/2 -right-10 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse-slow delay-1000"></div>
        <div className="absolute bottom-1/4 left-1/3 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl animate-pulse-slow delay-2000"></div>
        
        {/* Medical icons pattern */}
        <div className="absolute top-20 right-20 opacity-5">
          <HeartPulse className="w-24 h-24 text-white" />
        </div>
        <div className="absolute bottom-20 left-20 opacity-5">
          <Stethoscope className="w-24 h-24 text-white" />
        </div>
      </div>
      
      {/* Content */}
      <div className="max-w-7xl mx-auto relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left Column: Content */}
          <div className="text-center lg:text-left">
            {/* Badge */}
            <div 
              className="inline-flex items-center rounded-full bg-white/10 backdrop-blur-sm border border-white/20 px-4 py-2 text-sm font-medium text-white mb-8"
              role="status"
              aria-label="Latest medical AI technology"
            >
              <Sparkles className="w-4 h-4 mr-2" aria-hidden="true" />
              <span className="sr-only">Status: </span>
              Napredni AI sa analizom medicinskih snimki
            </div>
            
            {/* Heading */}
            <div className="mb-6">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 leading-tight">
                {currentText.heading}
              </h1>
            </div>
            
            {/* Subheading */}
            <p 
              className="text-lg md:text-xl max-w-2xl mx-auto lg:mx-0 mb-8 leading-relaxed text-slate-200"
            >
              {currentText.subheading}
            </p>
            
            {/* Medical feature highlights */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8" role="list" aria-label="Ključne medicinske karakteristike">
              <div className="flex items-center justify-center lg:justify-start gap-3 p-3 bg-white/5 rounded-lg backdrop-blur-sm" role="listitem">
                <div className="bg-green-500/20 p-2 rounded-lg" aria-hidden="true">
                  <Activity className="w-4 h-4 text-green-300" />
                </div>
                <span className="text-white text-sm font-medium">Analiza Vitalnih Znakova</span>
              </div>
              <div className="flex items-center justify-center lg:justify-start gap-3 p-3 bg-white/5 rounded-lg backdrop-blur-sm" role="listitem">
                <div className="bg-blue-500/20 p-2 rounded-lg" aria-hidden="true">
                  <Zap className="w-4 h-4 text-blue-300" />
                </div>
                <span className="text-white text-sm font-medium">Automatska Trijaža</span>
              </div>
              <div className="flex items-center justify-center lg:justify-start gap-3 p-3 bg-white/5 rounded-lg backdrop-blur-sm" role="listitem">
                <div className="bg-purple-500/20 p-2 rounded-lg" aria-hidden="true">
                  <Shield className="w-4 h-4 text-purple-300" />
                </div>
                <span className="text-white text-sm font-medium">Sigurnost Podataka</span>
              </div>
            </div>

            {/* Advanced Medical Features */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
              <div className="flex items-center gap-3 p-3 bg-white/5 rounded-lg backdrop-blur-sm">
                <div className="bg-cyan-500/20 p-2 rounded-lg" aria-hidden="true">
                  <HeartPulse className="w-4 h-4 text-cyan-300" />
                </div>
                <div className="text-left">
                  <div className="text-white text-sm font-medium">Analiza RTG/CT/MR Snimki</div>
                  <div className="text-slate-400 text-xs">AI analiza medicinskih slika</div>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-white/5 rounded-lg backdrop-blur-sm">
                <div className="bg-orange-500/20 p-2 rounded-lg" aria-hidden="true">
                  <Clock className="w-4 h-4 text-orange-300" />
                </div>
                <div className="text-left">
                  <div className="text-white text-sm font-medium">24/7 Dostupnost</div>
                  <div className="text-slate-400 text-xs">Uvek dostupan za hitne slučajeve</div>
                </div>
              </div>
            </div>

            {/* Social Proof - Medical Professionals */}
            <div className="flex items-center justify-center lg:justify-start gap-4 mb-8">
              <div className="flex -space-x-2" aria-hidden="true">
                {[1, 2, 3, 4].map((i) => (
                  <div 
                    key={i}
                    className="w-8 h-8 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full border-2 border-slate-900"
                  />
                ))}
              </div>
              <div className="text-left">
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star key={star} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-sm text-slate-300">Korišten od strane 500+ medicinskih radnika</p>
              </div>
            </div>
            
            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start items-center">
              <Link
                href="/web-app"
                className="group relative bg-white text-slate-900 hover:bg-slate-100 font-semibold py-4 px-8 rounded-xl transition-all duration-300 flex items-center justify-center shadow-lg hover:shadow-xl focus:outline-none focus:ring-4 focus:ring-white/50 min-w-[160px]"
                aria-label="Započni medicinsku analizu"
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
              >
                Pokreni Analizu
                <ArrowRight 
                  className={`w-5 h-5 ml-2 transition-transform duration-300 ${
                    isHovering ? 'translate-x-1' : ''
                  }`} 
                  aria-hidden="true"
                />
              </Link>
              <Link
                href="/web-app"
                className="group bg-transparent border-2 border-white/30 hover:border-white/50 text-white font-semibold py-4 px-8 rounded-xl transition-all duration-300 hover:bg-white/10 flex items-center justify-center focus:outline-none focus:ring-4 focus:ring-white/50 min-w-[160px]"
                aria-label="Vidi demo medicinske aplikacije"
              >
                <Play className="w-4 h-4 mr-2" aria-hidden="true" />
                Vidi Demo
              </Link>
            </div>

            {/* Trust indicators for Medical Use */}
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-6 text-sm text-slate-400">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-400" aria-hidden="true" />
                EU medicinski standardi
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-400" aria-hidden="true" />
                Potpuna privatnost podataka
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-400" aria-hidden="true" />
                Trenutna analiza
              </div>
            </div>
          </div>
          
          {/* Right Column: Medical Dashboard Preview */}
          <div className="relative">
            {/* Main medical dashboard card */}
            <div 
              className="relative bg-slate-800/50 backdrop-blur-lg border border-white/10 rounded-2xl p-8 shadow-2xl"
              role="complementary"
              aria-label="Pregled medicinske AI aplikacije"
            >
              {/* Card header */}
              <div className="flex items-center justify-between mb-6" aria-hidden="true">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                </div>
                <div className="text-sm text-slate-400 flex items-center gap-2">
                  <HeartPulse className="w-4 h-4" />
                  Medicinski Asistent
                </div>
              </div>
              
              {/* Medical metrics grid */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-slate-700/50 rounded-lg p-4 border-l-4 border-green-500">
                  <div className="text-2xl font-bold text-white mb-1">98%</div>
                  <div className="text-sm text-green-400">Tačnost analize</div>
                </div>
                <div className="bg-slate-700/50 rounded-lg p-4 border-l-4 border-blue-500">
                  <div className="text-2xl font-bold text-white mb-1">45s</div>
                  <div className="text-sm text-blue-400">Prosječno vrijeme</div>
                </div>
                <div className="bg-slate-700/50 rounded-lg p-4 border-l-4 border-purple-500">
                  <div className="text-2xl font-bold text-white mb-1">24/7</div>
                  <div className="text-sm text-purple-400">Dostupnost</div>
                </div>
                <div className="bg-slate-700/50 rounded-lg p-4 border-l-4 border-cyan-500">
                  <div className="text-2xl font-bold text-white mb-1">500+</div>
                  <div className="text-sm text-cyan-400">Analiza dnevno</div>
                </div>
              </div>
              
              {/* Triage status */}
              <div className="bg-slate-700/30 rounded-lg p-4 mb-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="text-sm font-medium text-white">Status Trijaže</div>
                  <div className="text-xs text-slate-400">Real-time</div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-300">Hitna</span>
                    <div className="w-16 bg-red-500/20 rounded-full h-2">
                      <div className="bg-red-500 h-2 rounded-full w-3/4"></div>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-300">Urgentna</span>
                    <div className="w-16 bg-orange-500/20 rounded-full h-2">
                      <div className="bg-orange-500 h-2 rounded-full w-1/2"></div>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-300">Rutinska</span>
                    <div className="w-16 bg-green-500/20 rounded-full h-2">
                      <div className="bg-green-500 h-2 rounded-full w-1/4"></div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Recent activity */}
              <div className="bg-slate-700/30 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="text-sm font-medium text-white">Aktivna Analiza</div>
                  <div className="text-xs text-slate-400">Live</div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <div className="text-sm text-slate-300">Analiza vitalnih znakova...</div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                    <div className="text-sm text-slate-300">Procjena rizika...</div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></div>
                    <div className="text-sm text-slate-300">Generisanje preporuka...</div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Floating elements - Medical */}
            <div className="absolute -top-4 -right-4 bg-gradient-to-r from-blue-500 to-purple-500 text-white px-4 py-2 rounded-lg shadow-lg">
              <div className="text-sm font-semibold flex items-center gap-2">
                <Activity className="w-4 h-4" />
                Live Analiza
              </div>
            </div>
            
            <div className="absolute -bottom-4 -left-4 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-3">
              <div className="flex items-center gap-2 text-white text-sm">
                <Zap className="w-4 h-4 text-yellow-400" aria-hidden="true" />
                AI Powered
              </div>
            </div>

            {/* Additional medical badge */}
            <div className="absolute -bottom-6 right-10 bg-green-500/20 backdrop-blur-sm border border-green-500/30 rounded-lg px-3 py-1">
              <div className="flex items-center gap-2 text-green-300 text-xs">
                <Shield className="w-3 h-3" />
                HIPAA Compliant
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Bottom gradient fade */}
      <div 
        className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-slate-900 to-transparent pointer-events-none"
        aria-hidden="true"
      />
    </section>
  );
};

export default Hero;