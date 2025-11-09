'use client';

import { useState, useEffect, useCallback } from 'react';
import { Heart, Thermometer, Gauge, Activity, TrendingUp, Download, Wifi, WifiOff } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

interface VitalSigns {
  heartRate: number;
  bloodPressure: { systolic: number; diastolic: number };
  temperature: number;
  oxygenSaturation: number;
  respiratoryRate: number;
}

interface VitalSignsMonitorProps {
  initialVitals?: Partial<VitalSigns>;
  realTime?: boolean;
  language: 'montenegrin' | 'english';
  onVitalsUpdate?: (vitals: VitalSigns) => void;
}

interface VitalCard {
  icon: LucideIcon;
  label: string;
  value: string | number;
  unit: string;
  type: 'heartRate' | 'bloodPressure' | 'temperature' | 'oxygenSaturation' | 'respiratoryRate';
}

interface VitalStatus {
  status: 'normal' | 'elevated' | 'low' | 'critical';
  color: string;
}

interface GoogleFitData {
  heartRate?: number;
  bloodPressure?: { systolic: number; diastolic: number };
  oxygenSaturation?: number;
  respiratoryRate?: number;
}

const vitalTranslations = {
  montenegrin: {
    heartRate: 'Puls',
    bloodPressure: 'Krvni pritisak',
    temperature: 'Temperatura',
    oxygenSaturation: 'Zasićenje kiseonikom',
    respiratoryRate: 'Frekvencija disanja',
    normal: 'Normalno',
    elevated: 'Povišeno',
    low: 'Nisko',
    critical: 'Kritično',
    live: 'U toku',
    paused: 'Pauzirano',
    realTimeMonitoring: 'Real-time praćenje vitalnih znakova',
    dataUpdateInfo: 'Podaci se automatski ažuriraju svake 2 sekunde',
    importFromGoogleFit: 'Uvezi iz Google Fit',
    connecting: 'Povezivanje...',
    connected: 'Povezano',
    disconnected: 'Nepovezano',
    importSuccess: 'Podaci uspješno uveženi',
    importError: 'Greška pri uvozu podataka'
  },
  english: {
    heartRate: 'Heart Rate',
    bloodPressure: 'Blood Pressure',
    temperature: 'Temperature',
    oxygenSaturation: 'Oxygen Saturation',
    respiratoryRate: 'Respiratory Rate',
    normal: 'Normal',
    elevated: 'Elevated',
    low: 'Low',
    critical: 'Critical',
    live: 'Live',
    paused: 'Paused',
    realTimeMonitoring: 'Real-time vital signs monitoring',
    dataUpdateInfo: 'Data updates automatically every 2 seconds',
    importFromGoogleFit: 'Import from Google Fit',
    connecting: 'Connecting...',
    connected: 'Connected',
    disconnected: 'Disconnected',
    importSuccess: 'Data imported successfully',
    importError: 'Error importing data'
  }
} as const;

// Utility function to round to 2 decimals
const roundToTwo = (num: number): number => Math.round((num + Number.EPSILON) * 100) / 100;

// Mock Google Fit API service
class GoogleFitService {
  private static instance: GoogleFitService;
  private isConnected = false;

  static getInstance(): GoogleFitService {
    if (!GoogleFitService.instance) {
      GoogleFitService.instance = new GoogleFitService();
    }
    return GoogleFitService.instance;
  }

  async connect(): Promise<boolean> {
    // Simulate API connection
    await new Promise(resolve => setTimeout(resolve, 1500));
    this.isConnected = true;
    return true;
  }

  async getVitalData(): Promise<GoogleFitData> {
    if (!this.isConnected) {
      throw new Error('Not connected to Google Fit');
    }

    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Generate realistic mock data based on current time for variation
    const now = new Date();
    const timeFactor = Math.sin(now.getHours() * 0.2618 + now.getMinutes() * 0.00436);

    return {
      heartRate: roundToTwo(72 + timeFactor * 8),
      bloodPressure: {
        systolic: roundToTwo(118 + timeFactor * 6),
        diastolic: roundToTwo(76 + timeFactor * 4)
      },
      oxygenSaturation: roundToTwo(97 + timeFactor * 1.5),
      respiratoryRate: roundToTwo(15 + timeFactor * 3)
    };
  }

  disconnect(): void {
    this.isConnected = false;
  }
}

