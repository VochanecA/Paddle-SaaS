'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import type { User } from '@supabase/supabase-js';
import { HeartPulse, FlaskConical, Stethoscope, AlertTriangle, Syringe, Clipboard, Triangle, Wrench, Download, Phone, Languages, MapPin } from 'lucide-react';
import Image from 'next/image';
import MedicalImageAnalysis from '@/components/MedicalImageAnalysis';
import VitalSignsMonitor from '@/components/VitalSignsMonitor';
import EmergencyProtocols from '@/components/EmergencyProtocols';
import DrugInteractions from '@/components/DrugInteractions';
import Telemedicine from '@/components/Telemedicine';
import GeneralDiagnosis from '@/components/Diagnosis';
import LaboratoryAnalyzer from '@/components/LabAnalysis';
// Types
interface AnalysisResult {
  summary: string;
  risks: { label: string; severity: number }[];
  keywords: string[];
  immediateActions: string[];
  differentialDiagnosis: string[];
  drugDosage: string;
  triageLevel: 'immediate' | 'urgent' | 'routine';
  triageExplanation: string;
}

// Translation system
const translations = {
  montenegrin: {
    // Header
    title: "AI Asistent za Hitne Slučajeve",
    subtitle: "Unesite podatke o pacijentu za trenutnu AI-analizu i preporuke za hitne medicinske slučajeve",
    
    // Patient Data
    patientData: "Podaci o pacijentu",
    age: "Starost (godine)",
    weight: "Težina (kg)",
    gender: "Spol",
    male: "Muški",
    female: "Ženski",
    other: "Ostalo",
    allergies: "Poznate alergije",
    medications: "Trenutne terapije",
    allergiesPlaceholder: "Npr. penicilin",
    medicationsPlaceholder: "Npr. metformin",
    
    // Location
    location: "Lokacija pacijenta",
    getLocation: "Dobij trenutnu lokaciju",
    gettingLocation: "Dobijanje lokacije...",
    remove: "Ukloni",
    locationNote: "Lokacija će biti uključena u AI analizu i izvještaje",
    
    // Vitals
    vitals: "Vitalni znakovi i protokol",
    emergencyProtocol: "Protokol za hitne slučajeve",
    selectProtocol: "Odaberite protokol...",
    bloodPressure: "Krvni pritisak",
    systolic: "Sistolički (gornji)",
    diastolic: "Dijastolički (donji)",
    heartRate: "Puls (bpm)",
    temperature: "Temperatura (°C)",
    bloodSugar: "Šećer u krvi",
    
    // Symptoms
    symptoms: "Simptomi i bilješke",
    selectSymptoms: "Odaberite simptome:",
    notes: "Dodatne bilješke",
    notesPlaceholder: "Unesite relevantne detalje o situaciji...",
    
    // Buttons
    analyze: "Analiziraj podatke pacijenta",
    analyzing: "Analiziranje podataka...",
    pdfReport: "PDF Izvještaj",
    generatingPdf: "Generiranje PDF-a...",
    
    // Results
    conditionOverview: "Pregled stanja",
    immediateActions: "Neposredne akcije",
    differentialDiagnosis: "Diferencijalna dijagnoza",
    recommendedMedication: "Preporučeni lijek",
    keyTerms: "Ključne riječi",
    riskAssessment: "Procjena rizika",
    
    // Emergency
    emergencyNumbers: "Hitni brojevi",
    clickToCall: "Kliknite za poziv",
    importantNotice: "Važna napomena",
    emergencyNotice: "U slučaju hitne medicinske situacije, odmah pozovite hitnu službu. Ovaj AI asistent služi isključivo za edukacijske i simulacijske svrhe.",
    
    // Triage
    triage: "Trijaža",
    immediateTriage: "HITNA TRIJAŽA",
    urgentTriage: "URGENTNA TRIJAŽA",
    routineTriage: "RUTINSKA TRIJAŽA",
    immediateDesc: "Zahtijeva odmahnu medicinsku intervenciju",
    urgentDesc: "Zahtijeva brzu medicinsku pažnju",
    routineDesc: "Može sačekati redovnu medicinsku procjenu",
    priority1: "PRIORITET 1",
    priority2: "PRIORITET 2",
    priority3: "PRIORITET 3",
    triageExplanation: "Objašnjenje trijaže"
  },
  english: {
    // Header
    title: "AI Emergency Medical Assistant",
    subtitle: "Enter patient data for immediate AI analysis and emergency medical recommendations",
    
    // Patient Data
    patientData: "Patient Data",
    age: "Age (years)",
    weight: "Weight (kg)",
    gender: "Gender",
    male: "Male",
    female: "Female",
    other: "Other",
    allergies: "Known Allergies",
    medications: "Current Medications",
    allergiesPlaceholder: "E.g. penicillin",
    medicationsPlaceholder: "E.g. metformin",
    
    // Location
    location: "Patient Location",
    getLocation: "Get current location",
    gettingLocation: "Getting location...",
    remove: "Remove",
    locationNote: "Location will be included in AI analysis and reports",
    
    // Vitals
    vitals: "Vitals and Protocol",
    emergencyProtocol: "Emergency Protocol",
    selectProtocol: "Select protocol...",
    bloodPressure: "Blood Pressure",
    systolic: "Systolic (upper)",
    diastolic: "Diastolic (lower)",
    heartRate: "Heart Rate (bpm)",
    temperature: "Temperature (°C)",
    bloodSugar: "Blood Sugar",
    
    // Symptoms
    symptoms: "Symptoms and Notes",
    selectSymptoms: "Select symptoms:",
    notes: "Additional Notes",
    notesPlaceholder: "Enter relevant situation details...",
    
    // Buttons
    analyze: "Analyze Patient Data",
    analyzing: "Analyzing data...",
    pdfReport: "PDF Report",
    generatingPdf: "Generating PDF...",
    
    // Results
    conditionOverview: "Condition Overview",
    immediateActions: "Immediate Actions",
    differentialDiagnosis: "Differential Diagnosis",
    recommendedMedication: "Recommended Medication",
    keyTerms: "Key Terms",
    riskAssessment: "Risk Assessment",
    
    // Emergency
    emergencyNumbers: "Emergency Numbers",
    clickToCall: "Click to call",
    importantNotice: "Important Notice",
    emergencyNotice: "In case of a medical emergency, immediately call emergency services. This AI assistant is for educational and simulation purposes only.",
    
    // Triage
    triage: "Triage",
    immediateTriage: "IMMEDIATE TRIAGE",
    urgentTriage: "URGENT TRIAGE",
    routineTriage: "ROUTINE TRIAGE",
    immediateDesc: "Requires immediate medical intervention",
    urgentDesc: "Requires prompt medical attention",
    routineDesc: "Can wait for regular medical assessment",
    priority1: "PRIORITY 1",
    priority2: "PRIORITY 2",
    priority3: "PRIORITY 3",
    triageExplanation: "Triage Explanation"
  }
};

