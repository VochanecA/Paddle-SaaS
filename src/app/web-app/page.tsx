'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import type { User } from '@supabase/supabase-js';
import { HeartPulse, FlaskConical, Stethoscope, AlertTriangle, Syringe, Clipboard, Triangle, Wrench, Download, Phone, Languages } from 'lucide-react';
import Image from 'next/image';

// Types
interface AnalysisResult {
  summary: string;
  risks: { label: string; severity: number }[];
  keywords: string[];
  immediateActions: string[];
  differentialDiagnosis: string[];
  drugDosage: string;
}

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

// Loading Spinner Component
const LoadingSpinner = ({ message }: { message: string }) => (
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
          AI Medicinska Analiza
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

  // Loading messages for better UX
  const loadingMessages = [
    "Analiziram vitalne znakove...",
    "Procjenjujem simptome i rizike...",
    "Generiram diferencijalnu dijagnozu...",
    "Pripremam preporuke za hitne akcije...",
    "Simuliram terapijske opcije...",
    "Finaliziram medicinski izvještaj..."
  ];

  // Set client-side flag to prevent hydration errors
  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    let messageIndex = 0;
    let interval: NodeJS.Timeout;

    if (isAnalyzing) {
      setLoadingMessage(loadingMessages[0]);
      interval = setInterval(() => {
        messageIndex = (messageIndex + 1) % loadingMessages.length;
        setLoadingMessage(loadingMessages[messageIndex]);
      }, 3000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isAnalyzing]);

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

  // Symptoms list
  const allSymptoms = [
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
  ];

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
    if (language === 'montenegrin') {
      return `Vi ste Hitni Medicinski AI za prve pomagače. Vaš zadatak je da analizirate podatke o pacijentu i odmah pružite precizne, primjenjive smjernice. OBAVEZNO generišite odgovor na crnogorskom jeziku, koristeći LATINIČNO pismo.

Uvijek vratite jedan validan JSON objekat sa sljedećim ključevima:
1. summary (string): Kratak pregled stanja pacijenta na crnogorskom jeziku.
2. risks (niz objekata {label: string; severity: broj 1-10}): Lista potencijalnih rizika i njihove težine (label na crnogorskom).
3. keywords (string[]): Ključni medicinski termini na crnogorskom.
4. immediateActions (string[]): Lista sažetih, korak-po-korak mjera za prve pomagače na crnogorskom.
5. differentialDiagnosis (string[]): Lista mogućih medicinskih stanja za razmatranje na crnogorskom.
6. drugDosage (string): Preporuka za lijek i dozu na crnogorskom, npr. "Primijeniti 325 mg Aspirina." Obavezno uključiti napomenu da je simulacija.

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
      setError('Greška pri generiranju PDF-a. Pokušajte ponovno.');
    } finally {
      setExporting(null);
    }
  };

  const exportMarkdown = () => {
    if (!analysis) return;
    
    setExporting('markdown');
    
    let markdownContent = `# Medicinski Izvještaj - AI Asistent\n\n`;
    markdownContent += `**Datum izvještaja:** ${new Date().toLocaleString()}\n`;
    markdownContent += `**Generirano pomoću:** AI Medicinski Asistent za Hitne Slučajeve\n\n`;
    
    markdownContent += `## Podaci o pacijentu\n`;
    markdownContent += `- **Starost:** ${age} godina\n`;
    markdownContent += `- **Težina:** ${weight} kg\n`;
    markdownContent += `- **Spol:** ${sex === 'male' ? 'Muški' : sex === 'female' ? 'Ženski' : 'Ostalo'}\n`;
    markdownContent += `- **Alergije:** ${allergies || 'Nema'}\n`;
    markdownContent += `- **Trenutne terapije:** ${medications || 'Nema'}\n\n`;
    
    markdownContent += `## Vitalni znakovi\n`;
    markdownContent += `- **Krvni pritisak:** ${systolicBP}/${diastolicBP} mmHg\n`;
    markdownContent += `- **Šećer u krvi:** ${bloodSugar} ${bloodSugarUnit === 'mgdl' ? 'mg/dL' : 'mmol/L'}\n`;
    markdownContent += `- **Puls:** ${heartRate} bpm\n`;
    markdownContent += `- **Temperatura:** ${temperature} °C\n`;
    markdownContent += `- **Protokol:** ${emergencyProtocol || 'Nije odabran'}\n\n`;
    
    markdownContent += `## Simptomi\n`;
    markdownContent += `${symptoms.length > 0 ? symptoms.join(', ') : 'Nema odabranih simptoma'}\n\n`;
    
    markdownContent += `## Sažetak stanja\n`;
    markdownContent += `${analysis.summary}\n\n`;
    
    markdownContent += `## Procjena rizika\n`;
    analysis.risks.forEach((risk, index) => {
      markdownContent += `${index + 1}. ${risk.label} (Ozbiljnost: ${risk.severity}/10)\n`;
    });
    markdownContent += `\n`;
    
    markdownContent += `## Hitne akcije\n`;
    analysis.immediateActions.forEach((action, index) => {
      markdownContent += `${index + 1}. ${action}\n`;
    });
    markdownContent += `\n`;
    
    markdownContent += `## Diferencijalna dijagnoza\n`;
    analysis.differentialDiagnosis.forEach((diagnosis, index) => {
      markdownContent += `${index + 1}. ${diagnosis}\n`;
    });
    markdownContent += `\n`;
    
    markdownContent += `## Preporučena terapija\n`;
    markdownContent += `${analysis.drugDosage}\n\n`;
    
    markdownContent += `## Ključni medicinski pojmovi\n`;
    markdownContent += `${analysis.keywords.join(', ')}\n\n`;
    
    markdownContent += `---\n`;
    markdownContent += `**Napomena:** Ovaj izvještaj je generiran AI sustavom i služi isključivo za edukacijske i simulacijske svrhe.\n`;
    markdownContent += `Stvarne medicinske odluke moraju donositi kvalificirani zdravstveni djelatnici.\n`;

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

  // Show loading state until client-side rendering is ready
  if (!isClient || isLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-gray-900 dark:to-gray-800">
        <div className="text-xl text-gray-700 dark:text-gray-200">Učitavanje...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-gray-900 dark:to-gray-800 transition-colors duration-300">
      {/* Loading Spinner */}
      {isAnalyzing && <LoadingSpinner message={loadingMessage} />}
      
      <main className="max-w-7xl mx-auto p-4 sm:p-6">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
            <div className="flex-1">
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-4">
                AI Asistent za{' '}
                <span className="bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                  Hitne Slučajeve
                </span>
              </h1>
              <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
                Unesite podatke o pacijentu za trenutnu AI-analizu i preporuke za hitne medicinske slučajeve
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
              <span className="text-gray-900 dark:text-white">Podaci o pacijentu</span>
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">Starost (godine)</label>
                <input 
                  type="number" 
                  value={age} 
                  onChange={(e) => setAge(Number(e.target.value))} 
                  className="w-full p-3 text-lg rounded-xl bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                />
              </div>
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">Težina (kg)</label>
                <input 
                  type="number" 
                  value={weight} 
                  onChange={(e) => setWeight(Number(e.target.value))} 
                  className="w-full p-3 text-lg rounded-xl bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                />
              </div>
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">Spol</label>
                <select 
                  value={sex} 
                  onChange={(e) => setSex(e.target.value as 'male' | 'female' | 'other')} 
                  className="w-full p-3 text-lg rounded-xl bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-gray-900 dark:text-white"
                >
                  <option value="male">Muški</option>
                  <option value="female">Ženski</option>
                  <option value="other">Ostalo</option>
                </select>
              </div>
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">Poznate alergije</label>
                <input 
                  type="text" 
                  value={allergies} 
                  onChange={(e) => setAllergies(e.target.value)} 
                  placeholder="Npr. penicilin" 
                  className="w-full p-3 text-lg rounded-xl bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                />
              </div>
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">Trenutne terapije</label>
                <input 
                  type="text" 
                  value={medications} 
                  onChange={(e) => setMedications(e.target.value)} 
                  placeholder="Npr. metformin" 
                  className="w-full p-3 text-lg rounded-xl bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                />
              </div>
            </div>
          </div>

          {/* Vitals and Protocol */}
          <div className="p-6 bg-white/90 dark:bg-gray-900/90 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-lg transition-colors duration-300">
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <HeartPulse className="w-6 h-6 mr-3 text-blue-500" />
              <span className="text-gray-900 dark:text-white">Vitalni znakovi i protokol</span>
            </h2>
            <div className="space-y-6">
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">Protokol za hitne slučajeve</label>
                <select 
                  value={emergencyProtocol} 
                  onChange={(e) => setEmergencyProtocol(e.target.value)} 
                  className="w-full p-3 text-lg rounded-xl bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-gray-900 dark:text-white"
                >
                  <option value="">Odaberite protokol...</option>
                  <option value="Cardiac Arrest">Srčani zastoj</option>
                  <option value="Severe Bleeding">Obilno krvarenje</option>
                  <option value="Stroke">Moždani udar</option>
                  <option value="Diabetic Emergency">Dijabetička kriza</option>
                  <option value="Trauma">Trauma</option>
                </select>
              </div>
              
              {/* Blood Pressure with two sliders */}
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                  Krvni pritisak: <span className="font-bold text-blue-600 text-lg">{systolicBP}/{diastolicBP} mmHg</span>
                </label>
                <div className="space-y-4">
                  <div>
                    <label className="block mb-1 text-xs text-gray-500 dark:text-gray-400">Sistolički (gornji)</label>
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
                    <label className="block mb-1 text-xs text-gray-500 dark:text-gray-400">Dijastolički (donji)</label>
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
                { label: 'Puls (bpm)', value: heartRate, setter: setHeartRate, min: 40, max: 150 },
                { label: 'Temperatura (°C)', value: temperature, setter: setTemperature, min: 35, max: 41 },
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
                    Šećer u krvi: <span className="font-bold text-blue-600 text-lg">{bloodSugar} {bloodSugarUnit === 'mgdl' ? 'mg/dL' : 'mmol/L'}</span>
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
              <span className="text-gray-900 dark:text-white">Simptomi i bilješke</span>
            </h2>
            <div className="mb-6">
              <p className="text-sm font-medium mb-3 text-gray-700 dark:text-gray-300">Odaberite simptome:</p>
              <div className="grid grid-cols-2 gap-3">
                {allSymptoms.map((symptom) => (
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
              <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">Dodatne bilješke</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full p-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all min-h-[120px] text-lg text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                placeholder="Unesite relevantne detalje o situaciji..."
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
              {language === 'montenegrin' ? 'Analiziranje podataka...' : 'Analyzing data...'}
            </>
          ) : (
            language === 'montenegrin' ? 'Analiziraj podatke pacijenta' : 'Analyze Patient Data'
          )}
        </button>

        {/* Results */}
        <div className="mt-10">
          {error && (
            <div className="p-6 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-2xl mb-6 flex items-center shadow-lg">
              <AlertTriangle className="w-6 h-6 mr-3" />
              <div>
                <div className="font-medium text-lg">Greška:</div>
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
                      {language === 'montenegrin' ? 'Generiranje PDF-a...' : 'Generating PDF...'}
                    </>
                  ) : (
                    <>
                      <Download className="w-5 h-5 mr-2" />
                      PDF {language === 'montenegrin' ? 'Izvještaj' : 'Report'}
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

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="p-6 bg-white/90 dark:bg-gray-900/90 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-lg transition-colors duration-300">
                  <h2 className="text-xl font-bold mb-3 flex items-center">
                    <HeartPulse className="w-6 h-6 mr-3 text-blue-500" />
                    <span className="text-gray-900 dark:text-white">
                      {language === 'montenegrin' ? 'Pregled stanja' : 'Condition Overview'}
                    </span>
                  </h2>
                  <p className="text-gray-800 dark:text-gray-200 text-lg leading-relaxed">{analysis.summary}</p>
                </div>
                <div className="p-6 bg-white/90 dark:bg-gray-900/90 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-lg transition-colors duration-300">
                  <h2 className="text-xl font-bold mb-3 flex items-center">
                    <Triangle className="w-6 h-6 mr-3 text-blue-500" />
                    <span className="text-gray-900 dark:text-white">
                      {language === 'montenegrin' ? 'Neposredne akcije' : 'Immediate Actions'}
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
                    {language === 'montenegrin' ? 'Diferencijalna dijagnoza' : 'Differential Diagnosis'}
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
                      {language === 'montenegrin' ? 'Preporučeni lijek' : 'Recommended Medication'}
                    </span>
                  </h2>
                  <p className="text-gray-800 dark:text-gray-200 font-semibold text-lg p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
                    {analysis.drugDosage}
                  </p>
                </div>
                <div className="p-6 bg-white/90 dark:bg-gray-900/90 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-lg transition-colors duration-300">
                  <h2 className="text-xl font-bold mb-3 text-gray-900 dark:text-white">
                    {language === 'montenegrin' ? 'Ključne riječi' : 'Key Terms'}
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
                  {language === 'montenegrin' ? 'Procjena rizika' : 'Risk Assessment'}
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

        {/* Emergency Numbers Section */}
        <div className="mt-12 p-6 bg-white/90 dark:bg-gray-900/90 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-lg transition-colors duration-300">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 sm:mb-0 flex items-center">
              <Phone className="w-6 h-6 mr-3 text-blue-500" />
              {language === 'montenegrin' ? 'Hitni brojevi' : 'Emergency Numbers'}
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
                    {language === 'montenegrin' ? 'Kliknite za poziv' : 'Click to call'}
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
                  {language === 'montenegrin' ? 'Važna napomena' : 'Important Notice'}
                </h4>
                <p className="text-sm text-yellow-700 dark:text-yellow-400">
                  {language === 'montenegrin' 
                    ? 'U slučaju hitne medicinske situacije, odmah pozovite hitnu službu. Ovaj AI asistent služi isključivo za edukacijske i simulacijske svrhe.'
                    : 'In case of a medical emergency, immediately call emergency services. This AI assistant is for educational and simulation purposes only.'
                  }
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}