export default function VitalSignsMonitor({ 
  initialVitals, 
  realTime = false, 
  language,
  onVitalsUpdate 
}: VitalSignsMonitorProps) {
  const [vitals, setVitals] = useState<VitalSigns>({
    heartRate: 75,
    bloodPressure: { systolic: 120, diastolic: 80 },
    temperature: 37.0,
    oxygenSaturation: 98,
    respiratoryRate: 16,
    ...initialVitals
  });

  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [isGoogleFitConnected, setIsGoogleFitConnected] = useState<boolean>(false);
  const [isImporting, setIsImporting] = useState<boolean>(false);
  const [importMessage, setImportMessage] = useState<string>('');
  const t = vitalTranslations[language];

  const getStatus = useCallback((value: number, type: string): VitalStatus => {
    switch (type) {
      case 'heartRate':
        if (value < 60) return { status: 'low', color: 'text-blue-500' };
        if (value > 100) return { status: 'elevated', color: 'text-orange-500' };
        return { status: 'normal', color: 'text-green-500' };
      
      case 'bloodPressure':
        if (value > 130) return { status: 'elevated', color: 'text-orange-500' };
        if (value < 90) return { status: 'low', color: 'text-blue-500' };
        return { status: 'normal', color: 'text-green-500' };
      
      case 'temperature':
        if (value > 37.5) return { status: 'elevated', color: 'text-orange-500' };
        if (value < 36.0) return { status: 'low', color: 'text-blue-500' };
        return { status: 'normal', color: 'text-green-500' };
      
      case 'oxygenSaturation':
        if (value < 95) return { status: 'critical', color: 'text-red-500' };
        if (value < 97) return { status: 'low', color: 'text-orange-500' };
        return { status: 'normal', color: 'text-green-500' };
      
      case 'respiratoryRate':
        if (value < 12) return { status: 'low', color: 'text-blue-500' };
        if (value > 20) return { status: 'elevated', color: 'text-orange-500' };
        return { status: 'normal', color: 'text-green-500' };
      
      default:
        return { status: 'normal', color: 'text-green-500' };
    }
  }, []);

  const vitalCards: VitalCard[] = [
    {
      icon: Heart,
      label: t.heartRate,
      value: roundToTwo(vitals.heartRate),
      unit: 'bpm',
      type: 'heartRate'
    },
    {
      icon: Gauge,
      label: t.bloodPressure,
      value: `${roundToTwo(vitals.bloodPressure.systolic)}/${roundToTwo(vitals.bloodPressure.diastolic)}`,
      unit: 'mmHg',
      type: 'bloodPressure'
    },
    {
      icon: Thermometer,
      label: t.temperature,
      value: roundToTwo(vitals.temperature),
      unit: '°C',
      type: 'temperature'
    },
    {
      icon: Activity,
      label: t.oxygenSaturation,
      value: roundToTwo(vitals.oxygenSaturation),
      unit: '%',
      type: 'oxygenSaturation'
    },
    {
      icon: TrendingUp,
      label: t.respiratoryRate,
      value: roundToTwo(vitals.respiratoryRate),
      unit: 'rpm',
      type: 'respiratoryRate'
    }
  ];

  // Real-time monitoring effect
  useEffect(() => {
    if (!realTime) return;

    const interval = setInterval(() => {
      setVitals(current => {
        const newVitals = {
          heartRate: roundToTwo(Math.max(60, Math.min(120, current.heartRate + (Math.random() - 0.5) * 4))),
          bloodPressure: {
            systolic: roundToTwo(Math.max(110, Math.min(140, current.bloodPressure.systolic + (Math.random() - 0.5) * 3))),
            diastolic: roundToTwo(Math.max(70, Math.min(90, current.bloodPressure.diastolic + (Math.random() - 0.5) * 2)))
          },
          temperature: roundToTwo(Math.max(36.5, Math.min(37.5, current.temperature + (Math.random() - 0.5) * 0.2))),
          oxygenSaturation: roundToTwo(Math.max(95, Math.min(100, current.oxygenSaturation + (Math.random() - 0.5) * 1))),
          respiratoryRate: roundToTwo(Math.max(12, Math.min(20, current.respiratoryRate + (Math.random() - 0.5) * 1)))
        };

        // Call update callback if provided
        onVitalsUpdate?.(newVitals);
        
        return newVitals;
      });
    }, 2000);

    setIsConnected(true);
    return () => {
      clearInterval(interval);
      setIsConnected(false);
    };
  }, [realTime, onVitalsUpdate]);

  // Google Fit integration
  const handleGoogleFitImport = async (): Promise<void> => {
    setIsImporting(true);
    setImportMessage('');

    try {
      const googleFit = GoogleFitService.getInstance();
      
      if (!isGoogleFitConnected) {
        setImportMessage(t.connecting);
        await googleFit.connect();
        setIsGoogleFitConnected(true);
      }

      setImportMessage(language === 'montenegrin' ? 'Uvoz podataka...' : 'Importing data...');
      const fitData = await googleFit.getVitalData();

      setVitals(current => {
        const newVitals = {
          ...current,
          ...fitData,
          bloodPressure: fitData.bloodPressure || current.bloodPressure
        };

        // Call update callback if provided
        onVitalsUpdate?.(newVitals);
        
        return newVitals;
      });

      setImportMessage(t.importSuccess);
      
      // Clear success message after 3 seconds
      setTimeout(() => setImportMessage(''), 3000);
    } catch (error) {
      console.error('Google Fit import error:', error);
      setImportMessage(t.importError);
      
      // Clear error message after 5 seconds
      setTimeout(() => setImportMessage(''), 5000);
    } finally {
      setIsImporting(false);
    }
  };

  const disconnectGoogleFit = (): void => {
    const googleFit = GoogleFitService.getInstance();
    googleFit.disconnect();
    setIsGoogleFitConnected(false);
    setImportMessage(t.disconnected);
    
    setTimeout(() => setImportMessage(''), 3000);
  };

  return (
    <div className="bg-white/90 dark:bg-gray-900/90 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
          <Activity className="w-6 h-6 text-blue-500" />
          {language === 'montenegrin' ? 'Monitor Vitalnih Znakova-DEMO ** NISU STVARNI PODACI**' : 'Vital Signs Monitor-DEMO ** NOT REAL DATA**'}
        </h3>
        
        <div className="flex items-center gap-4">
          {/* Google Fit Connection Status */}
          <div className={`flex items-center gap-2 text-sm ${isGoogleFitConnected ? 'text-green-500' : 'text-gray-500'}`}>
            {isGoogleFitConnected ? (
              <Wifi className="w-4 h-4" />
            ) : (
              <WifiOff className="w-4 h-4" />
            )}
            {isGoogleFitConnected ? t.connected : t.disconnected}
          </div>

          {/* Real-time Status */}
          <div className={`flex items-center gap-2 text-sm ${isConnected ? 'text-green-500' : 'text-gray-500'}`}>
            <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-gray-500'}`} />
            {isConnected ? t.live : t.paused}
          </div>
        </div>
      </div>

      {/* Import Controls */}
      <div className="mb-6 flex flex-col sm:flex-row gap-4 items-center justify-between p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
        <div className="flex-1">
          <p className="text-sm font-medium text-blue-800 dark:text-blue-300">
            {language === 'montenegrin' 
              ? 'Integracija sa Google Fit' 
              : 'Google Fit Integration'
            }
          </p>
          <p className="text-xs text-blue-600 dark:text-blue-400">
            {language === 'montenegrin'
              ? 'Uvezite stvarne podatke o vitalnim znakovima'
              : 'Import real vital signs data'
            }
          </p>
        </div>
        
        <div className="flex gap-2">
          {isGoogleFitConnected ? (
            <button
              onClick={disconnectGoogleFit}
              disabled={isImporting}
              className="flex items-center gap-2 px-4 py-2 text-sm bg-red-100 hover:bg-red-200 text-red-700 dark:bg-red-900/30 dark:hover:bg-red-900/50 dark:text-red-300 rounded-lg transition-colors disabled:opacity-50"
              type="button"
            >
              <WifiOff className="w-4 h-4" />
              {language === 'montenegrin' ? 'Diskonektuj' : 'Disconnect'}
            </button>
          ) : null}
          
          <button
            onClick={handleGoogleFitImport}
            disabled={isImporting}
            className="flex items-center gap-2 px-4 py-2 text-sm bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            type="button"
          >
            {isImporting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                {language === 'montenegrin' ? 'Uvoz...' : 'Importing...'}
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                {t.importFromGoogleFit}
              </>
            )}
          </button>
        </div>
      </div>

      {/* Import Message */}
      {importMessage && (
        <div className={`mb-4 p-3 rounded-lg text-sm font-medium ${
          importMessage.includes('Greška') || importMessage.includes('Error') || importMessage.includes('Nepovezano') || importMessage.includes('Disconnected')
            ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
            : 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
        }`}>
          {importMessage}
        </div>
      )}

      {/* Vital Signs Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {vitalCards.map((card) => {
          const numericValue = typeof card.value === 'string' 
            ? parseFloat(card.value.split('/')[0] || '0') 
            : card.value;
          
          const status = getStatus(numericValue, card.type);
          
          return (
            <div 
              key={card.type}
              className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 text-center border-2 border-transparent hover:border-blue-200 dark:hover:border-blue-800 transition-colors group"
            >
              <div className="flex justify-center mb-2">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg group-hover:scale-110 transition-transform">
                  <card.icon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
              
              <div className={`text-2xl font-bold ${status.color} mb-1`}>
                {typeof card.value === 'number' ? card.value.toFixed(2) : card.value}
                <span className="text-sm text-gray-500 ml-1">{card.unit}</span>
              </div>
              
              <div className="text-xs text-gray-600 dark:text-gray-400 font-medium">
                {card.label}
              </div>
              
              <div className={`text-xs mt-1 ${status.color}`}>
                {t[status.status]}
              </div>
            </div>
          );
        })}
      </div>

      {/* Real-time Info */}
      {realTime && (
        <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
          <div className="flex items-center gap-3">
            <TrendingUp className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <div>
              <p className="text-sm font-medium text-blue-800 dark:text-blue-300">
                {t.realTimeMonitoring}
              </p>
              <p className="text-xs text-blue-600 dark:text-blue-400">
                {t.dataUpdateInfo}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}