// Protocol options with translations
const protocolOptions = {
  montenegrin: [
    { value: "", label: "Odaberite protokol..." },
    { value: "Cardiac Arrest", label: "Srčani zastoj" },
    { value: "Severe Bleeding", label: "Obilno krvarenje" },
    { value: "Stroke", label: "Moždani udar" },
    { value: "Diabetic Emergency", label: "Dijabetička kriza" },
    { value: "Trauma", label: "Trauma" }
  ],
  english: [
    { value: "", label: "Select protocol..." },
    { value: "Cardiac Arrest", label: "Cardiac Arrest" },
    { value: "Severe Bleeding", label: "Severe Bleeding" },
    { value: "Stroke", label: "Stroke" },
    { value: "Diabetic Emergency", label: "Diabetic Emergency" },
    { value: "Trauma", label: "Trauma" }
  ]
};

// Symptoms with translations
const symptomOptions = {
  montenegrin: [
    'Glavobolja',
    'Vrtoglavica',
    'Kašalj',
    'Groznica',
    'Bol u grudima',
    'Otežano disanje',
    'Mučnina',
    'Umor',
    'Gubitak svijesti',
    'Napadaji',
    'Jaki bolovi',
    'Poremećaj vida',
  ],
  english: [
    'Headache',
    'Dizziness',
    'Cough',
    'Fever',
    'Chest pain',
    'Difficulty breathing',
    'Nausea',
    'Fatigue',
    'Loss of consciousness',
    'Seizures',
    'Severe pain',
    'Vision problems',
  ]
};

// Emergency numbers data
const emergencyNumbers = {
  me: {
    country: 'Crna Gora',
    flag: '/flags/montenegro.png',
    numbers: [
      { name: 'Hitna pomoć', number: '124', description: 'Medicinska hitna pomoć' },
      { name: 'Vatrogasci', number: '123', description: 'Vatrogasna služba' },
      { name: 'Policija', number: '122', description: 'Policijska hitna služba' },
      { name: 'Jedinstveni hitni broj', number: '112', description: 'Opći hitni broj' },
      { name: 'Pomoc na moru', number: '129', description: 'Pomoc na moru' }
    ]
  },
  eu: {
    country: 'Europska unija',
    flag: '🇪🇺',
    numbers: [
      { name: 'Jedinstveni hitni broj', number: '112', description: 'Opći hitni broj EU' },
      { name: 'Hitna medicinska pomoć', number: '112', description: 'Medicinska hitna' },
      { name: 'Policija', number: '112', description: 'Policijska hitna' },
      { name: 'Vatrogasci', number: '112', description: 'Vatrogasna služba' },
      { name: 'Psihijatrijska pomoć', number: '116 123', description: 'Emotional support helpline' }
    ]
  }
};

// Triage configuration
const triageConfig = {
  immediate: {
    color: 'bg-red-500 border-red-600',
    textColor: 'text-red-900 dark:text-red-100',
    bgColor: 'bg-red-50 dark:bg-red-900/20',
    borderColor: 'border-red-200 dark:border-red-800',
    icon: AlertTriangle,
    priority: 1
  },
  urgent: {
    color: 'bg-orange-500 border-orange-600',
    textColor: 'text-orange-900 dark:text-orange-100',
    bgColor: 'bg-orange-50 dark:bg-orange-900/20',
    borderColor: 'border-orange-200 dark:border-orange-800',
    icon: Stethoscope,
    priority: 2
  },
  routine: {
    color: 'bg-green-500 border-green-600',
    textColor: 'text-green-900 dark:text-green-100',
    bgColor: 'bg-green-50 dark:bg-green-900/20',
    borderColor: 'border-green-200 dark:border-green-800',
    icon: HeartPulse,
    priority: 3
  }
};

// Loading Spinner Component
const LoadingSpinner = ({ message, language }: { message: string; language: 'montenegrin' | 'english' }) => (
  <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
    <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 max-w-md mx-4 shadow-xl">
      <div className="flex flex-col items-center">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-full animate-pulse"></div>
          </div>
        </div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mt-4 mb-2">
          {language === 'montenegrin' ? 'AI Medicinska Analiza' : 'AI Medical Analysis'}
        </h3>
        <p className="text-gray-600 dark:text-gray-400 text-center text-sm mb-4">
          {message}
        </p>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
          <div className="bg-gradient-to-r from-blue-600 to-cyan-600 h-2 rounded-full animate-pulse"></div>
        </div>
        <div className="flex space-x-1 mt-3">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"
              style={{ animationDelay: `${i * 0.1}s` }}
            />
          ))}
        </div>
      </div>
    </div>
  </div>
);

// JSON extractor
function extractJSONFromResponse(raw: string): AnalysisResult | null {
  try {
    const cleanRaw = raw.replace(/```json\n|```/g, '').trim();
    return JSON.parse(cleanRaw) as AnalysisResult;
  } catch {
    try {
      const match = raw.match(/\{[\s\S]*\}/);
      if (match) return JSON.parse(match[0]) as AnalysisResult;
    } catch {
      return null;
    }
  }
  return null;
}

// Conversion functions
function mgdlToMmol(mgdl: number): number {
  return Math.round((mgdl / 18) * 10) / 10;
}

function mmolToMgdl(mmol: number): number {
  return Math.round(mmol * 18);
}

