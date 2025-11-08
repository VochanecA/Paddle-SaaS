'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { X, Cookie, Shield, CheckCircle } from 'lucide-react';

export function GDPRBanner() {
  const [isVisible, setIsVisible] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  useEffect(() => {
    // Provjeri da li je korisnik već dao pristanak
    const hasConsent = localStorage.getItem('gdpr-consent');
    if (!hasConsent) {
      setTimeout(() => setIsVisible(true), 1000);
    }
  }, []);

  const handleAcceptAll = () => {
    localStorage.setItem('gdpr-consent', JSON.stringify({
      necessary: true,
      analytics: true,
      marketing: true,
      preferences: true,
      timestamp: new Date().toISOString()
    }));
    setIsVisible(false);
  };

  const handleRejectAll = () => {
    localStorage.setItem('gdpr-consent', JSON.stringify({
      necessary: true, // Ovo uvijek mora biti true
      analytics: false,
      marketing: false,
      preferences: false,
      timestamp: new Date().toISOString()
    }));
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <>
      {/* Tamna pozadina */}
      <div className="fixed inset-0 bg-black/50 z-50" />
      
      {/* Banner */}
      <div className="fixed bottom-0 left-0 right-0 z-50">
        <div className="bg-gradient-to-r from-slate-900 via-blue-900 to-purple-900 border-t border-white/10">
          <div className="max-w-7xl mx-auto px-4 py-6">
            
            {!showSettings ? (
              // Glavni banner
              <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
                
                {/* Tekst */}
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <Cookie className="w-6 h-6 text-blue-400" />
                    <h3 className="text-xl font-bold text-white">Privacy & Cookies</h3>
                  </div>
                  
                  <p className="text-slate-300 mb-4">
                    Koristimo kolačiće za poboljšanje vašeg iskustva. 
                    <button 
                      onClick={() => setShowSettings(true)}
                      className="text-blue-400 hover:text-blue-300 underline ml-1"
                    >
                      Podešavanja
                    </button>
                  </p>

                  <Link 
                    href="/privacy" 
                    className="text-slate-400 hover:text-blue-400 text-sm flex items-center gap-1"
                  >
                    <Shield className="w-4 h-4" />
                    Privacy Policy
                  </Link>
                </div>

                {/* Dugmad */}
                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={handleRejectAll}
                    className="px-6 py-3 border-2 border-white/30 text-white hover:border-white/50 rounded-xl"
                  >
                    Odbaci sve
                  </button>
                  <button
                    onClick={handleAcceptAll}
                    className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl flex items-center gap-2"
                  >
                    <CheckCircle className="w-5 h-5" />
                    Prihvati sve
                  </button>
                </div>

                {/* X dugme */}
                <button
                  onClick={handleRejectAll}
                  className="absolute top-4 right-4 text-slate-400 hover:text-white"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            ) : (
              // Podešavanja
              <div className="bg-slate-800/50 rounded-2xl p-6 border border-white/10">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-white flex items-center gap-2">
                    <Cookie className="w-6 h-6 text-blue-400" />
                    Podešavanja kolačića
                  </h3>
                  <button
                    onClick={() => setShowSettings(false)}
                    className="text-slate-400 hover:text-white"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <div className="space-y-4 mb-6">
                  {/* Obavezni kolačići */}
                  <div className="flex items-center justify-between p-4 bg-slate-700/30 rounded-xl">
                    <div>
                      <h4 className="font-semibold text-white">Obavezni</h4>
                      <p className="text-slate-300 text-sm">Neophodni za rad stranice</p>
                    </div>
                    <input type="checkbox" checked disabled className="w-5 h-5" />
                  </div>

                  {/* Analitički kolačići */}
                  <div className="flex items-center justify-between p-4 bg-slate-700/30 rounded-xl">
                    <div>
                      <h4 className="font-semibold text-white">Analitički</h4>
                      <p className="text-slate-300 text-sm">Pomažu nam da poboljšamo stranicu</p>
                    </div>
                    <input 
                      type="checkbox" 
                      defaultChecked 
                      className="w-5 h-5 text-blue-600"
                    />
                  </div>

                  {/* Marketinški kolačići */}
                  <div className="flex items-center justify-between p-4 bg-slate-700/30 rounded-xl">
                    <div>
                      <h4 className="font-semibold text-white">Marketinški</h4>
                      <p className="text-slate-300 text-sm">Za personalizovane oglase</p>
                    </div>
                    <input 
                      type="checkbox" 
                      defaultChecked 
                      className="w-5 h-5 text-blue-600"
                    />
                  </div>
                </div>

                <div className="flex gap-3 justify-end">
                  <button
                    onClick={() => setShowSettings(false)}
                    className="px-6 py-3 border-2 border-white/30 text-white hover:border-white/50 rounded-xl"
                  >
                    Nazad
                  </button>
                  <button
                    onClick={handleAcceptAll}
                    className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl"
                  >
                    Sačuvaj
                  </button>
                </div>
              </div>
            )}
            
          </div>
        </div>
      </div>
    </>
  );
}