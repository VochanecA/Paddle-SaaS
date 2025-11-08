'use client';

import { useState, useEffect, useRef, ChangeEvent } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import type { User } from '@supabase/supabase-js';
import { HeartPulse, FlaskConical, Stethoscope, AlertTriangle, Syringe, Clipboard, Triangle, Wrench, Download } from 'lucide-react';

// Types
interface AnalysisResult {
  summary: string;
  risks: { label: string; severity: number }[];
  keywords: string[];
  immediateActions: string[];
  differentialDiagnosis: string[];
  drugDosage: string;
}

// Loading Spinner Component
const LoadingSpinner = ({ message }: { message: string }) => (
  <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
    <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 max-w-md mx-4 shadow-xl">
      <div className="flex flex-col items-center">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-rose-200 border-t-rose-600 rounded-full animate-spin"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-8 h-8 bg-gradient-to-r from-rose-600 to-pink-600 rounded-full animate-pulse"></div>
          </div>
        </div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mt-4 mb-2">
          AI Medicinska Analiza
        </h3>
        <p className="text-gray-600 dark:text-gray-400 text-center text-sm mb-4">
          {message}
        </p>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
          <div className="bg-gradient-to-r from-rose-600 to-pink-600 h-2 rounded-full animate-pulse"></div>
        </div>
        <div className="flex space-x-1 mt-3">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="w-2 h-2 bg-rose-600 rounded-full animate-bounce"
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

export default function MedicalAssistantDashboard() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('Inicijalizacija medicinskog AI...');

  // Inputs
  const [age, setAge] = useState<number>(30);
  const [weight, setWeight] = useState<number>(70);
  const [sex, setSex] = useState<'male' | 'female' | 'other'>('male');
  const [allergies, setAllergies] = useState('');
  const [medications, setMedications] = useState('');
  const [emergencyProtocol, setEmergencyProtocol] = useState('');
  const [symptoms, setSymptoms] = useState<string[]>([]);
  const [bloodPressure, setBloodPressure] = useState<number>(120);
  const [bloodSugar, setBloodSugar] = useState<number>(90);
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

  // Chart drawing
  useEffect(() => {
    if (!canvasRef.current || !analysis?.risks.length) return;
    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;

    const w = canvasRef.current.width;
    const h = canvasRef.current.height;
    ctx.clearRect(0, 0, w, h);

    const maxSeverity = Math.max(...analysis.risks.map((r) => r.severity), 1);
    const barWidth = (w - 100) / analysis.risks.length;

    analysis.risks.forEach((r, i) => {
      const barHeight = (r.severity / maxSeverity) * (h - 60);
      const x = 60 + i * barWidth;
      const y = h - 30 - barHeight;

      const gradient = ctx.createLinearGradient(x, y, x, h - 30);
      gradient.addColorStop(0, '#ef4444');
      gradient.addColorStop(1, '#f59e0b');
      ctx.fillStyle = gradient;

      ctx.fillRect(x + 10, y, barWidth - 20, barHeight);

      ctx.fillStyle = '#111827';
      ctx.font = '12px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(r.label, x + barWidth / 2, h - 10);
    });
  }, [analysis]);

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

  // Handle AI request
  async function analyze() {
    setError(null);
    setAnalysis(null);
    setIsAnalyzing(true);

    try {
      const messages = [
        {
          role: 'system',
          content:
            `You are an Emergency Medical AI for first responders. Your task is to analyze patient data and provide immediate, actionable guidance. Always return a single, valid JSON object with the following keys:
            1. summary (string): A brief summary of the patient's condition.
            2. risks (array of {label: string; severity: number 1-10}): A list of potential risks and their severity scores.
            3. keywords (string[]): Key medical terms.
            4. immediateActions (string[]): A list of concise, step-by-step actions for the first responder.
            5. differentialDiagnosis (string[]): A list of possible medical conditions to consider.
            6. drugDosage (string): A simulated drug and dosage recommendation, e.g., "Administer 325 mg Aspirin." Always include a disclaimer that this is for simulation only.
            
            Based on the following patient data, generate the JSON response:`,
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
            - Blood Pressure: ${bloodPressure} mmHg
            - Blood Sugar: ${bloodSugar} mg/dL
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
      if (!parsed?.summary) throw new Error('Invalid AI response. Please try again.');
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
    markdownContent += `- **Krvni pritisak:** ${bloodPressure} mmHg\n`;
    markdownContent += `- **Šećer u krvi:** ${bloodSugar} mg/dL\n`;
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

  if (isLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-gray-950">
        <div className="text-xl text-gray-700 dark:text-gray-200">Učitavanje...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      {/* Loading Spinner */}
      {isAnalyzing && <LoadingSpinner message={loadingMessage} />}
      
      <main className="max-w-7xl mx-auto p-6">
        <h1 className="text-4xl font-bold text-center mb-8 bg-gradient-to-r from-rose-600 to-pink-600 text-transparent bg-clip-text">
          AI Asistent za Hitne Slučajeve
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {/* Patient Data */}
          <div className="p-6 bg-gray-50 dark:bg-gray-900 rounded-xl border dark:border-gray-700">
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <Clipboard className="w-5 h-5 mr-2 text-rose-500" />
              Podaci o pacijentu
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block mb-1 text-sm font-medium">Starost (godine)</label>
                <input type="number" value={age} onChange={(e) => setAge(Number(e.target.value))} className="w-full p-2 rounded-md bg-white dark:bg-gray-800 border" />
              </div>
              <div>
                <label className="block mb-1 text-sm font-medium">Težina (kg)</label>
                <input type="number" value={weight} onChange={(e) => setWeight(Number(e.target.value))} className="w-full p-2 rounded-md bg-white dark:bg-gray-800 border" />
              </div>
              <div>
                <label className="block mb-1 text-sm font-medium">Spol</label>
                <select value={sex} onChange={(e) => setSex(e.target.value as 'male' | 'female' | 'other')} className="w-full p-2 rounded-md bg-white dark:bg-gray-800 border">
                  <option value="male">Muški</option>
                  <option value="female">Ženski</option>
                  <option value="other">Ostalo</option>
                </select>
              </div>
              <div>
                <label className="block mb-1 text-sm font-medium">Poznate alergije</label>
                <input type="text" value={allergies} onChange={(e) => setAllergies(e.target.value)} placeholder="Npr. penicilin" className="w-full p-2 rounded-md bg-white dark:bg-gray-800 border" />
              </div>
              <div>
                <label className="block mb-1 text-sm font-medium">Trenutne terapije</label>
                <input type="text" value={medications} onChange={(e) => setMedications(e.target.value)} placeholder="Npr. metformin" className="w-full p-2 rounded-md bg-white dark:bg-gray-800 border" />
              </div>
            </div>
          </div>

          {/* Vitals and Protocol */}
          <div className="p-6 bg-gray-50 dark:bg-gray-900 rounded-xl border dark:border-gray-700">
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <HeartPulse className="w-5 h-5 mr-2 text-rose-500" />
              Vitalni znakovi i protokol
            </h2>
            <div className="space-y-6">
              <div>
                <label className="block mb-1 text-sm font-medium">Protokol za hitne slučajeve</label>
                <select value={emergencyProtocol} onChange={(e) => setEmergencyProtocol(e.target.value)} className="w-full p-2 rounded-md bg-white dark:bg-gray-800 border">
                  <option value="">Odaberite protokol...</option>
                  <option value="Cardiac Arrest">Srčani zastoj</option>
                  <option value="Severe Bleeding">Obilno krvarenje</option>
                  <option value="Stroke">Moždani udar</option>
                  <option value="Diabetic Emergency">Dijabetička kriza</option>
                  <option value="Trauma">Trauma</option>
                </select>
              </div>
              {[
                { label: 'Krvni pritisak (mmHg)', value: bloodPressure, setter: setBloodPressure, min: 80, max: 200 },
                { label: 'Šećer u krvi (mg/dL)', value: bloodSugar, setter: setBloodSugar, min: 60, max: 200 },
                { label: 'Puls (bpm)', value: heartRate, setter: setHeartRate, min: 40, max: 150 },
                { label: 'Temperatura (°C)', value: temperature, setter: setTemperature, min: 35, max: 41 },
              ].map((vital) => (
                <div key={vital.label}>
                  <label className="block mb-1 text-sm font-medium">
                    {vital.label}: <span className="font-bold">{vital.value}</span>
                  </label>
                  <input
                    type="range"
                    min={vital.min}
                    max={vital.max}
                    value={vital.value}
                    onChange={(e) => vital.setter(Number(e.target.value))}
                    className="w-full accent-rose-600"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Symptoms and Notes */}
          <div className="p-6 bg-gray-50 dark:bg-gray-900 rounded-xl border dark:border-gray-700">
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <Stethoscope className="w-5 h-5 mr-2 text-rose-500" />
              Simptomi i bilješke
            </h2>
            <div className="mb-4">
              <p className="text-sm font-medium mb-2">Odaberite simptome:</p>
              <div className="grid grid-cols-2 sm:grid-cols-2 gap-3">
                {allSymptoms.map((symptom) => (
                  <label
                    key={symptom}
                    className={`flex items-center p-2 rounded-lg border cursor-pointer transition ${
                      symptoms.includes(symptom)
                        ? 'bg-rose-100 border-rose-400 text-rose-800 font-semibold'
                        : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-200'
                    }`}
                  >
                    <input type="checkbox" checked={symptoms.includes(symptom)} onChange={() => toggleSymptom(symptom)} className="hidden" />
                    {symptom}
                  </label>
                ))}
              </div>
            </div>
            <div>
              <label className="block mb-1 text-sm font-medium">Dodatne bilješke</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full p-2 rounded-md border dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 min-h-[100px]"
                placeholder="Unesite relevantne detalje o situaciji..."
              />
            </div>
          </div>
        </div>

        {/* Analyze button */}
        <button
          onClick={analyze}
          disabled={isAnalyzing}
          className={`w-full py-3 bg-gradient-to-r from-rose-600 to-pink-600 text-white rounded-xl font-semibold shadow hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center ${isAnalyzing ? 'animate-pulse' : ''}`}
        >
          {isAnalyzing ? (
            <>
              <Wrench className="w-5 h-5 mr-2 animate-spin" />
              Analiziranje...
            </>
          ) : (
            'Analiziraj podatke pacijenta'
          )}
        </button>

        {/* Results */}
        <div className="mt-10">
          {error && (
            <div className="p-4 bg-red-100 text-red-700 rounded-xl mb-4 flex items-center">
              <AlertTriangle className="w-5 h-5 mr-2" />
              Greška: {error}
            </div>
          )}
          {analysis && (
            <div className="space-y-6" ref={reportRef}>
              {/* Export Options */}
              <div className="flex flex-wrap gap-3 mb-6">
                <button
                  onClick={generateProfessionalPDF}
                  disabled={exporting === 'pdf'}
                  className="flex items-center px-4 py-2 bg-gradient-to-r from-rose-600 to-pink-600 text-white rounded-lg transition-all shadow-md hover:shadow-lg disabled:opacity-50"
                >
                  {exporting === 'pdf' ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      Generiranje PDF-a...
                    </>
                  ) : (
                    <>
                      <Download className="w-4 h-4 mr-2" />
                      PDF Izvještaj
                    </>
                  )}
                </button>
                <button
                  onClick={exportMarkdown}
                  disabled={exporting === 'markdown'}
                  className="flex items-center px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-lg transition-all shadow-md hover:shadow-lg disabled:opacity-50"
                >
                  {exporting === 'markdown' ? 'Priprema...' : '📝 Markdown Izvještaj'}
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-6 bg-gray-50 dark:bg-gray-900 rounded-xl border dark:border-gray-700">
                  <h2 className="text-xl font-bold mb-2 flex items-center">
                    <HeartPulse className="w-5 h-5 mr-2 text-rose-500" />
                    Pregled stanja
                  </h2>
                  <p className="text-gray-800 dark:text-gray-200">{analysis.summary}</p>
                </div>
                <div className="p-6 bg-gray-50 dark:bg-gray-900 rounded-xl border dark:border-gray-700">
                  <h2 className="text-xl font-bold mb-2 flex items-center">
                    <Triangle className="w-5 h-5 mr-2 text-rose-500" />
                    Neposredne akcije
                  </h2>
                  <ul className="list-disc list-inside text-gray-800 dark:text-gray-200 space-y-1">
                    {analysis.immediateActions.map((action, i) => (
                      <li key={i}>{action}</li>
                    ))}
                  </ul>
                </div>
              </div>
              
              <div className="p-6 bg-gray-50 dark:bg-gray-900 rounded-xl border dark:border-gray-700">
                <h2 className="text-xl font-bold mb-2 flex items-center">
                  <Stethoscope className="w-5 h-5 mr-2 text-rose-500" />
                  Diferencijalna dijagnoza
                </h2>
                <ul className="list-disc list-inside text-gray-800 dark:text-gray-200 space-y-1">
                  {analysis.differentialDiagnosis.map((diag, i) => (
                    <li key={i}>{diag}</li>
                  ))}
                </ul>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-6 bg-gray-50 dark:bg-gray-900 rounded-xl border dark:border-gray-700">
                  <h2 className="text-xl font-bold mb-2 flex items-center">
                    <Syringe className="w-5 h-5 mr-2 text-rose-500" />
                    Preporučeni lijek
                  </h2>
                  <p className="text-gray-800 dark:text-gray-200 font-semibold">{analysis.drugDosage}</p>
                </div>
                <div className="p-6 bg-gray-50 dark:bg-gray-900 rounded-xl border dark:border-gray-700">
                  <h2 className="text-xl font-bold mb-2">Ključne riječi</h2>
                  <div className="flex flex-wrap gap-2">
                    {analysis.keywords.map((kw, i) => (
                      <span
                        key={i}
                        className="px-3 py-1 bg-rose-100 text-rose-800 rounded-full text-sm font-medium"
                      >
                        {kw}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
              
              <div className="p-6 bg-gray-50 dark:bg-gray-900 rounded-xl border dark:border-gray-700">
                <h2 className="text-xl font-bold mb-2">Procjena rizika</h2>
                <canvas
                  ref={canvasRef}
                  width={600}
                  height={300}
                  className="w-full border rounded-xl bg-white dark:bg-gray-900"
                />
              </div>
            </div>
          )}
        </div>
      </main>
      
      {/* Print Styles */}
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .print-container, .print-container * {
            visibility: visible;
          }
          .print-container {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            padding: 20px;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
}