export default function MedicalAssistantDashboard() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('Inicijalizacija medicinskog AI...');
  const [isClient, setIsClient] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState<'me' | 'eu'>('me');
  const [language, setLanguage] = useState<'montenegrin' | 'english'>('montenegrin');
  const [userLocation, setUserLocation] = useState<{latitude: number; longitude: number; address: string} | null>(null);
  const [isGettingLocation, setIsGettingLocation] = useState(false);

  // Inputs
  const [age, setAge] = useState<number>(30);
  const [weight, setWeight] = useState<number>(70);
  const [sex, setSex] = useState<'male' | 'female' | 'other'>('male');
  const [allergies, setAllergies] = useState('');
  const [medications, setMedications] = useState('');
  const [emergencyProtocol, setEmergencyProtocol] = useState('');
  const [symptoms, setSymptoms] = useState<string[]>([]);
  const [systolicBP, setSystolicBP] = useState<number>(120);
  const [diastolicBP, setDiastolicBP] = useState<number>(80);
  const [bloodSugar, setBloodSugar] = useState<number>(90);
  const [bloodSugarUnit, setBloodSugarUnit] = useState<'mgdl' | 'mmol'>('mgdl');
  const [heartRate, setHeartRate] = useState<number>(75);
  const [temperature, setTemperature] = useState<number>(37);
  const [notes, setNotes] = useState('');

  // Results
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [exporting, setExporting] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const reportRef = useRef<HTMLDivElement | null>(null);
  const router = useRouter();

  const t = translations[language];
  const currentSymptoms = symptomOptions[language];
  const currentProtocols = protocolOptions[language];

  // Loading messages for better UX
  const loadingMessages = {
    montenegrin: [
      "Analiziram vitalne znakove...",
      "Procjenjujem simptome i rizike...",
      "Generiram diferencijalnu dijagnozu...",
      "Pripremam preporuke za hitne akcije...",
      "Simuliram terapijske opcije...",
      "Finaliziram medicinski izvještaj..."
    ],
    english: [
      "Analyzing vital signs...",
      "Assessing symptoms and risks...",
      "Generating differential diagnosis...",
      "Preparing emergency action recommendations...",
      "Simulating therapeutic options...",
      "Finalizing medical report..."
    ]
  };

  // Set client-side flag to prevent hydration errors
  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    let messageIndex = 0;
    let interval: NodeJS.Timeout;

    if (isAnalyzing) {
      setLoadingMessage(loadingMessages[language][0]);
      interval = setInterval(() => {
        messageIndex = (messageIndex + 1) % loadingMessages[language].length;
        setLoadingMessage(loadingMessages[language][messageIndex]);
      }, 3000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isAnalyzing, language]);

  // Auth check
  useEffect(() => {
    const supabase = createClient();
    const fetchUser = async () => {
      setIsLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        router.push('/auth/login');
        return;
      }
      setUser(session.user);
      setIsLoading(false);
    };
    fetchUser().catch(() => router.push('/auth/login'));
  }, [router]);

  // Get user location
  const getUserLocation = async () => {
    if (!navigator.geolocation) {
      setError(language === 'montenegrin' 
        ? 'Geolokacija nije podržana u vašem pregledaču' 
        : 'Geolocation is not supported in your browser'
      );
      return;
    }

    setIsGettingLocation(true);
    
    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 60000
        });
      });

      const { latitude, longitude } = position.coords;
      
      // Reverse geocoding to get address
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&accept-language=${language === 'montenegrin' ? 'sr' : 'en'}`
        );
        const data = await response.json();
        
        setUserLocation({
          latitude,
          longitude,
          address: data.display_name || `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`
        });
      } catch {
        // If reverse geocoding fails, just use coordinates
        setUserLocation({
          latitude,
          longitude,
          address: `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`
        });
      }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error: unknown) {
      setError(language === 'montenegrin' 
        ? 'Nije moguće dobiti lokaciju. Provjerite dozvolu za lokaciju.'
        : 'Unable to get location. Please check location permissions.'
      );
    } finally {
      setIsGettingLocation(false);
    }
  };

  // Chart drawing - only on client side
  useEffect(() => {
    if (!isClient || !canvasRef.current || !analysis?.risks.length) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size for high DPI displays
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    // Clear canvas
    ctx.clearRect(0, 0, rect.width, rect.height);

    const w = rect.width;
    const h = rect.height;
    const maxSeverity = Math.max(...analysis.risks.map((r) => r.severity), 1);
    const barWidth = (w - 120) / analysis.risks.length;
    const maxBarHeight = h - 80;

    // Draw grid lines
    ctx.strokeStyle = '#6b7280';
    ctx.lineWidth = 0.5;
    ctx.setLineDash([2, 2]);
    
    // Horizontal grid lines
    for (let i = 1; i <= 4; i++) {
      const y = maxBarHeight - (i * maxBarHeight / 4);
      ctx.beginPath();
      ctx.moveTo(60, y);
      ctx.lineTo(w - 60, y);
      ctx.stroke();
    }
    ctx.setLineDash([]);

    analysis.risks.forEach((r, i) => {
      const barHeight = (r.severity / maxSeverity) * maxBarHeight;
      const x = 60 + i * barWidth;
      const y = h - 60 - barHeight;

      // Create gradient based on severity
      const gradient = ctx.createLinearGradient(x, y, x, h - 60);
      if (r.severity >= 7) {
        gradient.addColorStop(0, '#ef4444');
        gradient.addColorStop(1, '#dc2626');
      } else if (r.severity >= 4) {
        gradient.addColorStop(0, '#f59e0b');
        gradient.addColorStop(1, '#d97706');
      } else {
        gradient.addColorStop(0, '#10b981');
        gradient.addColorStop(1, '#059669');
      }
      ctx.fillStyle = gradient;

      // Draw bar with shadow
      ctx.shadowColor = 'rgba(0, 0, 0, 0.2)';
      ctx.shadowBlur = 8;
      ctx.shadowOffsetY = 4;
      ctx.fillRect(x + 10, y, barWidth - 20, barHeight);
      ctx.shadowColor = 'transparent';
      ctx.shadowBlur = 0;
      ctx.shadowOffsetY = 0;

      // Draw bar border
      ctx.strokeStyle = '#1f2937';
      ctx.lineWidth = 1;
      ctx.strokeRect(x + 10, y, barWidth - 20, barHeight);

      // Draw severity number on bar
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 12px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(r.severity.toString(), x + barWidth / 2, y + barHeight / 2);

      // Draw risk label
      ctx.fillStyle = document.documentElement.classList.contains('dark') ? '#f3f4f6' : '#1f2937';
      ctx.font = '12px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';
      
      // Split long labels into multiple lines
      const words = r.label.split(' ');
      const lines = [];
      let currentLine = words[0];

      for (let i = 1; i < words.length; i++) {
        const word = words[i];
        const width = ctx.measureText(currentLine + ' ' + word).width;
        if (width < barWidth - 10) {
          currentLine += ' ' + word;
        } else {
          lines.push(currentLine);
          currentLine = word;
        }
      }
      lines.push(currentLine);

      // Draw multiple lines if needed
      lines.forEach((line, lineIndex) => {
        ctx.fillText(line, x + barWidth / 2, h - 45 + (lineIndex * 14));
      });
    });

    // Draw Y-axis labels
    ctx.fillStyle = document.documentElement.classList.contains('dark') ? '#9ca3af' : '#6b7280';
    ctx.font = '10px sans-serif';
    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';
    
    for (let i = 0; i <= 4; i++) {
      const severity = (i * maxSeverity / 4).toFixed(1);
      const y = maxBarHeight - (i * maxBarHeight / 4);
      ctx.fillText(severity, 50, y + 30);
    }

    // Draw Y-axis title
    ctx.save();
    ctx.translate(20, h / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.textAlign = 'center';
    ctx.fillStyle = document.documentElement.classList.contains('dark') ? '#d1d5db' : '#4b5563';
    ctx.font = 'bold 12px sans-serif';
    ctx.fillText('OZBILJNOST (1-10)', 0, 0);
    ctx.restore();

  }, [analysis, isClient]);

  function toggleSymptom(symptom: string) {
    setSymptoms((prev) =>
      prev.includes(symptom) ? prev.filter((s) => s !== symptom) : [...prev, symptom]
    );
  }

  // Handle blood sugar unit change
  const handleBloodSugarUnitChange = (newUnit: 'mgdl' | 'mmol') => {
    if (newUnit === bloodSugarUnit) return;
    
    if (newUnit === 'mmol') {
      setBloodSugar(mgdlToMmol(bloodSugar));
    } else {
      setBloodSugar(mmolToMgdl(bloodSugar));
    }
    setBloodSugarUnit(newUnit);
  };

  // Get blood sugar for AI (always in mg/dL)
  const getBloodSugarForAI = () => {
    return bloodSugarUnit === 'mgdl' ? bloodSugar : mmolToMgdl(bloodSugar);
  };

  // Get system prompt based on selected language
  const getSystemPrompt = () => {
    const triageInstructions = language === 'montenegrin' 
      ? `7. triageLevel (string): Nivo trijaže - "immediate" (hitno), "urgent" (urgentno) ili "routine" (rutinsko). Ocijenite na osnovu sledećih kriterijuma:
         - immediate: životno ugrožavajuća stanja (srčani udar, teške traume, prestanak disanja)
         - urgent: ozbiljna stanja koja zahtijevaju brzu intervenciju (jaki bolovi, visoka temperatura, dehidracija)
         - routine: manje hitna stanja koja mogu sačekati (blagi simptomi, rutinske kontrole)
      8. triageExplanation (string): Objašnjenje zašto je dodijeljen ovaj nivo trijaže na crnogorskom jeziku.`
      : `7. triageLevel (string): Triage level - "immediate", "urgent", or "routine". Assess based on:
         - immediate: Life-threatening conditions (cardiac arrest, severe trauma, respiratory arrest)
         - urgent: Serious conditions requiring prompt attention (severe pain, high fever, dehydration)
         - routine: Less urgent conditions that can wait (mild symptoms, routine checks)
      8. triageExplanation (string): Explanation of why this triage level was assigned.`;

    if (language === 'montenegrin') {
      return `Vi ste Hitni Medicinski AI za prve pomagače. Vaš zadatak je da analizirate podatke o pacijentu i odmah pružite precizne, primjenjive smjernice. OBAVEZNO generišite odgovor na crnogorskom jeziku, koristeći LATINIČNO pismo.

