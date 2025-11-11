'use client';

import { useState, useRef } from 'react';
import { MessageCircle, Send, Loader2, Pill, Calendar, AlertCircle, FileText, Stethoscope } from 'lucide-react';

// Types
interface DiagnosisResult {
  condition: string;
  description: string;
  confidence: number;
  medications: Medication[];
  recommendations: string[];
  recoveryTime: RecoveryTime;
  severity: 'low' | 'moderate' | 'high';
  urgentRecommendations?: string[];
}

interface Medication {
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
  purpose: string;
  euApproved: boolean;
}

interface RecoveryTime {
  estimatedDays: number;
  description: string;
  phases: string[];
}

interface ChatMessage {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  diagnosis?: DiagnosisResult;
}

interface GeneralDiagnosisProps {
  language: 'montenegrin' | 'english';
}

// Improved type guard functions with better error reporting
function isValidDiagnosisResult(obj: unknown): obj is DiagnosisResult {
  if (!obj || typeof obj !== 'object') {
    console.log('Invalid diagnosis: Not an object', obj);
    return false;
  }
  
  const diagnosis = obj as Partial<DiagnosisResult>;
  
  const checks = {
    condition: typeof diagnosis.condition === 'string',
    description: typeof diagnosis.description === 'string',
    confidence: typeof diagnosis.confidence === 'number',
    medications: Array.isArray(diagnosis.medications) && diagnosis.medications.every(isValidMedication),
    recommendations: Array.isArray(diagnosis.recommendations) && diagnosis.recommendations.every((item: unknown) => typeof item === 'string'),
    recoveryTime: isValidRecoveryTime(diagnosis.recoveryTime),
    severity: typeof diagnosis.severity === 'string' && ['low', 'moderate', 'high'].includes(diagnosis.severity)
  };

  console.log('Diagnosis validation checks:', checks);
  
  return Object.values(checks).every(check => check);
}

function isValidMedication(obj: unknown): obj is Medication {
  if (!obj || typeof obj !== 'object') return false;
  
  const med = obj as Partial<Medication>;
  return (
    typeof med.name === 'string' &&
    typeof med.dosage === 'string' &&
    typeof med.frequency === 'string' &&
    typeof med.duration === 'string' &&
    typeof med.purpose === 'string' &&
    typeof med.euApproved === 'boolean'
  );
}

function isValidRecoveryTime(obj: unknown): obj is RecoveryTime {
  if (!obj || typeof obj !== 'object') return false;
  
  const recovery = obj as Partial<RecoveryTime>;
  return (
    typeof recovery.estimatedDays === 'number' &&
    typeof recovery.description === 'string' &&
    Array.isArray(recovery.phases) &&
    recovery.phases.every((item: unknown) => typeof item === 'string')
  );
}

// Fallback diagnosis data for testing
const createFallbackDiagnosis = (symptoms: string, language: 'montenegrin' | 'english'): DiagnosisResult => {
  const isMontenegrin = language === 'montenegrin';
  
  return {
    condition: isMontenegrin ? 'Prehlada' : 'Common Cold',
    description: isMontenegrin 
      ? 'Blaga respiratorna infekcija uzrokovana virusima'
      : 'Mild respiratory infection caused by viruses',
    confidence: 0.75,
    medications: [
      {
        name: 'Paracetamol',
        dosage: '500mg',
        frequency: isMontenegrin ? 'svakih 6 sati' : 'every 6 hours',
        duration: isMontenegrin ? '3-5 dana' : '3-5 days',
        purpose: isMontenegrin ? 'smanjenje temperature i bolova' : 'fever and pain reduction',
        euApproved: true
      }
    ],
    recommendations: [
      isMontenegrin ? 'Ostanite hidrirani' : 'Stay hydrated',
      isMontenegrin ? 'Odmarajte se' : 'Get plenty of rest',
      isMontenegrin ? 'Koristite fiziološki sprej za nos' : 'Use saline nasal spray'
    ],
    recoveryTime: {
      estimatedDays: 7,
      description: isMontenegrin ? 'Potpuni oporavak za 7-10 dana' : 'Full recovery within 7-10 days',
      phases: [
        isMontenegrin ? 'Akutna faza (1-3 dana)' : 'Acute phase (1-3 days)',
        isMontenegrin ? 'Oporavak (4-7 dana)' : 'Recovery phase (4-7 days)',
        isMontenegrin ? 'Potpuni oporavak (7+ dana)' : 'Complete recovery (7+ days)'
      ]
    },
    severity: 'low'
  };
};

