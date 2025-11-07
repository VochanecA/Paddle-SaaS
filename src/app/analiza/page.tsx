"use client";

import React, { useState, useMemo } from 'react';
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

  // Helper function to safely parse numbers
  const safeParseFloat = (value: string, defaultValue: number): number => {
    const parsed = parseFloat(value);
    return isNaN(parsed) || parsed <= 0 ? defaultValue : parsed;
  };

  const safeParseInt = (value: string, defaultValue: number): number => {
    const parsed = parseInt(value);
    return isNaN(parsed) || parsed <= 0 ? defaultValue : parsed;
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
        color: 'text-green-600', 
        bgColor: 'bg-green-50',
        icon: CheckCircle,
        recommendation: 'Nema potrebe za hitnim mjerama. Monitoring kapaciteta.'
      };
    } else if (utilization < 85) {
      return { 
        status: 'Približavanje granici', 
        color: 'text-yellow-600', 
        bgColor: 'bg-yellow-50',
        icon: AlertCircle,
        recommendation: 'Potreban kontinuirani monitoring. Planirati kratkoročne mjere.'
      };
    } else if (utilization < 95) {
      return { 
        status: 'Kritično opterećenje', 
        color: 'text-orange-600', 
        bgColor: 'bg-orange-50',
        icon: AlertCircle,
        recommendation: 'Hitne kratkoročne mjere potrebne. Učestala kašnjenja.'
      };
    } else {
      return { 
        status: 'PREZASIĆEN KAPACITET', 
        color: 'text-red-600', 
        bgColor: 'bg-red-50',
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-100 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
{/* Header */}
<div className="bg-white rounded-xl shadow-lg p-6 mb-6">
  <div className="flex items-center justify-between">
    <div className="flex items-center gap-4">
      <Calculator className="w-12 h-12 text-blue-600" />
      <div>
        <h1 className="text-3xl font-bold text-gray-800">
          Kalkulator analize kapaciteta aerodroma
        </h1>
        <p className="text-gray-600">
          Interaktivna analiza u skladu sa Pravilnikom CG
        </p>
      </div>
    </div>
    <a 
      href="/help" 
      className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
    >
      <HelpCircle className="w-5 h-5" />
      Pomoć i uputstva
    </a>
  </div>
</div>

        {/* Current Status Card */}
        <div className={`${currentStatus.bgColor} border-2 border-opacity-50 rounded-xl shadow-lg p-6 mb-6`}>
          <div className="flex items-start gap-4">
            <StatusIcon className={`w-12 h-12 ${currentStatus.color}`} />
            <div className="flex-1">
              <h2 className={`text-2xl font-bold ${currentStatus.color} mb-2`}>
                {currentStatus.status}
              </h2>
              <div className="grid md:grid-cols-3 gap-4 mb-3">
                <div>
                  <p className="text-sm text-gray-600">Trenutne operacije</p>
                  <p className="text-xl font-bold text-gray-800">
                    {demandParams.currentOperations} op/sat
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Deklarisani kapacitet</p>
                  <p className="text-xl font-bold text-gray-800">
                    {overallCapacity.hourlyCapacity} op/sat
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Iskorišćenost</p>
                  <p className={`text-xl font-bold ${currentStatus.color}`}>
                    {currentUtilization}%
                  </p>
                </div>
              </div>
              <p className="text-sm text-gray-700 bg-white bg-opacity-50 p-3 rounded">
                <strong>Preporuka:</strong> {currentStatus.recommendation}
              </p>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Input Parameters */}
          <div className="space-y-6">
            {/* Runway Parameters */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                🛫 Parametri piste
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Prosječan interval - VMC (min)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="0.1"
                    value={runwayParams.avgIntervalVMC}
                    onChange={(e) => setRunwayParams({...runwayParams, avgIntervalVMC: safeParseFloat(e.target.value, 2.5)})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Prosječan interval - IMC (min)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="0.1"
                    value={runwayParams.avgIntervalIMC}
                    onChange={(e) => setRunwayParams({...runwayParams, avgIntervalIMC: safeParseFloat(e.target.value, 4.0)})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    VMC procenat (%)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={runwayParams.vmcPercentage}
                    onChange={(e) => setRunwayParams({...runwayParams, vmcPercentage: safeParseInt(e.target.value, 70)})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Faktor mješovitih operacija (0-1)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0.1"
                    max="1"
                    value={runwayParams.mixedOperationsFactor}
                    onChange={(e) => setRunwayParams({...runwayParams, mixedOperationsFactor: safeParseFloat(e.target.value, 0.8)})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Sigurnosni faktor (0-1)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0.1"
                    max="1"
                    value={runwayParams.safetyFactor}
                    onChange={(e) => setRunwayParams({...runwayParams, safetyFactor: safeParseFloat(e.target.value, 0.85)})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            {/* Stand Parameters */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                🅿️ Parametri platformi
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Contact stands
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={standParams.contactStands}
                    onChange={(e) => setStandParams({...standParams, contactStands: safeParseInt(e.target.value, 6)})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Remote stands
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={standParams.remoteStands}
                    onChange={(e) => setStandParams({...standParams, remoteStands: safeParseInt(e.target.value, 8)})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Prosječno vrijeme turnaround (min)
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={standParams.avgTurnaroundTime}
                    onChange={(e) => setStandParams({...standParams, avgTurnaroundTime: safeParseInt(e.target.value, 40)})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Faktor iskorišćenosti (0-1)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0.1"
                    max="1"
                    value={standParams.utilizationFactor}
                    onChange={(e) => setStandParams({...standParams, utilizationFactor: safeParseFloat(e.target.value, 0.9)})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Radno vrijeme (sati)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="24"
                    value={standParams.operatingHours}
                    onChange={(e) => setStandParams({...standParams, operatingHours: safeParseInt(e.target.value, 16)})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            {/* Terminal Parameters */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                🏢 Parametri terminala
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Broj check-in šaltera
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={terminalParams.checkInCounters}
                    onChange={(e) => setTerminalParams({...terminalParams, checkInCounters: safeParseInt(e.target.value, 24)})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Broj security lanes
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={terminalParams.securityLanes}
                    onChange={(e) => setTerminalParams({...terminalParams, securityLanes: safeParseInt(e.target.value, 4)})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Putnika po šalteru/sat
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={terminalParams.paxPerCounterHour}
                    onChange={(e) => setTerminalParams({...terminalParams, paxPerCounterHour: safeParseInt(e.target.value, 25)})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Putnika po security lane/sat
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={terminalParams.paxPerSecurityHour}
                    onChange={(e) => setTerminalParams({...terminalParams, paxPerSecurityHour: safeParseInt(e.target.value, 150)})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            {/* Demand Parameters */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                📈 Parametri potražnje
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Trenutne operacije (peak hour)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={demandParams.currentOperations}
                    onChange={(e) => setDemandParams({...demandParams, currentOperations: safeParseInt(e.target.value, 18)})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Stopa rasta (% godišnje)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={demandParams.growthRate}
                    onChange={(e) => setDemandParams({...demandParams, growthRate: safeParseInt(e.target.value, 8)})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Period projekcije (godine)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={demandParams.projectionYears}
                    onChange={(e) => setDemandParams({...demandParams, projectionYears: safeParseInt(e.target.value, 3)})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Results */}
          <div className="space-y-6">
            {/* Runway Capacity Results */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <BarChart3 className="w-6 h-6 text-blue-600" />
                Kapacitet piste
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                  <span className="text-gray-700">VMC kapacitet:</span>
                  <span className="font-bold text-gray-900">{runwayCapacity.vmcCapacity} op/sat</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                  <span className="text-gray-700">IMC kapacitet:</span>
                  <span className="font-bold text-gray-900">{runwayCapacity.imcCapacity} op/sat</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                  <span className="text-gray-700">Ponderisani kapacitet:</span>
                  <span className="font-bold text-gray-900">{runwayCapacity.weightedCapacity} op/sat</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                  <span className="text-gray-700">Praktični kapacitet:</span>
                  <span className="font-bold text-gray-900">{runwayCapacity.practicalCapacity} op/sat</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-blue-50 border border-blue-200 rounded">
                  <span className="text-blue-700 font-medium">Deklarisani kapacitet:</span>
                  <span className="font-bold text-blue-900">{runwayCapacity.declaredCapacity} op/sat</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-green-50 border border-green-200 rounded">
                  <span className="text-green-700 font-medium">Dnevni kapacitet:</span>
                  <span className="font-bold text-green-900">{runwayCapacity.dailyCapacity} operacija</span>
                </div>
              </div>
            </div>

            {/* Stand Capacity Results */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                🅿️ Kapacitet platformi
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                  <span className="text-gray-700">Ukupno parking pozicija:</span>
                  <span className="font-bold text-gray-900">{standCapacity.totalStands}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-blue-50 border border-blue-200 rounded">
                  <span className="text-blue-700 font-medium">Satni kapacitet:</span>
                  <span className="font-bold text-blue-900">{standCapacity.hourlyCapacity} op/sat</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-green-50 border border-green-200 rounded">
                  <span className="text-green-700 font-medium">Dnevni kapacitet:</span>
                  <span className="font-bold text-green-900">{standCapacity.dailyCapacity} operacija</span>
                </div>
              </div>
            </div>

            {/* Terminal Capacity Results */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                🏢 Kapacitet terminala
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                  <span className="text-gray-700">Check-in kapacitet:</span>
                  <span className="font-bold text-gray-900">{terminalCapacity.checkInCapacity} pax/sat</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                  <span className="text-gray-700">Security kapacitet:</span>
                  <span className="font-bold text-gray-900">{terminalCapacity.securityCapacity} pax/sat</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-orange-50 border border-orange-200 rounded">
                  <span className="text-orange-700 font-medium">Usko grlo:</span>
                  <span className="font-bold text-orange-900">{terminalCapacity.bottleneck} pax/sat</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-green-50 border border-green-200 rounded">
                  <span className="text-green-700 font-medium">Dnevni kapacitet:</span>
                  <span className="font-bold text-green-900">{terminalCapacity.dailyCapacity} putnika</span>
                </div>
              </div>
            </div>

            {/* Overall Capacity Results */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                📊 Ukupni kapacitet
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-blue-50 border border-blue-200 rounded">
                  <span className="text-blue-700 font-medium">Satni kapacitet:</span>
                  <span className="font-bold text-blue-900">{overallCapacity.hourlyCapacity} op/sat</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-green-50 border border-green-200 rounded">
                  <span className="text-green-700 font-medium">Dnevni kapacitet:</span>
                  <span className="font-bold text-green-900">{overallCapacity.dailyCapacity} operacija</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-red-50 border border-red-200 rounded">
                  <span className="text-red-700 font-medium">Ograničavajući faktor:</span>
                  <span className="font-bold text-red-900">{overallCapacity.limitingFactor}</span>
                </div>
              </div>
            </div>

            {/* Demand Projections */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <TrendingUp className="w-6 h-6 text-purple-600" />
                Projekcije potražnje
              </h3>
              <div className="space-y-3">
                {demandAnalysis.map((projection) => (
                  <div key={projection.year} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                    <div>
                      <span className="text-gray-700">Godina {projection.year}:</span>
                      <span className="ml-2 font-bold text-gray-900">{projection.operations} op/sat</span>
                    </div>
                    <div className={`px-2 py-1 rounded text-sm font-medium ${
                      projection.utilizationRate < 70 ? 'bg-green-100 text-green-800' :
                      projection.utilizationRate < 85 ? 'bg-yellow-100 text-yellow-800' :
                      projection.utilizationRate < 95 ? 'bg-orange-100 text-orange-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {projection.utilizationRate}%
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={generateReport}
                  className="flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
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
                  className="flex items-center justify-center gap-2 px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-medium"
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