Uvijek vratite jedan validan JSON objekat sa sljedećim ključevima:
1. summary (string): Kratak pregled stanja pacijenta na crnogorskom jeziku.
2. risks (niz objekata {label: string; severity: broj 1-10}): Lista potencijalnih rizika i njihove težine (label na crnogorskom).
3. keywords (string[]): Ključni medicinski termini na crnogorskom.
4. immediateActions (string[]): Lista sažetih, korak-po-korak mjera za prve pomagače na crnogorskom.
5. differentialDiagnosis (string[]): Lista mogućih medicinskih stanja za razmatranje na crnogorskom.
6. drugDosage (string): Preporuka za lijek i dozu na crnogorskom, npr. "Primijeniti 325 mg Aspirina." Obavezno uključiti napomenu da je simulacija.
${triageInstructions}

Sve predložene mjere i lijekovi moraju biti u skladu sa USA medical protocols i EU liječničkim protokolima za liječenje simptoma, koristeći lijekove koji su dostupni i registrovani na teritoriji EU.

Na osnovu sljedećih podataka o pacijentu, generiši JSON odgovor:`;
    } else {
      return `You are an Emergency Medical AI for first responders. Your task is to analyze patient data and provide immediate, actionable guidance.

Always return a single, valid JSON object with the following keys:
1. summary (string): A brief summary of the patient's condition.
2. risks (array of {label: string; severity: number 1-10}): A list of potential risks and their severity scores.
3. keywords (string[]): Key medical terms.
4. immediateActions (string[]): A list of concise, step-by-step actions for the first responder.
5. differentialDiagnosis (string[]): A list of possible medical conditions to consider.
6. drugDosage (string): A simulated drug and dosage recommendation, e.g., "Administer 325 mg Aspirin." Always include a disclaimer that this is for simulation only.
${triageInstructions}

All proposed measures and medications must comply with USA medical protocols and EU medical treatment protocols for symptoms, using medications available and registered in the EU territory.