type TranslationKeys = {
  title: string;
  subtitle: string;
  placeholder: string;
  send: string;
  analyzing: string;
  clearChat: string;
  exampleSymptoms: string;
  disclaimer: string;
  diagnosis: string;
  condition: string;
  confidence: string;
  description: string;
  medications: string;
  medication: string;
  dosage: string;
  frequency: string;
  duration: string;
  purpose: string;
  euApproved: string;
  recommendations: string;
  recoveryTime: string;
  estimatedDays: string;
  recoveryPhases: string;
  severity: string;
  severityLevels: {
    low: string;
    moderate: string;
    high: string;
  };
  urgentAdvice: string;
  noMedications: string;
  approved: string;
  notApproved: string;
};

const diagnosisTranslations: Record<'montenegrin' | 'english', TranslationKeys> = {
  montenegrin: {
    title: 'Opšta Medicinska Dijagnoza',
    subtitle: 'Opišite simptome za preliminarnu dijagnozu',
    placeholder: 'Opišite svoje simptome (npr. glavobolja, temperatura, kašalj...)',
    send: 'Pošalji',
    analyzing: 'Analiziram...',
    clearChat: 'Obriši razgovor',
    exampleSymptoms: 'Primjeri: glavobolja, vrućica, bolovi u mišićima, mučnina',
    disclaimer: 'Ovo je AI asistirana preliminarna procjena. Konzultujte ljekara za tačnu dijagnozu.',
    diagnosis: 'Dijagnoza',
    condition: 'Stanje',
    confidence: 'Pouzdanost',
    description: 'Opis',
    medications: 'Lijekovi',
    medication: 'Lijek',
    dosage: 'Doza',
    frequency: 'Učestalost',
    duration: 'Trajanje',
    purpose: 'Svrha',
    euApproved: 'Odobreno u EU',
    recommendations: 'Preporuke',
    recoveryTime: 'Vrijeme oporavka',
    estimatedDays: 'Procijenjeni dani',
    recoveryPhases: 'Faze oporavka',
    severity: 'Ozbiljnost',
    severityLevels: {
      low: 'Niska',
      moderate: 'Umjerena',
      high: 'Visoka'
    },
    urgentAdvice: 'Hitni savjeti',
    noMedications: 'Nema preporučenih lijekova',
    approved: 'Odobreno',
    notApproved: 'Nije odobreno'
  },
  english: {
    title: 'General Medical Diagnosis',
    subtitle: 'Describe your symptoms for preliminary diagnosis',
    placeholder: 'Describe your symptoms (e.g., headache, fever, cough...)',
    send: 'Send',
    analyzing: 'Analyzing...',
    clearChat: 'Clear Chat',
    exampleSymptoms: 'Examples: headache, fever, muscle pain, nausea',
    disclaimer: 'This is AI-assisted preliminary assessment. Consult a doctor for accurate diagnosis.',
    diagnosis: 'Diagnosis',
    condition: 'Condition',
    confidence: 'Confidence',
    description: 'Description',
    medications: 'Medications',
    medication: 'Medication',
    dosage: 'Dosage',
    frequency: 'Frequency',
    duration: 'Duration',
    purpose: 'Purpose',
    euApproved: 'EU Approved',
    recommendations: 'Recommendations',
    recoveryTime: 'Recovery Time',
    estimatedDays: 'Estimated Days',
    recoveryPhases: 'Recovery Phases',
    severity: 'Severity',
    severityLevels: {
      low: 'Low',
      moderate: 'Moderate',
      high: 'High'
    },
    urgentAdvice: 'Urgent Advice',
    noMedications: 'No medications recommended',
    approved: 'Approved',
    notApproved: 'Not approved'
  }
};

