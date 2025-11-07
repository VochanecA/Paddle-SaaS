"use client";

import React, { useState, useMemo, useEffect } from 'react';
import { useTheme } from 'next-themes';
import { Calculator, AlertCircle, CheckCircle, TrendingUp, Download, BarChart3, Link, HelpCircle } from 'lucide-react';

interface RunwayParams {
  avgIntervalVMC: number;
  avgIntervalIMC: number;
  vmcPercentage: number;
  mixedOperationsFactor: number;
  safetyFactor: number;
}

interface StandParams {
  contactStands: number;
  remoteStands: number;
  avgTurnaroundTime: number;
  utilizationFactor: number;
  operatingHours: number;
}

interface TerminalParams {
  checkInCounters: number;
  securityLanes: number;
  paxPerCounterHour: number;
  paxPerSecurityHour: number;
}

interface DemandParams {
  currentOperations: number;
  growthRate: number;
  projectionYears: number;
}

const AirportCapacityCalculator: React.FC = () => {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  const [runwayParams, setRunwayParams] = useState<RunwayParams>({
    avgIntervalVMC: 2.5,
    avgIntervalIMC: 4.0,
    vmcPercentage: 70,
    mixedOperationsFactor: 0.80,
    safetyFactor: 0.85
  });

  const [standParams, setStandParams] = useState<StandParams>({
    contactStands: 6,
    remoteStands: 8,
    avgTurnaroundTime: 40,
    utilizationFactor: 0.90,
    operatingHours: 16
  });

  const [terminalParams, setTerminalParams] = useState<TerminalParams>({
    checkInCounters: 24,
    securityLanes: 4,
    paxPerCounterHour: 25,
    paxPerSecurityHour: 150
  });

  const [demandParams, setDemandParams] = useState<DemandParams>({
    currentOperations: 18,
    growthRate: 8,
    projectionYears: 3
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  // Helper function to safely parse numbers
  const safeParseFloat = (value: string, defaultValue: number): number => {
    const parsed = parseFloat(value);
    return isNaN(parsed) || parsed <= 0 ? defaultValue : parsed;
  };

  const safeParseInt = (value: string, defaultValue: number): number => {
    const parsed = parseInt(value);
    return isNaN(parsed) || parsed <= 0 ? defaultValue : parsed;
  };

  // Theme-based styles
  const isLight = mounted ? resolvedTheme === 'light' : true;

  const containerStyles = {
    light: 'bg-gradient-to-br from-slate-50 to-blue-100',
    dark: 'bg-gradient-to-br from-gray-900 to-blue-900'
  };

  const cardStyles = {
    light: 'bg-white text-gray-800 shadow-lg',
    dark: 'bg-gray-800 text-gray-100 shadow-xl'
  };

  const inputStyles = {
    light: 'bg-white border-gray-300 text-gray-900 focus:ring-blue-500 focus:border-transparent',
    dark: 'bg-gray-700 border-gray-600 text-gray-100 focus:ring-blue-400 focus:border-transparent placeholder-gray-400'
  };

  const statusCardStyles = {
    green: {
      light: 'bg-green-50 border-green-200 text-green-800',
      dark: 'bg-green-900/30 border-green-700 text-green-300'
    },
    yellow: {
      light: 'bg-yellow-50 border-yellow-200 text-yellow-800',
      dark: 'bg-yellow-900/30 border-yellow-700 text-yellow-300'
    },
    orange: {
      light: 'bg-orange-50 border-orange-200 text-orange-800',
      dark: 'bg-orange-900/30 border-orange-700 text-orange-300'
    },
    red: {
      light: 'bg-red-50 border-red-200 text-red-800',
      dark: 'bg-red-900/30 border-red-700 text-red-300'
    },
    gray: {
      light: 'bg-gray-50 text-gray-700',
      dark: 'bg-gray-700 text-gray-300'
    },
    blue: {
      light: 'bg-blue-50 border-blue-200 text-blue-800',
      dark: 'bg-blue-900/30 border-blue-700 text-blue-300'
    }
  };

  // Runway Capacity Calculations
  const runwayCapacity = useMemo(() => {
    const vmcCapacity = 60 / (runwayParams.avgIntervalVMC || 1);
    const imcCapacity = 60 / (runwayParams.avgIntervalIMC || 1);
    
    const vmcPercentage = Math.max(0, Math.min(100, runwayParams.vmcPercentage));
    
    const weightedCapacity = 
      (vmcCapacity * vmcPercentage / 100) +
      (imcCapacity * (100 - vmcPercentage) / 100);
    
    const mixedFactor = Math.max(0.1, Math.min(1, runwayParams.mixedOperationsFactor));
    const safetyFactor = Math.max(0.1, Math.min(1, runwayParams.safetyFactor));
    
    const practicalCapacity = weightedCapacity * mixedFactor;
    const declaredCapacity = Math.floor(practicalCapacity * safetyFactor);
    const dailyCapacity = declaredCapacity * (standParams.operatingHours || 1);
    
    return {
      vmcCapacity: Math.round(vmcCapacity),
      imcCapacity: Math.round(imcCapacity),
      weightedCapacity: Math.round(weightedCapacity * 10) / 10,
      practicalCapacity: Math.round(practicalCapacity * 10) / 10,
      declaredCapacity,
      dailyCapacity
    };
  }, [runwayParams, standParams.operatingHours]);

  // Stand Capacity Calculations
  const standCapacity = useMemo(() => {
    const totalStands = (standParams.contactStands || 0) + (standParams.remoteStands || 0);
    const turnaroundHours = Math.max(0.1, (standParams.avgTurnaroundTime || 1) / 60);
    const utilizationFactor = Math.max(0.1, Math.min(1, standParams.utilizationFactor));
    const operatingHours = Math.max(1, standParams.operatingHours);
    
    const operationsPerStand = (operatingHours / turnaroundHours) * utilizationFactor;
    const dailyCapacity = Math.floor(totalStands * operationsPerStand);
    const hourlyCapacity = Math.floor(dailyCapacity / operatingHours);
    
    return {
      totalStands,
      dailyCapacity,
      hourlyCapacity
    };
  }, [standParams]);

  // Terminal Capacity Calculations
  const terminalCapacity = useMemo(() => {
    const checkInCapacity = (terminalParams.checkInCounters || 0) * (terminalParams.paxPerCounterHour || 0);
    const securityCapacity = (terminalParams.securityLanes || 0) * (terminalParams.paxPerSecurityHour || 0);
    const bottleneck = Math.min(checkInCapacity, securityCapacity);
    const operatingHours = Math.max(1, standParams.operatingHours);
    
    return {
      checkInCapacity,
      securityCapacity,
      bottleneck,
      dailyCapacity: bottleneck * operatingHours
    };
  }, [terminalParams, standParams.operatingHours]);

  // Overall Capacity (limiting factor)
  const overallCapacity = useMemo(() => {
    const limiting = Math.min(
      runwayCapacity.declaredCapacity || 1,
      standCapacity.hourlyCapacity || 1
    );
    
    const operatingHours = Math.max(1, standParams.operatingHours);
    const dailyLimiting = limiting * operatingHours;
    
    return {
      hourlyCapacity: limiting,
      dailyCapacity: dailyLimiting,
      limitingFactor: limiting === runwayCapacity.declaredCapacity ? 'Pista' : 'Platforme'
    };
  }, [runwayCapacity, standCapacity, standParams.operatingHours]);

  // Demand Analysis
  const demandAnalysis = useMemo(() => {
    const projections = [];
    const currentOps = Math.max(0, demandParams.currentOperations);
    const growthRate = Math.max(0, demandParams.growthRate);
    const hourlyCapacity = Math.max(1, overallCapacity.hourlyCapacity);
    
    for (let year = 1; year <= (demandParams.projectionYears || 1); year++) {
      const projected = currentOps * Math.pow(1 + growthRate / 100, year);
      const utilizationRate = (projected / hourlyCapacity) * 100;
      
      projections.push({
        year,
        operations: Math.round(projected * 10) / 10,
        utilizationRate: Math.round(utilizationRate * 10) / 10
      });
    }
    return projections;
  }, [demandParams, overallCapacity]);

  // Current Utilization
  const currentUtilization = useMemo(() => {
    const currentOps = Math.max(0, demandParams.currentOperations);
    const hourlyCapacity = Math.max(1, overallCapacity.hourlyCapacity);
    const rate = (currentOps / hourlyCapacity) * 100;
    return Math.min(1000, Math.round(rate * 10) / 10); // Cap at 1000% for display
  }, [demandParams.currentOperations, overallCapacity.hourlyCapacity]);

  // Status Assessment
  const getStatusInfo = (utilization: number) => {
    if (utilization < 70) {
      return { 
        status: 'Dovoljan kapacitet', 
        color: 'text-green-600 dark:text-green-400',
        bgColor: isLight ? statusCardStyles.green.light : statusCardStyles.green.dark,
        icon: CheckCircle,
        recommendation: 'Nema potrebe za hitnim mjerama. Monitoring kapaciteta.'
      };
    } else if (utilization < 85) {
      return { 
        status: 'Približavanje granici', 
        color: 'text-yellow-600 dark:text-yellow-400',
        bgColor: isLight ? statusCardStyles.yellow.light : statusCardStyles.yellow.dark,
        icon: AlertCircle,
        recommendation: 'Potreban kontinuirani monitoring. Planirati kratkoročne mjere.'
      };
    } else if (utilization < 95) {
      return { 
        status: 'Kritično opterećenje', 
        color: 'text-orange-600 dark:text-orange-400',
        bgColor: isLight ? statusCardStyles.orange.light : statusCardStyles.orange.dark,
        icon: AlertCircle,
        recommendation: 'Hitne kratkoročne mjere potrebne. Učestala kašnjenja.'
      };
    } else {
      return { 
        status: 'PREZASIĆEN KAPACITET', 
        color: 'text-red-600 dark:text-red-400',
        bgColor: isLight ? statusCardStyles.red.light : statusCardStyles.red.dark,
        icon: AlertCircle,
        recommendation: 'HITNA INTERVENCIJA! Značajna kašnjenja. Potrebna koordinacija.'
      };
    }
  };

  const currentStatus = getStatusInfo(currentUtilization);
  const StatusIcon = currentStatus.icon;

  const generateReport = () => {
    const report = `
═══════════════════════════════════════════════════════════
IZVJEŠTAJ O ANALIZI KAPACITETA AERODROMA
Datum: ${new Date().toLocaleDateString('sr-Latn-ME')}
═══════════════════════════════════════════════════════════

1. ULAZNI PARAMETRI
-----------------------------------

PISTA:
• Prosječan interval (VMC): ${runwayParams.avgIntervalVMC} min
• Prosječan interval (IMC): ${runwayParams.avgIntervalIMC} min
• VMC procenat: ${runwayParams.vmcPercentage}%
• Faktor mješovitih operacija: ${runwayParams.mixedOperationsFactor}
• Sigurnosni faktor: ${runwayParams.safetyFactor}

PLATFORME:
• Contact stands: ${standParams.contactStands}
• Remote stands: ${standParams.remoteStands}
• Ukupno: ${standCapacity.totalStands}
• Prosječno vrijeme turnaround: ${standParams.avgTurnaroundTime} min
• Faktor iskorišćenosti: ${standParams.utilizationFactor}
• Radno vrijeme: ${standParams.operatingHours} sati

TERMINAL:
• Check-in šalteri: ${terminalParams.checkInCounters}
• Security lanes: ${terminalParams.securityLanes}
• Putnika/šalter/sat: ${terminalParams.paxPerCounterHour}
• Putnika/security/sat: ${terminalParams.paxPerSecurityHour}

POTRAŽNJA:
• Trenutne operacije (peak hour): ${demandParams.currentOperations}
• Stopa rasta: ${demandParams.growthRate}% godišnje
• Period projekcije: ${demandParams.projectionYears} godina


2. PRORAČUN KAPACITETA
-----------------------------------

KAPACITET PISTE:
• VMC kapacitet: ${runwayCapacity.vmcCapacity} op/sat
• IMC kapacitet: ${runwayCapacity.imcCapacity} op/sat
• Ponderisani kapacitet: ${runwayCapacity.weightedCapacity} op/sat
• Praktični kapacitet: ${runwayCapacity.practicalCapacity} op/sat
• Deklarisani kapacitet: ${runwayCapacity.declaredCapacity} op/sat
• Dnevni kapacitet: ${runwayCapacity.dailyCapacity} operacija

KAPACITET PLATFORMI:
• Satni kapacitet: ${standCapacity.hourlyCapacity} op/sat
• Dnevni kapacitet: ${standCapacity.dailyCapacity} operacija

KAPACITET TERMINALA:
• Check-in kapacitet: ${terminalCapacity.checkInCapacity} pax/sat
• Security kapacitet: ${terminalCapacity.securityCapacity} pax/sat
• Usko grlo: ${terminalCapacity.bottleneck} pax/sat
• Dnevni kapacitet: ${terminalCapacity.dailyCapacity} putnika

UKUPAN KAPACITET (ograničavajući faktor):
• Satni kapacitet: ${overallCapacity.hourlyCapacity} op/sat
• Dnevni kapacitet: ${overallCapacity.dailyCapacity} operacija
• Ograničavajući faktor: ${overallCapacity.limitingFactor}


3. ANALIZA ISKORIŠĆENOSTI
-----------------------------------

TRENUTNA SITUACIJA:
• Operacije (peak hour): ${demandParams.currentOperations}
• Deklarisani kapacitet: ${overallCapacity.hourlyCapacity} op/sat
• Iskorišćenost: ${currentUtilization}%
• Status: ${currentStatus.status}
• Preporuka: ${currentStatus.recommendation}

PROJEKCIJE:
${demandAnalysis.map(p => 
  `Godina ${p.year}: ${p.operations} op/sat → ${p.utilizationRate}% iskorišćenosti`
).join('\n')}


4. PREPORUKE
-----------------------------------

${currentUtilization < 70 ? `
✓ Kapacitet je dovoljan
✓ Nastaviti monitoring
✓ Planirati dugoročni razvoj
` : currentUtilization < 85 ? `
⚠ Potrebne kratkoročne mjere:
• Optimizacija raspodjele slotova
• CDM implementacija
• Monitoring u realnom vremenu
` : currentUtilization < 95 ? `
⚠⚠ HITNE MJERE POTREBNE:
• Optimizacija ATC procedura
• Dodatne platformske pozicije
• Proširenje radnog vremena
• Razmotriti status koordinisanog aerodroma
` : `
🚨 KRITIČNA SITUACIJA:
• HITNA promjena statusa u koordinisani aerodrom
• Imenovanje koordinatora slotova
• Osnivanje Koordinacionog odbora
• Infrastrukturne intervencije
• ATFM mjere
`}

${overallCapacity.limitingFactor === 'Pista' ? `
USKO GRLO: PISTA
Prioritetne mjere:
• Optimizacija runway occupancy time
• Rapid exit taxiways (RETs)
• Smanjenje intervala razdvajanja
• Poboljšanje ATC procedura
` : `
USKO GRLO: PLATFORME
Prioritetne mjere:
• Dodatne parking pozicije
• Brži turnaround procedures
• Remote stands razvoj
• Optimizacija stand allocation
`}

5. ZAKLJUČAK
-----------------------------------

Na osnovu analize, aerodrom ${currentUtilization >= 85 ? 'JE DOSTIGAO' : 'NIJE DOSTIGAO'} 
kritičnu iskorišćenost kapaciteta.

${currentUtilization >= 85 ? `
Preporučuje se:
1. Promjena statusa u KOORDINISANI AERODROM
2. Sprovođenje detaljne analize kapaciteta u skladu sa Pravilnikom
3. Formiranje Koordinacionog odbora
4. Imenovanje koordinatora slotova
5. Definisanje koordinacionih parametara
` : `
Preporučuje se:
1. Nastavak monitoringa kapaciteta
2. Priprema za budući rast
3. Planiranje investicija
`}

═══════════════════════════════════════════════════════════
KRAJ IZVJEŠTAJA
═══════════════════════════════════════════════════════════
`;

    const blob = new Blob([report], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Analiza_Kapaciteta_${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  if (!mounted) {
    return (
      <div className={`min-h-screen ${containerStyles.light} p-4 md:p-8`}>
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-16 bg-gray-200 rounded-xl mb-6"></div>
            <div className="h-32 bg-gray-200 rounded-xl mb-6"></div>
            <div className="grid lg:grid-cols-2 gap-6">
              <div className="space-y-6">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="h-64 bg-gray-200 rounded-xl"></div>
                ))}
              </div>
              <div className="space-y-6">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-48 bg-gray-200 rounded-xl"></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${isLight ? containerStyles.light : containerStyles.dark} p-4 md:p-8 transition-colors duration-300`}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className={`rounded-xl shadow-lg p-6 mb-6 ${isLight ? cardStyles.light : cardStyles.dark}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Calculator className="w-12 h-12 text-blue-600 dark:text-blue-400" />
              <div>
                <h1 className="text-3xl font-bold">
                  Kalkulator analize kapaciteta aerodroma
                </h1>
                <p className={`${isLight ? 'text-gray-600' : 'text-gray-400'}`}>
                  Interaktivna analiza u skladu sa Pravilnikom CG
                </p>
              </div>
            </div>
            <a 
              href="/help" 
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                isLight 
                  ? 'bg-blue-50 text-blue-600 hover:bg-blue-100' 
                  : 'bg-blue-900/30 text-blue-300 hover:bg-blue-900/50'
              }`}
            >
              <HelpCircle className="w-5 h-5" />
              Pomoć i uputstva
            </a>
          </div>
        </div>

        {/* Current Status Card */}
        <div className={`rounded-xl shadow-lg p-6 mb-6 border-2 border-opacity-50 ${currentStatus.bgColor}`}>
          <div className="flex items-start gap-4">
            <StatusIcon className={`w-12 h-12 ${currentStatus.color}`} />
            <div className="flex-1">
              <h2 className={`text-2xl font-bold ${currentStatus.color} mb-2`}>
                {currentStatus.status}
              </h2>
              <div className="grid md:grid-cols-3 gap-4 mb-3">
                <div>
                  <p className={`text-sm ${isLight ? 'text-gray-600' : 'text-gray-400'}`}>Trenutne operacije</p>
                  <p className="text-xl font-bold">
                    {demandParams.currentOperations} op/sat
                  </p>
                </div>
                <div>
                  <p className={`text-sm ${isLight ? 'text-gray-600' : 'text-gray-400'}`}>Deklarisani kapacitet</p>
                  <p className="text-xl font-bold">
                    {overallCapacity.hourlyCapacity} op/sat
                  </p>
                </div>
                <div>
                  <p className={`text-sm ${isLight ? 'text-gray-600' : 'text-gray-400'}`}>Iskorišćenost</p>
                  <p className={`text-xl font-bold ${currentStatus.color}`}>
                    {currentUtilization}%
                  </p>
                </div>
              </div>
              <p className={`text-sm p-3 rounded ${
                isLight ? 'bg-white bg-opacity-50 text-gray-700' : 'bg-black bg-opacity-30 text-gray-300'
              }`}>
                <strong>Preporuka:</strong> {currentStatus.recommendation}
              </p>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Input Parameters */}
          <div className="space-y-6">
            {/* Runway Parameters */}
            <div className={`rounded-xl shadow-lg p-6 ${isLight ? cardStyles.light : cardStyles.dark}`}>
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                🛫 Parametri piste
              </h3>
              <div className="space-y-4">
                {[
                  { label: 'Prosječan interval - VMC (min)', value: runwayParams.avgIntervalVMC, set: (v: number) => setRunwayParams({...runwayParams, avgIntervalVMC: v}), type: 'number', step: 0.1, min: 0.1 },
                  { label: 'Prosječan interval - IMC (min)', value: runwayParams.avgIntervalIMC, set: (v: number) => setRunwayParams({...runwayParams, avgIntervalIMC: v}), type: 'number', step: 0.1, min: 0.1 },
                  { label: 'VMC procenat (%)', value: runwayParams.vmcPercentage, set: (v: number) => setRunwayParams({...runwayParams, vmcPercentage: v}), type: 'number', min: 0, max: 100 },
                  { label: 'Faktor mješovitih operacija (0-1)', value: runwayParams.mixedOperationsFactor, set: (v: number) => setRunwayParams({...runwayParams, mixedOperationsFactor: v}), type: 'number', step: 0.01, min: 0.1, max: 1 },
                  { label: 'Sigurnosni faktor (0-1)', value: runwayParams.safetyFactor, set: (v: number) => setRunwayParams({...runwayParams, safetyFactor: v}), type: 'number', step: 0.01, min: 0.1, max: 1 }
                ].map((field, index) => (
                  <div key={index}>
                    <label className={`block text-sm font-medium mb-1 ${isLight ? 'text-gray-700' : 'text-gray-300'}`}>
                      {field.label}
                    </label>
                    <input
                      type={field.type}
                      step={field.step}
                      min={field.min}
                      max={field.max}
                      value={field.value}
                      onChange={(e) => field.set(safeParseFloat(e.target.value, field.value))}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:border-transparent ${inputStyles[isLight ? 'light' : 'dark']}`}
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Stand Parameters */}
            <div className={`rounded-xl shadow-lg p-6 ${isLight ? cardStyles.light : cardStyles.dark}`}>
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                🅿️ Parametri platformi
              </h3>
              <div className="space-y-4">
                {[
                  { label: 'Contact stands', value: standParams.contactStands, set: (v: number) => setStandParams({...standParams, contactStands: v}), type: 'number', min: 0 },
                  { label: 'Remote stands', value: standParams.remoteStands, set: (v: number) => setStandParams({...standParams, remoteStands: v}), type: 'number', min: 0 },
                  { label: 'Prosječno vrijeme turnaround (min)', value: standParams.avgTurnaroundTime, set: (v: number) => setStandParams({...standParams, avgTurnaroundTime: v}), type: 'number', min: 1 },
                  { label: 'Faktor iskorišćenosti (0-1)', value: standParams.utilizationFactor, set: (v: number) => setStandParams({...standParams, utilizationFactor: v}), type: 'number', step: 0.01, min: 0.1, max: 1 },
                  { label: 'Radno vrijeme (sati)', value: standParams.operatingHours, set: (v: number) => setStandParams({...standParams, operatingHours: v}), type: 'number', min: 1, max: 24 }
                ].map((field, index) => (
                  <div key={index}>
                    <label className={`block text-sm font-medium mb-1 ${isLight ? 'text-gray-700' : 'text-gray-300'}`}>
                      {field.label}
                    </label>
                    <input
                      type={field.type}
                      step={field.step}
                      min={field.min}
                      max={field.max}
                      value={field.value}
                      onChange={(e) => field.set(safeParseFloat(e.target.value, field.value))}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:border-transparent ${inputStyles[isLight ? 'light' : 'dark']}`}
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Terminal Parameters */}
            <div className={`rounded-xl shadow-lg p-6 ${isLight ? cardStyles.light : cardStyles.dark}`}>
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                🏢 Parametri terminala
              </h3>
              <div className="space-y-4">
                {[
                  { label: 'Broj check-in šaltera', value: terminalParams.checkInCounters, set: (v: number) => setTerminalParams({...terminalParams, checkInCounters: v}), type: 'number', min: 0 },
                  { label: 'Broj security lanes', value: terminalParams.securityLanes, set: (v: number) => setTerminalParams({...terminalParams, securityLanes: v}), type: 'number', min: 0 },
                  { label: 'Putnika po šalteru/sat', value: terminalParams.paxPerCounterHour, set: (v: number) => setTerminalParams({...terminalParams, paxPerCounterHour: v}), type: 'number', min: 0 },
                  { label: 'Putnika po security lane/sat', value: terminalParams.paxPerSecurityHour, set: (v: number) => setTerminalParams({...terminalParams, paxPerSecurityHour: v}), type: 'number', min: 0 }
                ].map((field, index) => (
                  <div key={index}>
                    <label className={`block text-sm font-medium mb-1 ${isLight ? 'text-gray-700' : 'text-gray-300'}`}>
                      {field.label}
                    </label>
                    <input
                      type={field.type}
                      min={field.min}
                      value={field.value}
                      onChange={(e) => field.set(safeParseInt(e.target.value, field.value))}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:border-transparent ${inputStyles[isLight ? 'light' : 'dark']}`}
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Demand Parameters */}
            <div className={`rounded-xl shadow-lg p-6 ${isLight ? cardStyles.light : cardStyles.dark}`}>
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                📈 Parametri potražnje
              </h3>
              <div className="space-y-4">
                {[
                  { label: 'Trenutne operacije (peak hour)', value: demandParams.currentOperations, set: (v: number) => setDemandParams({...demandParams, currentOperations: v}), type: 'number', min: 0 },
                  { label: 'Stopa rasta (% godišnje)', value: demandParams.growthRate, set: (v: number) => setDemandParams({...demandParams, growthRate: v}), type: 'number', min: 0 },
                  { label: 'Period projekcije (godine)', value: demandParams.projectionYears, set: (v: number) => setDemandParams({...demandParams, projectionYears: v}), type: 'number', min: 1, max: 10 }
                ].map((field, index) => (
                  <div key={index}>
                    <label className={`block text-sm font-medium mb-1 ${isLight ? 'text-gray-700' : 'text-gray-300'}`}>
                      {field.label}
                    </label>
                    <input
                      type={field.type}
                      min={field.min}
                      max={field.max}
                      value={field.value}
                      onChange={(e) => field.set(safeParseInt(e.target.value, field.value))}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:border-transparent ${inputStyles[isLight ? 'light' : 'dark']}`}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Results */}
          <div className="space-y-6">
            {/* Runway Capacity Results */}
            <div className={`rounded-xl shadow-lg p-6 ${isLight ? cardStyles.light : cardStyles.dark}`}>
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                <BarChart3 className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                Kapacitet piste
              </h3>
              <div className="space-y-3">
                {[
                  { label: 'VMC kapacitet:', value: runwayCapacity.vmcCapacity, style: statusCardStyles.gray },
                  { label: 'IMC kapacitet:', value: runwayCapacity.imcCapacity, style: statusCardStyles.gray },
                  { label: 'Ponderisani kapacitet:', value: runwayCapacity.weightedCapacity, style: statusCardStyles.gray },
                  { label: 'Praktični kapacitet:', value: runwayCapacity.practicalCapacity, style: statusCardStyles.gray },
                  { label: 'Deklarisani kapacitet:', value: runwayCapacity.declaredCapacity, style: statusCardStyles.blue },
                  { label: 'Dnevni kapacitet:', value: runwayCapacity.dailyCapacity, style: statusCardStyles.green }
                ].map((item, index) => (
                  <div key={index} className={`flex justify-between items-center p-3 rounded ${
                    isLight ? item.style.light : item.style.dark
                  }`}>
                    <span>{item.label}</span>
                    <span className="font-bold">{item.value} {item.label.includes('kapacitet:') ? 'op/sat' : 'operacija'}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Stand Capacity Results */}
            <div className={`rounded-xl shadow-lg p-6 ${isLight ? cardStyles.light : cardStyles.dark}`}>
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                🅿️ Kapacitet platformi
              </h3>
              <div className="space-y-3">
                {[
                  { label: 'Ukupno parking pozicija:', value: standCapacity.totalStands, style: statusCardStyles.gray },
                  { label: 'Satni kapacitet:', value: standCapacity.hourlyCapacity, style: statusCardStyles.blue },
                  { label: 'Dnevni kapacitet:', value: standCapacity.dailyCapacity, style: statusCardStyles.green }
                ].map((item, index) => (
                  <div key={index} className={`flex justify-between items-center p-3 rounded ${
                    isLight ? item.style.light : item.style.dark
                  }`}>
                    <span>{item.label}</span>
                    <span className="font-bold">{item.value} {item.label.includes('pozicija:') ? '' : 'operacija'}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Terminal Capacity Results */}
            <div className={`rounded-xl shadow-lg p-6 ${isLight ? cardStyles.light : cardStyles.dark}`}>
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                🏢 Kapacitet terminala
              </h3>
              <div className="space-y-3">
                {[
                  { label: 'Check-in kapacitet:', value: terminalCapacity.checkInCapacity, style: statusCardStyles.gray },
                  { label: 'Security kapacitet:', value: terminalCapacity.securityCapacity, style: statusCardStyles.gray },
                  { label: 'Usko grlo:', value: terminalCapacity.bottleneck, style: statusCardStyles.orange },
                  { label: 'Dnevni kapacitet:', value: terminalCapacity.dailyCapacity, style: statusCardStyles.green }
                ].map((item, index) => (
                  <div key={index} className={`flex justify-between items-center p-3 rounded ${
                    isLight ? item.style.light : item.style.dark
                  }`}>
                    <span>{item.label}</span>
                    <span className="font-bold">{item.value} {item.label.includes('putnika') ? 'putnika' : 'pax/sat'}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Overall Capacity Results */}
            <div className={`rounded-xl shadow-lg p-6 ${isLight ? cardStyles.light : cardStyles.dark}`}>
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                📊 Ukupni kapacitet
              </h3>
              <div className="space-y-3">
                {[
                  { label: 'Satni kapacitet:', value: overallCapacity.hourlyCapacity, style: statusCardStyles.blue },
                  { label: 'Dnevni kapacitet:', value: overallCapacity.dailyCapacity, style: statusCardStyles.green },
                  { label: 'Ograničavajući faktor:', value: overallCapacity.limitingFactor, style: statusCardStyles.red }
                ].map((item, index) => (
                  <div key={index} className={`flex justify-between items-center p-3 rounded ${
                    isLight ? item.style.light : item.style.dark
                  }`}>
                    <span>{item.label}</span>
                    <span className="font-bold">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Demand Projections */}
            <div className={`rounded-xl shadow-lg p-6 ${isLight ? cardStyles.light : cardStyles.dark}`}>
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                <TrendingUp className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                Projekcije potražnje
              </h3>
              <div className="space-y-3">
                {demandAnalysis.map((projection) => (
                  <div key={projection.year} className={`flex justify-between items-center p-3 rounded ${
                    isLight ? statusCardStyles.gray.light : statusCardStyles.gray.dark
                  }`}>
                    <div>
                      <span>Godina {projection.year}:</span>
                      <span className="ml-2 font-bold">{projection.operations} op/sat</span>
                    </div>
                    <div className={`px-2 py-1 rounded text-sm font-medium ${
                      projection.utilizationRate < 70 ? (isLight ? 'bg-green-100 text-green-800' : 'bg-green-900/30 text-green-300') :
                      projection.utilizationRate < 85 ? (isLight ? 'bg-yellow-100 text-yellow-800' : 'bg-yellow-900/30 text-yellow-300') :
                      projection.utilizationRate < 95 ? (isLight ? 'bg-orange-100 text-orange-800' : 'bg-orange-900/30 text-orange-300') :
                      (isLight ? 'bg-red-100 text-red-800' : 'bg-red-900/30 text-red-300')
                    }`}>
                      {projection.utilizationRate}%
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className={`rounded-xl shadow-lg p-6 ${isLight ? cardStyles.light : cardStyles.dark}`}>
              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={generateReport}
                  className="flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium"
                >
                  <Download className="w-5 h-5" />
                  Preuzmi izvještaj
                </button>
                <button
                  onClick={() => {
                    setRunwayParams({
                      avgIntervalVMC: 2.5,
                      avgIntervalIMC: 4.0,
                      vmcPercentage: 70,
                      mixedOperationsFactor: 0.80,
                      safetyFactor: 0.85
                    });
                    setStandParams({
                      contactStands: 6,
                      remoteStands: 8,
                      avgTurnaroundTime: 40,
                      utilizationFactor: 0.90,
                      operatingHours: 16
                    });
                    setTerminalParams({
                      checkInCounters: 24,
                      securityLanes: 4,
                      paxPerCounterHour: 25,
                      paxPerSecurityHour: 150
                    });
                    setDemandParams({
                      currentOperations: 18,
                      growthRate: 8,
                      projectionYears: 3
                    });
                  }}
                  className="flex items-center justify-center gap-2 px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors font-medium"
                >
                  Resetuj parametre
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AirportCapacityCalculator;