Based on the following patient data, generate the JSON response:`;
    }
  };

  // Handle AI request
  async function analyze() {
    setError(null);
    setAnalysis(null);
    setIsAnalyzing(true);

    try {
      const locationInfo = userLocation 
        ? `\n**Lokacija pacijenta:** ${userLocation.address} (${userLocation.latitude.toFixed(6)}, ${userLocation.longitude.toFixed(6)})`
        : '';

      const messages = [
        {
          role: 'system',
          content: getSystemPrompt(),
        },
        {
          role: 'user',
          content: `
            **Patient Demographics:**
            - Age: ${age} years
            - Weight: ${weight} kg
            - Sex: ${sex}
            - Known Allergies: ${allergies || 'None'}
            - Current Medications: ${medications || 'None'}
            
            **Vitals and Symptoms:**
            - Emergency Protocol: ${emergencyProtocol || 'None Selected'}
            - Symptoms: ${symptoms.join(', ') || 'None Selected'}
            - Blood Pressure: ${systolicBP}/${diastolicBP} mmHg
            - Blood Sugar: ${getBloodSugarForAI()} mg/dL
            - Heart Rate: ${heartRate} bpm
            - Temperature: ${temperature} °C
            ${locationInfo}
            
            **Additional Notes:** ${notes || 'None'}.
          `,
        },
      ];
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages, model: 'deepseek/deepseek-chat-v3.1:free', temperature: 0.2 }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);

      const parsed = extractJSONFromResponse(data.content);
      if (!parsed?.summary) throw new Error('Nevažeći AI odgovor. Pokušajte ponovno.');
      setAnalysis(parsed);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setIsAnalyzing(false);
    }
  }

  const generateProfessionalPDF = async () => {
    if (!analysis) return;
    
    setExporting('pdf');
    
    try {
      // Dynamic import to avoid SSR issues
      const html2canvas = (await import('html2canvas')).default;
      const jsPDF = (await import('jspdf')).default;
      
      const element = reportRef.current;
      if (!element) {
        setExporting(null);
        return;
      }

      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff'
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgWidth = 210;
      const pageHeight = 295;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      pdf.save(`medicinski-izvjestaj-${new Date().toISOString().slice(0, 10)}.pdf`);
    } catch (error) {
      console.error('PDF generation failed:', error);
      setError(language === 'montenegrin' 
        ? 'Greška pri generiranju PDF-a. Pokušajte ponovno.' 
        : 'Error generating PDF. Please try again.'
      );
    } finally {
      setExporting(null);
    }
  };

  const exportMarkdown = () => {
    if (!analysis) return;
    
    setExporting('markdown');
    
    let markdownContent = `# ${language === 'montenegrin' ? 'Medicinski Izvještaj - AI Asistent' : 'Medical Report - AI Assistant'}\n\n`;
    markdownContent += `**${language === 'montenegrin' ? 'Datum izvještaja' : 'Report Date'}:** ${new Date().toLocaleString()}\n`;
    markdownContent += `**${language === 'montenegrin' ? 'Generirano pomoću' : 'Generated by'}:** AI Medicinski Asistent za Hitne Slučajeve\n\n`;
    
    markdownContent += `## ${language === 'montenegrin' ? 'Podaci o pacijentu' : 'Patient Data'}\n`;
    markdownContent += `- **${t.age}:** ${age}\n`;
    markdownContent += `- **${t.weight}:** ${weight} kg\n`;
    markdownContent += `- **${t.gender}:** ${sex === 'male' ? t.male : sex === 'female' ? t.female : t.other}\n`;
    markdownContent += `- **${t.allergies}:** ${allergies || (language === 'montenegrin' ? 'Nema' : 'None')}\n`;
    markdownContent += `- **${t.medications}:** ${medications || (language === 'montenegrin' ? 'Nema' : 'None')}\n`;
    if (userLocation) {
      markdownContent += `- **${t.location}:** ${userLocation.address}\n`;
      markdownContent += `- **${language === 'montenegrin' ? 'Koordinate' : 'Coordinates'}:** ${userLocation.latitude.toFixed(6)}, ${userLocation.longitude.toFixed(6)}\n`;
    }
    markdownContent += `\n`;
    
    markdownContent += `## ${language === 'montenegrin' ? 'Vitalni znaci' : 'Vital Signs'}\n`;
    markdownContent += `- **${t.bloodPressure}:** ${systolicBP}/${diastolicBP} mmHg\n`;
    markdownContent += `- **${t.bloodSugar}:** ${bloodSugar} ${bloodSugarUnit === 'mgdl' ? 'mg/dL' : 'mmol/L'}\n`;
    markdownContent += `- **${t.heartRate}:** ${heartRate} bpm\n`;
    markdownContent += `- **${t.temperature}:** ${temperature} °C\n`;
    markdownContent += `- **${t.emergencyProtocol}:** ${emergencyProtocol || (language === 'montenegrin' ? 'Nije odabran' : 'Not selected')}\n\n`;
    
    markdownContent += `## ${language === 'montenegrin' ? 'Simptomi' : 'Symptoms'}\n`;
    markdownContent += `${symptoms.length > 0 ? symptoms.join(', ') : (language === 'montenegrin' ? 'Nema odabranih simptoma' : 'No symptoms selected')}\n\n`;
    
    markdownContent += `## ${t.triage}\n`;
    const triageInfo = triageConfig[analysis.triageLevel];
    const triageLabel = analysis.triageLevel === 'immediate' ? t.immediateTriage : 
                       analysis.triageLevel === 'urgent' ? t.urgentTriage : t.routineTriage;
    const triageDesc = analysis.triageLevel === 'immediate' ? t.immediateDesc : 
                      analysis.triageLevel === 'urgent' ? t.urgentDesc : t.routineDesc;
    const priority = analysis.triageLevel === 'immediate' ? t.priority1 : 
                    analysis.triageLevel === 'urgent' ? t.priority2 : t.priority3;
    
    markdownContent += `- **${language === 'montenegrin' ? 'Nivo trijaže' : 'Triage Level'}:** ${triageLabel}\n`;
    markdownContent += `- **${language === 'montenegrin' ? 'Opis' : 'Description'}:** ${triageDesc}\n`;
    markdownContent += `- **${language === 'montenegrin' ? 'Prioritet' : 'Priority'}:** ${priority}\n`;
    markdownContent += `- **${t.triageExplanation}:** ${analysis.triageExplanation}\n\n`;
    
    markdownContent += `## ${t.conditionOverview}\n`;
    markdownContent += `${analysis.summary}\n\n`;
    
    markdownContent += `## ${language === 'montenegrin' ? 'Procjena rizika' : 'Risk Assessment'}\n`;
    analysis.risks.forEach((risk, index) => {
      markdownContent += `${index + 1}. ${risk.label} (${language === 'montenegrin' ? 'Ozbiljnost' : 'Severity'}: ${risk.severity}/10)\n`;
    });
    markdownContent += `\n`;
    
    markdownContent += `## ${t.immediateActions}\n`;
    analysis.immediateActions.forEach((action, index) => {
      markdownContent += `${index + 1}. ${action}\n`;
    });
    markdownContent += `\n`;
    
    markdownContent += `## ${t.differentialDiagnosis}\n`;
    analysis.differentialDiagnosis.forEach((diagnosis, index) => {
      markdownContent += `${index + 1}. ${diagnosis}\n`;
    });
    markdownContent += `\n`;
    
    markdownContent += `## ${t.recommendedMedication}\n`;
    markdownContent += `${analysis.drugDosage}\n\n`;
    
    markdownContent += `## ${t.keyTerms}\n`;
    markdownContent += `${analysis.keywords.join(', ')}\n\n`;
    
    markdownContent += `---\n`;
    markdownContent += `**${language === 'montenegrin' ? 'Napomena' : 'Note'}:** ${language === 'montenegrin' 
      ? 'Ovaj izvještaj je generisan AI sistemom i služi isključivo za edukativne i  svrhe simulacije i testiranja.'
      : 'This report is generated by an AI system and is for educational and simulation purposes only.'
    }\n`;
    markdownContent += `${language === 'montenegrin' 
      ? 'Stvarne medicinske odluke moraju donositi kvalifikovani zdravstveni radnici.Obratite se vašem doktoru!'
      : 'Actual medical decisions must be made by qualified healthcare professionals.'
    }\n`;

    const blob = new Blob([markdownContent], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `medicinski-izvjestaj-${new Date().toISOString().slice(0, 10)}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    setExporting(null);
  };

  // Triage Card Component
  const TriageCard = ({ analysis }: { analysis: AnalysisResult }) => {
    const config = triageConfig[analysis.triageLevel];
    const IconComponent = config.icon;
    
    const triageLabel = analysis.triageLevel === 'immediate' ? t.immediateTriage : 
                       analysis.triageLevel === 'urgent' ? t.urgentTriage : t.routineTriage;
    const triageDesc = analysis.triageLevel === 'immediate' ? t.immediateDesc : 
                      analysis.triageLevel === 'urgent' ? t.urgentDesc : t.routineDesc;
    const priority = analysis.triageLevel === 'immediate' ? t.priority1 : 
                    analysis.triageLevel === 'urgent' ? t.priority2 : t.priority3;
    
    return (
      <div className={`p-6 rounded-2xl border-2 ${config.bgColor} ${config.borderColor} shadow-lg transition-all duration-300 hover:shadow-xl`}>
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center">
            <div className={`w-12 h-12 ${config.color} rounded-full flex items-center justify-center mr-4 shadow-lg`}>
              <IconComponent className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className={`text-xl font-bold ${config.textColor}`}>
                {triageLabel}
              </h3>
              <p className={`text-sm ${config.textColor} opacity-80 mt-1`}>
                {triageDesc}
              </p>
            </div>
          </div>
          <div className={`px-3 py-1 rounded-full ${config.color} text-white text-sm font-bold shadow-sm`}>
            {priority}
          </div>
        </div>
        
        <div className="mt-4 p-4 bg-white/50 dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700">
          <h4 className="font-semibold text-gray-900 dark:text-white mb-2 flex items-center">
            <Stethoscope className="w-4 h-4 mr-2" />
            {t.triageExplanation}
          </h4>
          <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed">
            {analysis.triageExplanation}
          </p>
        </div>
        
        {analysis.triageLevel === 'immediate' && (
          <div className="mt-4 p-3 bg-red-100 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg">
            <div className="flex items-center">
              <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400 mr-2 flex-shrink-0" />
              <p className="text-sm text-red-700 dark:text-red-300 font-medium">
                {language === 'montenegrin' 
                  ? '⚠️ HITNO: Ovo stanje zahtijeva odmahnu medicinsku intervenciju!'
                  : '⚠️ IMMEDIATE: This condition requires immediate medical intervention!'
                }
              </p>
            </div>
          </div>
        )}
      </div>
    );
  };

  // Show loading state until client-side rendering is ready
  if (!isClient || isLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-gray-900 dark:to-gray-800">
        <div className="text-xl text-gray-700 dark:text-gray-200">
          {language === 'montenegrin' ? 'Učitavanje...' : 'Loading...'}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-gray-900 dark:to-gray-800 transition-colors duration-300">
      {/* Loading Spinner */}
      {isAnalyzing && <LoadingSpinner message={loadingMessage} language={language} />}
      
      <main className="max-w-7xl mx-auto p-4 sm:p-6">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
            <div className="flex-1">
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-4">
                {t.title}{' '}
                <span className="bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                  AI
                </span>
              </h1>
              <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
                {t.subtitle}
              </p>
            </div>
            
            {/* Language Selector */}
            <div className="flex justify-center sm:justify-end mt-4 sm:mt-0">
              <div className="flex bg-gray-100 dark:bg-gray-700 rounded-xl p-1">
                <button
                  onClick={() => setLanguage('montenegrin')}
                  className={`flex items-center px-4 py-2 rounded-lg transition-all ${
                    language === 'montenegrin'
                      ? 'bg-blue-600 text-white shadow-lg'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                  title="Generiši AI odgovor na crnogorskom jeziku"
                >
                  <Languages className="w-4 h-4 mr-2" />
                  <span className="font-medium">ME</span>
                  <span className="ml-2 text-xs opacity-80 hidden sm:inline">
                    (AI odgovor)
                  </span>
                </button>
                <button
                  onClick={() => setLanguage('english')}
                  className={`flex items-center px-4 py-2 rounded-lg transition-all ${
                    language === 'english'
                      ? 'bg-blue-600 text-white shadow-lg'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                  title="Generate AI response in English"
                >
                  <span className="font-medium">EN</span>
                  <span className="ml-2 text-xs opacity-80 hidden sm:inline">
                    (AI response)
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Patient Data */}
          <div className="p-6 bg-white/90 dark:bg-gray-900/90 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-lg transition-colors duration-300">
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <Clipboard className="w-6 h-6 mr-3 text-blue-500" />
              <span className="text-gray-900 dark:text-white">{t.patientData}</span>
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">{t.age}</label>
                <input 
                  type="number" 
                  value={age} 
                  onChange={(e) => setAge(Number(e.target.value))} 
                  className="w-full p-3 text-lg rounded-xl bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                />
              </div>
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">{t.weight}</label>
                <input 
                  type="number" 
                  value={weight} 
                  onChange={(e) => setWeight(Number(e.target.value))} 
                  className="w-full p-3 text-lg rounded-xl bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                />
              </div>
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">{t.gender}</label>
                <select 
                  value={sex} 
                  onChange={(e) => setSex(e.target.value as 'male' | 'female' | 'other')} 
                  className="w-full p-3 text-lg rounded-xl bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-gray-900 dark:text-white"
                >
                  <option value="male">{t.male}</option>
                  <option value="female">{t.female}</option>
                  <option value="other">{t.other}</option>
                </select>
              </div>
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">{t.allergies}</label>
                <input 
                  type="text" 
                  value={allergies} 
                  onChange={(e) => setAllergies(e.target.value)} 
                  placeholder={t.allergiesPlaceholder}
                  className="w-full p-3 text-lg rounded-xl bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                />
              </div>
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">{t.medications}</label>
                <input 
                  type="text" 
                  value={medications} 
                  onChange={(e) => setMedications(e.target.value)} 
                  placeholder={t.medicationsPlaceholder}
                  className="w-full p-3 text-lg rounded-xl bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                />
              </div>

              {/* Location Section */}
              <div className="pt-4 border-t border-gray-200 dark:border-gray-600">
                <label className="block mb-3 text-sm font-medium text-gray-700 dark:text-gray-300">
                  {t.location}
                </label>
                {userLocation ? (
                  <div className="p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl">
                    <div className="flex items-start">
                      <MapPin className="w-5 h-5 text-green-600 dark:text-green-400 mr-2 mt-0.5 flex-shrink-0" />
                      <div className="flex-1">
                        <p className="text-green-800 dark:text-green-300 text-sm font-medium">
                          {userLocation.address}
                        </p>
                        <p className="text-green-600 dark:text-green-400 text-xs mt-1">
                          {userLocation.latitude.toFixed(6)}, {userLocation.longitude.toFixed(6)}
                        </p>
                      </div>
                      <button
                        onClick={() => setUserLocation(null)}
                        className="text-red-500 hover:text-red-700 text-sm font-medium"
                      >
                        {t.remove}
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={getUserLocation}
                    disabled={isGettingLocation}
                    className="w-full p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                  >
                    {isGettingLocation ? (
                      <>
                        <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mr-3"></div>
                        <span className="text-blue-700 dark:text-blue-300 font-medium">
                          {t.gettingLocation}
                        </span>
                      </>
                    ) : (
                      <>
                        <MapPin className="w-5 h-5 text-blue-600 dark:text-blue-400 mr-3" />
                        <span className="text-blue-700 dark:text-blue-300 font-medium">
                          {t.getLocation}
                        </span>
                      </>
                    )}
                  </button>
                )}
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                  {t.locationNote}
                </p>
              </div>
            </div>
          </div>

          {/* Vitals and Protocol */}
          <div className="p-6 bg-white/90 dark:bg-gray-900/90 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-lg transition-colors duration-300">
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <HeartPulse className="w-6 h-6 mr-3 text-blue-500" />
              <span className="text-gray-900 dark:text-white">{t.vitals}</span>
            </h2>
            <div className="space-y-6">
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">{t.emergencyProtocol}</label>
                <select 
                  value={emergencyProtocol} 
                  onChange={(e) => setEmergencyProtocol(e.target.value)} 
                  className="w-full p-3 text-lg rounded-xl bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-gray-900 dark:text-white"
                >
                  {currentProtocols.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
              
              {/* Blood Pressure with two sliders */}
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                  {t.bloodPressure}: <span className="font-bold text-blue-600 text-lg">{systolicBP}/{diastolicBP} mmHg</span>
                </label>
                <div className="space-y-4">
                  <div>
                    <label className="block mb-1 text-xs text-gray-500 dark:text-gray-400">{t.systolic}</label>
                    <input
                      type="range"
                      min={80}
                      max={200}
                      value={systolicBP}
                      onChange={(e) => setSystolicBP(Number(e.target.value))}
                      className="w-full h-3 accent-blue-600"
                    />
                    <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
                      <span>80</span>
                      <span>200 mmHg</span>
                    </div>
                  </div>
                  <div>
                    <label className="block mb-1 text-xs text-gray-500 dark:text-gray-400">{t.diastolic}</label>
                    <input
                      type="range"
                      min={50}
                      max={120}
                      value={diastolicBP}
                      onChange={(e) => setDiastolicBP(Number(e.target.value))}
                      className="w-full h-3 accent-blue-600"
                    />
                    <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
                      <span>50</span>
                      <span>120 mmHg</span>
                    </div>
                  </div>
                </div>
              </div>

              {[
                { label: t.heartRate, value: heartRate, setter: setHeartRate, min: 40, max: 150 },
                { label: t.temperature, value: temperature, setter: setTemperature, min: 35, max: 41 },
              ].map((vital) => (
                <div key={vital.label}>
                  <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                    {vital.label}: <span className="font-bold text-blue-600 text-lg">{vital.value}</span>
                  </label>
                  <input
                    type="range"
                    min={vital.min}
                    max={vital.max}
                    value={vital.value}
                    onChange={(e) => vital.setter(Number(e.target.value))}
                    className="w-full h-3 accent-blue-600"
                  />
                  <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
                    <span>{vital.min}</span>
                    <span>{vital.max}</span>
                  </div>
                </div>
              ))}
              
              {/* Blood Sugar with Unit Toggle */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {t.bloodSugar}: <span className="font-bold text-blue-600 text-lg">{bloodSugar} {bloodSugarUnit === 'mgdl' ? 'mg/dL' : 'mmol/L'}</span>
                  </label>
                  <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
                    <button
                      onClick={() => handleBloodSugarUnitChange('mgdl')}
                      className={`px-3 py-1 text-sm rounded-md transition-all ${
                        bloodSugarUnit === 'mgdl' 
                          ? 'bg-blue-600 text-white shadow-sm' 
                          : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                      }`}
                    >
                      mg/dL
                    </button>
                    <button
                      onClick={() => handleBloodSugarUnitChange('mmol')}
                      className={`px-3 py-1 text-sm rounded-md transition-all ${
                        bloodSugarUnit === 'mmol' 
                          ? 'bg-blue-600 text-white shadow-sm' 
                          : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                      }`}
                    >
                      mmol/L
                    </button>
                  </div>
                </div>
                <input
                  type="range"
                  min={bloodSugarUnit === 'mgdl' ? 60 : 3.3}
                  max={bloodSugarUnit === 'mgdl' ? 200 : 11.1}
                  step={bloodSugarUnit === 'mgdl' ? 1 : 0.1}
                  value={bloodSugar}
                  onChange={(e) => setBloodSugar(Number(e.target.value))}
                  className="w-full h-3 accent-blue-600"
                />
                <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
                  <span>{bloodSugarUnit === 'mgdl' ? '60' : '3.3'}</span>
                  <span>{bloodSugarUnit === 'mgdl' ? '200 mg/dL' : '11.1 mmol/L'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Symptoms and Notes */}
          <div className="p-6 bg-white/90 dark:bg-gray-900/90 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-lg transition-colors duration-300">
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <Stethoscope className="w-6 h-6 mr-3 text-blue-500" />
              <span className="text-gray-900 dark:text-white">{t.symptoms}</span>
            </h2>
            <div className="mb-6">
              <p className="text-sm font-medium mb-3 text-gray-700 dark:text-gray-300">{t.selectSymptoms}</p>
              <div className="grid grid-cols-2 gap-3">
                {currentSymptoms.map((symptom) => (
                  <label
                    key={symptom}
                    className={`flex items-center p-3 rounded-xl border cursor-pointer transition-all ${
                      symptoms.includes(symptom)
                        ? 'bg-blue-100 border-blue-400 text-blue-800 font-semibold shadow-sm dark:bg-blue-900/30 dark:border-blue-700 dark:text-blue-300'
                        : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:border-blue-300'
                    }`}
                  >
                    <input type="checkbox" checked={symptoms.includes(symptom)} onChange={() => toggleSymptom(symptom)} className="hidden" />
                    <span className="text-sm">{symptom}</span>
                  </label>
                ))}
              </div>
            </div>
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">{t.notes}</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full p-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all min-h-[120px] text-lg text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                placeholder={t.notesPlaceholder}
              />
            </div>
          </div>
        </div>

        {/* Analyze button */}
        <button
          onClick={analyze}
          disabled={isAnalyzing}
          className={`w-full py-4 text-lg bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-2xl font-semibold shadow-xl hover:shadow-2xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center ${
            isAnalyzing ? 'animate-pulse' : 'hover:scale-[1.02] transform'
          }`}
        >
          {isAnalyzing ? (
            <>
              <Wrench className="w-6 h-6 mr-3 animate-spin" />
              {t.analyzing}
            </>
          ) : (
            t.analyze
          )}
        </button>

        {/* Results */}
        <div className="mt-10">
          {error && (
            <div className="p-6 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-2xl mb-6 flex items-center shadow-lg">
              <AlertTriangle className="w-6 h-6 mr-3" />
              <div>
                <div className="font-medium text-lg">
                  {language === 'montenegrin' ? 'Greška:' : 'Error:'}
                </div>
                <div className="text-sm mt-1">{error}</div>
              </div>
            </div>
          )}
          {analysis && (
            <div className="space-y-6" ref={reportRef}>
              {/* Export Options */}
              <div className="flex flex-wrap gap-4 mb-8">
                <button
                  onClick={generateProfessionalPDF}
                  disabled={exporting === 'pdf'}
                  className="flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-xl transition-all shadow-lg hover:shadow-xl disabled:opacity-50 text-lg font-medium"
                >
                  {exporting === 'pdf' ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-3"></div>
                      {t.generatingPdf}
                    </>
                  ) : (
                    <>
                      <Download className="w-5 h-5 mr-2" />
                      {t.pdfReport}
                    </>
                  )}
                </button>
                <button
                  onClick={exportMarkdown}
                  disabled={exporting === 'markdown'}
                  className="flex items-center px-6 py-3 bg-gradient-to-r from-gray-600 to-gray-700 text-white rounded-xl transition-all shadow-lg hover:shadow-xl disabled:opacity-50 text-lg font-medium"
                >
                  {exporting === 'markdown' ? 
                    (language === 'montenegrin' ? 'Priprema...' : 'Preparing...') : 
                    '📝 Markdown'
                  }
                </button>
              </div>

              {/* Triage Card - Prominent Display */}
              <div className="mb-8">
                <TriageCard analysis={analysis} />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="p-6 bg-white/90 dark:bg-gray-900/90 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-lg transition-colors duration-300">
                  <h2 className="text-xl font-bold mb-3 flex items-center">
                    <HeartPulse className="w-6 h-6 mr-3 text-blue-500" />
                    <span className="text-gray-900 dark:text-white">
                      {t.conditionOverview}
                    </span>
                  </h2>
                  <p className="text-gray-800 dark:text-gray-200 text-lg leading-relaxed">{analysis.summary}</p>
                </div>
                <div className="p-6 bg-white/90 dark:bg-gray-900/90 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-lg transition-colors duration-300">
                  <h2 className="text-xl font-bold mb-3 flex items-center">
                    <Triangle className="w-6 h-6 mr-3 text-blue-500" />
                    <span className="text-gray-900 dark:text-white">
                      {t.immediateActions}
                    </span>
                  </h2>
                  <ul className="space-y-2 text-lg">
                    {analysis.immediateActions.map((action, i) => (
                      <li key={i} className="flex items-start">
                        <span className="flex-shrink-0 w-6 h-6 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full text-sm flex items-center justify-center mr-3 mt-1">
                          {i + 1}
                        </span>
                        <span className="text-gray-800 dark:text-gray-200">{action}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
              
              <div className="p-6 bg-white/90 dark:bg-gray-900/90 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-lg transition-colors duration-300">
                <h2 className="text-xl font-bold mb-3 flex items-center">
                  <Stethoscope className="w-6 h-6 mr-3 text-blue-500" />
                  <span className="text-gray-900 dark:text-white">
                    {t.differentialDiagnosis}
                  </span>
                </h2>
                <ul className="list-disc list-inside text-gray-800 dark:text-gray-200 space-y-2 text-lg">
                  {analysis.differentialDiagnosis.map((diag, i) => (
                    <li key={i}>{diag}</li>
                  ))}
                </ul>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="p-6 bg-white/90 dark:bg-gray-900/90 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-lg transition-colors duration-300">
                  <h2 className="text-xl font-bold mb-3 flex items-center">
                    <Syringe className="w-6 h-6 mr-3 text-blue-500" />
                    <span className="text-gray-900 dark:text-white">
                      {t.recommendedMedication}
                    </span>
                  </h2>
                  <p className="text-gray-800 dark:text-gray-200 font-semibold text-lg p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
                    {analysis.drugDosage}
                  </p>
                </div>
                <div className="p-6 bg-white/90 dark:bg-gray-900/90 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-lg transition-colors duration-300">
                  <h2 className="text-xl font-bold mb-3 text-gray-900 dark:text-white">
                    {t.keyTerms}
                  </h2>
                  <div className="flex flex-wrap gap-3">
                    {analysis.keywords.map((kw, i) => (
                      <span
                        key={i}
                        className="px-4 py-2 bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 rounded-full text-sm font-medium"
                      >
                        {kw}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
              
              <div className="p-6 bg-white/90 dark:bg-gray-900/90 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-lg transition-colors duration-300">
                <h2 className="text-xl font-bold mb-3 text-gray-900 dark:text-white">
                  {t.riskAssessment}
                </h2>
                <div className="relative">
                  <canvas
                    ref={canvasRef}
                    className="w-full h-80 border-2 rounded-2xl bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-600"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Medical Image Analysis Section */}
        <div className="mt-10">
          <MedicalImageAnalysis language={language} />
        </div>
          <VitalSignsMonitor realTime={true} language={language} />
      {/* <Telemedicine language={language} /> */}
  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
    {/* Emergency Protocols */}
    <EmergencyProtocols language={language} />
    
    {/* Drug Interactions */}
    <DrugInteractions language={language} />
  </div>

        {/* Emergency Numbers Section */}
        <div className="mt-12 p-6 bg-white/90 dark:bg-gray-900/90 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-lg transition-colors duration-300">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 sm:mb-0 flex items-center">
              <Phone className="w-6 h-6 mr-3 text-blue-500" />
              {t.emergencyNumbers}
            </h2>
            
            {/* Country Selector */}
            <div className="flex space-x-2">
              <button
                onClick={() => setSelectedCountry('me')}
                className={`flex items-center px-4 py-2 rounded-xl transition-all ${
                  selectedCountry === 'me'
                    ? 'bg-blue-600 text-white shadow-lg'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                <div className="w-6 h-4 mr-2 relative">
                  <Image 
                    src="/flags/montenegro.png" 
                    alt="Montenegro flag" 
                    width={24}
                    height={16}
                    className="object-cover rounded"
                  />
                </div>
                <span className="font-medium">ME</span>
              </button>
              <button
                onClick={() => setSelectedCountry('eu')}
                className={`flex items-center px-4 py-2 rounded-xl transition-all ${
                  selectedCountry === 'eu'
                    ? 'bg-blue-600 text-white shadow-lg'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                <span className="text-xl mr-2">🇪🇺</span>
                <span className="font-medium">EU</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {emergencyNumbers[selectedCountry].numbers.map((emergency, index) => (
              <div
                key={index}
                className="p-4 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-xl border border-blue-200 dark:border-blue-700 shadow-sm hover:shadow-md transition-all duration-300 group cursor-pointer"
                onClick={() => window.open(`tel:${emergency.number}`, '_self')}
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="font-bold text-lg text-blue-900 dark:text-blue-100 group-hover:text-blue-700 dark:group-hover:text-blue-300 transition-colors">
                      {emergency.name}
                    </h3>
                    <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                      {emergency.description}
                    </p>
                  </div>
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                      <Phone className="w-6 h-6 text-white" />
                    </div>
                  </div>
                </div>
                <div className="mt-3">
                  <div className="text-2xl font-black text-blue-800 dark:text-blue-200 tracking-wider group-hover:scale-105 transition-transform duration-300">
                    {emergency.number}
                  </div>
                  <div className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                    {t.clickToCall}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-xl">
            <div className="flex items-start">
              <AlertTriangle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mr-3 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="font-semibold text-yellow-800 dark:text-yellow-300 mb-1">
                  {t.importantNotice}
                </h4>
                <p className="text-sm text-yellow-700 dark:text-yellow-400">
                  {t.emergencyNotice}
                </p>
              </div>
    
            </div>
            
          </div>
                           <GeneralDiagnosis language={language} />
                           <LaboratoryAnalyzer language={language} />
        </div>
      </main>
    </div>
  );
}