export default function GeneralDiagnosis({ language }: GeneralDiagnosisProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const t = diagnosisTranslations[language];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isAnalyzing) return;

    const userMessage: ChatMessage = {
      id: Math.random().toString(36).substr(2, 9),
      type: 'user',
      content: inputValue.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsAnalyzing(true);

    try {
      // Test mode - use fallback data for now
      const useTestMode = true; // Set to false when API is ready
      
      let diagnosisData: unknown;

      if (useTestMode) {
        // Use fallback data for testing
        await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate API delay
        diagnosisData = createFallbackDiagnosis(inputValue.trim(), language);
      } else {
        // Real API call
        const response = await fetch('/api/ai/diagnose-symptoms', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            symptoms: inputValue.trim(),
            language
          }),
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error('API error:', response.status, errorText);
          throw new Error(`Diagnosis failed: ${response.status}`);
        }

        diagnosisData = await response.json();
        console.log('Raw API response:', diagnosisData);
      }

      // Validate the response
      if (isValidDiagnosisResult(diagnosisData)) {
        const assistantMessage: ChatMessage = {
          id: Math.random().toString(36).substr(2, 9),
          type: 'assistant',
          content: language === 'montenegrin' 
            ? `Na osnovu opisanih simptoma, preliminarna dijagnoza je: ${diagnosisData.condition}`
            : `Based on described symptoms, preliminary diagnosis is: ${diagnosisData.condition}`,
          timestamp: new Date(),
          diagnosis: diagnosisData
        };
        setMessages(prev => [...prev, assistantMessage]);
      } else {
        console.error('Invalid diagnosis data structure:', diagnosisData);
        // Use fallback data if API returns invalid structure
        const fallbackData = createFallbackDiagnosis(inputValue.trim(), language);
        const assistantMessage: ChatMessage = {
          id: Math.random().toString(36).substr(2, 9),
          type: 'assistant',
          content: language === 'montenegrin' 
            ? `Na osnovu opisanih simptoma, preliminarna dijagnoza je: ${fallbackData.condition}`
            : `Based on described symptoms, preliminary diagnosis is: ${fallbackData.condition}`,
          timestamp: new Date(),
          diagnosis: fallbackData
        };
        setMessages(prev => [...prev, assistantMessage]);
      }
    } catch (error) {
      console.error('Diagnosis error:', error);
      // Use fallback data on error
      const fallbackData = createFallbackDiagnosis(inputValue.trim(), language);
      const assistantMessage: ChatMessage = {
        id: Math.random().toString(36).substr(2, 9),
        type: 'assistant',
        content: language === 'montenegrin'
          ? `Na osnovu opisanih simptoma, preliminarna dijagnoza je: ${fallbackData.condition}`
          : `Based on described symptoms, preliminary diagnosis is: ${fallbackData.condition}`,
        timestamp: new Date(),
        diagnosis: fallbackData
      };
      setMessages(prev => [...prev, assistantMessage]);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const clearChat = () => {
    setMessages([]);
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'low': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'moderate': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'high': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="p-6 bg-white/90 dark:bg-gray-900/90 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-lg transition-colors duration-300">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold flex items-center text-gray-900 dark:text-white">
            <Stethoscope className="w-6 h-6 mr-3 text-blue-500" />
            {t.title}
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            {t.subtitle}
          </p>
        </div>
        {messages.length > 0 && (
          <button
            onClick={clearChat}
            className="text-sm text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 transition-colors"
          >
            {t.clearChat}
          </button>
        )}
      </div>

      {/* Chat Messages */}
      <div className="mb-4 h-96 overflow-y-auto rounded-xl bg-gray-50 dark:bg-gray-800 p-4">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-500 dark:text-gray-400">
            <MessageCircle className="w-12 h-12 mb-4 opacity-50" />
            <p className="text-center mb-2">{t.placeholder}</p>
            <p className="text-sm text-center opacity-75">{t.exampleSymptoms}</p>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl p-4 ${
                    message.type === 'user'
                      ? 'bg-blue-500 text-white'
                      : 'bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600'
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                  <p className={`text-xs mt-2 ${message.type === 'user' ? 'text-blue-100' : 'text-gray-500 dark:text-gray-400'}`}>
                    {message.timestamp.toLocaleTimeString()}
                  </p>

                  {/* Diagnosis Details */}
                  {message.diagnosis && (
                    <div className="mt-4 space-y-4 border-t pt-4 border-gray-200 dark:border-gray-600">
                      {/* Condition & Confidence */}
                      <div className="flex flex-wrap items-center gap-4">
                        <div>
                          <h4 className="font-semibold text-gray-900 dark:text-white text-sm">
                            {t.condition}:
                          </h4>
                          <p className="text-sm text-gray-700 dark:text-gray-300">
                            {message.diagnosis.condition}
                          </p>
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900 dark:text-white text-sm">
                            {t.confidence}:
                          </h4>
                          <div className="flex items-center space-x-2">
                            <div className="w-16 bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                              <div
                                className="bg-green-500 h-2 rounded-full"
                                style={{ width: `${message.diagnosis.confidence * 100}%` }}
                              ></div>
                            </div>
                            <span className="text-sm font-medium">
                              {(message.diagnosis.confidence * 100).toFixed(0)}%
                            </span>
                          </div>
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900 dark:text-white text-sm">
                            {t.severity}:
                          </h4>
                          <span className={`text-xs px-2 py-1 rounded-full ${getSeverityColor(message.diagnosis.severity)}`}>
                            {t.severityLevels[message.diagnosis.severity]}
                          </span>
                        </div>
                      </div>

                      {/* Description */}
                      <div>
                        <h4 className="font-semibold text-gray-900 dark:text-white text-sm mb-2 flex items-center">
                          <FileText className="w-4 h-4 mr-2" />
                          {t.description}
                        </h4>
                        <p className="text-sm text-gray-700 dark:text-gray-300 bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
                          {message.diagnosis.description}
                        </p>
                      </div>

                      {/* Urgent Recommendations */}
                      {message.diagnosis.urgentRecommendations && message.diagnosis.urgentRecommendations.length > 0 && (
                        <div>
                          <h4 className="font-semibold text-red-600 dark:text-red-400 text-sm mb-2 flex items-center">
                            <AlertCircle className="w-4 h-4 mr-2" />
                            {t.urgentAdvice}
                          </h4>
                          <ul className="space-y-1">
                            {message.diagnosis.urgentRecommendations.map((rec, index) => (
                              <li key={index} className="flex items-start text-sm text-red-700 dark:text-red-300">
                                <span className="w-2 h-2 bg-red-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                                {rec}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Medications */}
                      <div>
                        <h4 className="font-semibold text-gray-900 dark:text-white text-sm mb-3 flex items-center">
                          <Pill className="w-4 h-4 mr-2" />
                          {t.medications}
                        </h4>
                        {message.diagnosis.medications.length > 0 ? (
                          <div className="space-y-3">
                            {message.diagnosis.medications.map((med, index) => (
                              <div key={index} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg p-3">
                                <div className="flex justify-between items-start mb-2">
                                  <h5 className="font-medium text-gray-900 dark:text-white text-sm">
                                    {med.name}
                                  </h5>
                                  <span className={`text-xs px-2 py-1 rounded-full ${
                                    med.euApproved 
                                      ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                      : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                                  }`}>
                                    {med.euApproved ? t.approved : t.notApproved}
                                  </span>
                                </div>
                                <div className="grid grid-cols-2 gap-2 text-xs">
                                  <div>
                                    <span className="font-medium text-gray-600 dark:text-gray-400">{t.dosage}:</span>
                                    <span className="ml-1 text-gray-700 dark:text-gray-300">{med.dosage}</span>
                                  </div>
                                  <div>
                                    <span className="font-medium text-gray-600 dark:text-gray-400">{t.frequency}:</span>
                                    <span className="ml-1 text-gray-700 dark:text-gray-300">{med.frequency}</span>
                                  </div>
                                  <div>
                                    <span className="font-medium text-gray-600 dark:text-gray-400">{t.duration}:</span>
                                    <span className="ml-1 text-gray-700 dark:text-gray-300">{med.duration}</span>
                                  </div>
                                  <div>
                                    <span className="font-medium text-gray-600 dark:text-gray-400">{t.purpose}:</span>
                                    <span className="ml-1 text-gray-700 dark:text-gray-300">{med.purpose}</span>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-sm text-gray-500 dark:text-gray-400">{t.noMedications}</p>
                        )}
                      </div>

                      {/* Recovery Time */}
                      <div>
                        <h4 className="font-semibold text-gray-900 dark:text-white text-sm mb-3 flex items-center">
                          <Calendar className="w-4 h-4 mr-2" />
                          {t.recoveryTime}
                        </h4>
                        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-3">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-medium text-green-800 dark:text-green-200">
                              {t.estimatedDays}: {message.diagnosis.recoveryTime.estimatedDays}
                            </span>
                          </div>
                          <p className="text-sm text-green-700 dark:text-green-300 mb-3">
                            {message.diagnosis.recoveryTime.description}
                          </p>
                          <div>
                            <h5 className="font-medium text-green-800 dark:text-green-200 text-sm mb-2">
                              {t.recoveryPhases}:
                            </h5>
                            <ul className="space-y-1">
                              {message.diagnosis.recoveryTime.phases.map((phase, index) => (
                                <li key={index} className="flex items-start text-sm text-green-700 dark:text-green-300">
                                  <span className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                                  {phase}
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </div>

                      {/* General Recommendations */}
                      <div>
                        <h4 className="font-semibold text-gray-900 dark:text-white text-sm mb-2">
                          {t.recommendations}
                        </h4>
                        <ul className="space-y-2">
                          {message.diagnosis.recommendations.map((rec, index) => (
                            <li key={index} className="flex items-start text-sm text-gray-700 dark:text-gray-300">
                              <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                              {rec}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
            {isAnalyzing && (
              <div className="flex justify-start">
                <div className="bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-2xl p-4">
                  <div className="flex items-center space-x-2">
                    <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
                    <span className="text-sm text-gray-600 dark:text-gray-400">{t.analyzing}</span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="flex space-x-4">
        <div className="flex-1">
          <textarea
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={t.placeholder}
            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            rows={3}
            disabled={isAnalyzing}
          />
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
            {t.disclaimer}
          </p>
        </div>
        <button
          onClick={handleSendMessage}
          disabled={!inputValue.trim() || isAnalyzing}
          className="self-end bg-blue-600 text-white p-3 rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isAnalyzing ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <Send className="w-5 h-5" />
          )}
        </button>
      </div>
    </div>
  );
}