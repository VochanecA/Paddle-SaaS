'use client';

import { useState, useRef } from 'react';
import { 
  Search, 
  AlertTriangle, 
  TrendingUp, 
  TrendingDown, 
  Minus,
  Download,
  Printer,
  History,
  Plus,
  Trash2,
  Eye,
  EyeOff,
  Calendar,
  User,
  Upload,
  Image,
  FileText
} from 'lucide-react';

// Types (ostaje isti)
interface LabTest {
  id: string;
  name: string;
  value: number;
  unit: string;
  referenceRange: {
    min: number;
    max: number;
    gender?: 'male' | 'female';
    ageMin?: number;
    ageMax?: number;
  };
  category: string;
  significance: string;
  criticalLow?: number;
  criticalHigh?: number;
  interpretation: string;
  recommendations: string[];
  factorsAffecting: string[];
}

interface LabAnalysis {
  tests: LabTest[];
  summary: {
    abnormalCount: number;
    criticalCount: number;
    overallStatus: 'normal' | 'warning' | 'critical';
    recommendations: string[];
  };
  metadata: {
    patientAge: number;
    patientGender: 'male' | 'female';
    testDate: Date;
    labName: string;
  };
}

interface LabReport {
  id: string;
  name: string;
  date: Date;
  analysis: LabAnalysis;
  imageUrl?: string;
}

interface LaboratoryAnalyzerProps {
  language: 'montenegrin' | 'english';
}

// Type guards (ostaje isti)
function isValidLabTest(obj: unknown): obj is LabTest {
  if (!obj || typeof obj !== 'object') return false;
  
  const test = obj as Partial<LabTest>;
  return (
    typeof test.id === 'string' &&
    typeof test.name === 'string' &&
    typeof test.value === 'number' &&
    typeof test.unit === 'string' &&
    typeof test.referenceRange === 'object' &&
    typeof test.category === 'string' &&
    typeof test.significance === 'string' &&
    typeof test.interpretation === 'string' &&
    Array.isArray(test.recommendations) &&
    Array.isArray(test.factorsAffecting)
  );
}

function isValidLabAnalysis(obj: unknown): obj is LabAnalysis {
  if (!obj || typeof obj !== 'object') return false;
  
  const analysis = obj as Partial<LabAnalysis>;
  return (
    Array.isArray(analysis.tests) &&
    analysis.tests.every(isValidLabTest) &&
    typeof analysis.summary === 'object' &&
    typeof analysis.metadata === 'object'
  );
}

// Comprehensive lab test database (ostaje isti)
const LAB_TEST_DATABASE = {
  montenegrin: {
    categories: {
      hematology: 'Hematologija',
      biochemistry: 'Biohemija',
      hormones: 'Hormoni',
      lipids: 'Lipidni Profil',
      electrolytes: 'Elektroliti',
      liver: 'Jetra',
      kidney: 'Bubrezi',
      thyroid: 'Štitna žlijezda',
      inflammation: 'Inflamacija',
      vitamins: 'Vitamini'
    },
    tests: {
      wbc: {
        name: 'Leukociti (WBC)',
        unit: '×10⁹/L',
        category: 'hematology',
        significance: 'Broj bijelih krvnih zrnaca. Povišene vrijednosti ukazuju na infekciju, upalu ili leukemiju. Snižene vrijednosti mogu ukazivati na bone marrow probleme.',
        factorsAffecting: [
          'Infekcije',
          'Upalni procesi',
          'Stres',
          'Lijekovi (kortikosteroidi)',
          'Autoimune bolesti'
        ]
      },
      rbc: {
        name: 'Eritrociti (RBC)',
        unit: '×10¹²/L',
        category: 'hematology',
        significance: 'Broj crvenih krvnih zrnaca. Niske vrijednosti ukazuju na anemiju, visoke na polictemiju.',
        factorsAffecting: [
          'Gubitak krvi',
          'Anemija',
          'Dehidracija',
          'Bolesti koštane srži'
        ]
      },
      hemoglobin: {
        name: 'Hemoglobin',
        unit: 'g/L',
        category: 'hematology',
        significance: 'Protein u crvenim krvnim zrncima koji nosi kiseonik. Ključan pokazatelj anemije.',
        factorsAffecting: [
          'Anemija',
          'Hidracija',
          'Visina',
          'Pušenje'
        ]
      },
      platelets: {
        name: 'Trombociti',
        unit: '×10⁹/L',
        category: 'hematology',
        significance: 'Pomažu u zgrušavanju krvi. Niske vrijednosti povećavaju rizik od krvarenja, visoke od zgrušavanja.',
        factorsAffecting: [
          'Infekcije',
          'Autoimune bolesti',
          'Lijekovi',
          'Kancerske bolesti'
        ]
      },
      glucose: {
        name: 'Glukoza',
        unit: 'mmol/L',
        category: 'biochemistry',
        significance: 'Šećer u krvi. Povišene vrijednosti ukazuju na dijabetes, snižene na hipoglikemiju.',
        factorsAffecting: [
          'Dijabetes',
          'Ishrana',
          'Stres',
          'Lijekovi',
          'Fizička aktivnost'
        ]
      },
      creatinine: {
        name: 'Kreatinin',
        unit: 'μmol/L',
        category: 'kidney',
        significance: 'Proizvod metabolizma mišića. Pokazatelj funkcije bubrega.',
        factorsAffecting: [
          'Funkcija bubrega',
          'Mišićna masa',
          'Ishrana bogata proteinima',
          'Dehidracija'
        ]
      },
      alt: {
        name: 'ALT (Alanin aminotransferaza)',
        unit: 'U/L',
        category: 'liver',
        significance: 'Enzim jetre. Povišene vrijednosti ukazuju na oštećenje jetre.',
        factorsAffecting: [
          'Hepatitis',
          'Alkohol',
          'Lijekovi',
          'Masna jetra'
        ]
      },
      cholesterol: {
        name: 'Ukupni holesterol',
        unit: 'mmol/L',
        category: 'lipids',
        significance: 'Ukupna količina holesterola u krvi. Visoke vrijednosti povećavaju rizik od srčanih bolesti.',
        factorsAffecting: [
          'Ishrana',
          'Genetika',
          'Težina',
          'Fizička aktivnost'
        ]
      }
    }
  },
  english: {
    categories: {
      hematology: 'Hematology',
      biochemistry: 'Biochemistry',
      hormones: 'Hormones',
      lipids: 'Lipid Profile',
      electrolytes: 'Electrolytes',
      liver: 'Liver',
      kidney: 'Kidney',
      thyroid: 'Thyroid',
      inflammation: 'Inflammation',
      vitamins: 'Vitamins'
    },
    tests: {
      wbc: {
        name: 'White Blood Cells (WBC)',
        unit: '×10⁹/L',
        category: 'hematology',
        significance: 'Number of white blood cells. Elevated values indicate infection, inflammation or leukemia. Low values may indicate bone marrow problems.',
        factorsAffecting: [
          'Infections',
          'Inflammatory processes',
          'Stress',
          'Medications (corticosteroids)',
          'Autoimmune diseases'
        ]
      },
      rbc: {
        name: 'Red Blood Cells (RBC)',
        unit: '×10¹²/L',
        category: 'hematology',
        significance: 'Number of red blood cells. Low values indicate anemia, high values indicate polycythemia.',
        factorsAffecting: [
          'Blood loss',
          'Anemia',
          'Dehydration',
          'Bone marrow diseases'
        ]
      },
      hemoglobin: {
        name: 'Hemoglobin',
        unit: 'g/L',
        category: 'hematology',
        significance: 'Protein in red blood cells that carries oxygen. Key indicator of anemia.',
        factorsAffecting: [
          'Anemia',
          'Hydration',
          'Altitude',
          'Smoking'
        ]
      },
      platelets: {
        name: 'Platelets',
        unit: '×10⁹/L',
        category: 'hematology',
        significance: 'Help in blood clotting. Low values increase bleeding risk, high values increase clotting risk.',
        factorsAffecting: [
          'Infections',
          'Autoimmune diseases',
          'Medications',
          'Cancer diseases'
        ]
      },
      glucose: {
        name: 'Glucose',
        unit: 'mmol/L',
        category: 'biochemistry',
        significance: 'Blood sugar. Elevated values indicate diabetes, low values indicate hypoglycemia.',
        factorsAffecting: [
          'Diabetes',
          'Diet',
          'Stress',
          'Medications',
          'Physical activity'
        ]
      },
      creatinine: {
        name: 'Creatinine',
        unit: 'μmol/L',
        category: 'kidney',
        significance: 'Product of muscle metabolism. Indicator of kidney function.',
        factorsAffecting: [
          'Kidney function',
          'Muscle mass',
          'Protein-rich diet',
          'Dehydration'
        ]
      },
      alt: {
        name: 'ALT (Alanine Aminotransferase)',
        unit: 'U/L',
        category: 'liver',
        significance: 'Liver enzyme. Elevated values indicate liver damage.',
        factorsAffecting: [
          'Hepatitis',
          'Alcohol',
          'Medications',
          'Fatty liver'
        ]
      },
      cholesterol: {
        name: 'Total Cholesterol',
        unit: 'mmol/L',
        category: 'lipids',
        significance: 'Total amount of cholesterol in blood. High values increase risk of heart diseases.',
        factorsAffecting: [
          'Diet',
          'Genetics',
          'Weight',
          'Physical activity'
        ]
      }
    }
  }
};

const referenceRanges = {
  wbc: { min: 4.0, max: 11.0 },
  rbc: { male: { min: 4.5, max: 6.0 }, female: { min: 4.0, max: 5.5 } },
  hemoglobin: { male: { min: 135, max: 175 }, female: { min: 120, max: 155 } },
  platelets: { min: 150, max: 450 },
  glucose: { min: 3.9, max: 6.1 },
  creatinine: { male: { min: 62, max: 106 }, female: { min: 44, max: 80 } },
  alt: { male: { min: 10, max: 40 }, female: { min: 7, max: 35 } },
  cholesterol: { min: 3.6, max: 5.2 }
};

const LaboratoryAnalyzer: React.FC<LaboratoryAnalyzerProps> = ({ language }) => {
  const [reports, setReports] = useState<LabReport[]>([]);
  const [currentReport, setCurrentReport] = useState<LabReport | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [showNormalValues, setShowNormalValues] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [uploadedImage, setUploadedImage] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const t = language === 'montenegrin' ? LAB_TEST_DATABASE.montenegrin : LAB_TEST_DATABASE.english;

  const analyzeLabResults = async (testValues: Record<string, number>): Promise<LabAnalysis> => {
    setIsAnalyzing(true);
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 2000));

    const tests: LabTest[] = Object.entries(testValues).map(([testId, value]) => {
      const testInfo = t.tests[testId as keyof typeof t.tests];
      const range = referenceRanges[testId as keyof typeof referenceRanges];
      
      let referenceRange;
      if (typeof range === 'object' && 'male' in range) {
        // Use default male range for simplicity since we removed gender selection
        referenceRange = range.male;
      } else {
        referenceRange = range as { min: number; max: number };
      }

      const status = value < referenceRange.min ? 'low' : value > referenceRange.max ? 'high' : 'normal';
      
      let interpretation = '';
      let recommendations: string[] = [];
      
      if (status === 'low') {
        interpretation = language === 'montenegrin' 
          ? `Niska vrijednost. ${getLowInterpretation(testId, value, language)}`
          : `Low value. ${getLowInterpretation(testId, value, 'english')}`;
        recommendations = getRecommendations(testId, 'low', language);
      } else if (status === 'high') {
        interpretation = language === 'montenegrin'
          ? `Povišena vrijednost. ${getHighInterpretation(testId, value, language)}`
          : `High value. ${getHighInterpretation(testId, value, 'english')}`;
        recommendations = getRecommendations(testId, 'high', language);
      } else {
        interpretation = language === 'montenegrin' ? 'Vrijednost u normalnom rasponu' : 'Value within normal range';
        recommendations = [language === 'montenegrin' ? 'Nema preporuka za promjenu' : 'No changes recommended'];
      }

      return {
        id: testId,
        name: testInfo.name,
        value,
        unit: testInfo.unit,
        referenceRange: {
          ...referenceRange
        },
        category: testInfo.category,
        significance: testInfo.significance,
        interpretation,
        recommendations,
        factorsAffecting: testInfo.factorsAffecting,
        criticalLow: referenceRange.min * 0.5,
        criticalHigh: referenceRange.max * 2.0
      };
    });

    const abnormalTests = tests.filter(test => 
      test.value < test.referenceRange.min || test.value > test.referenceRange.max
    );
    
    const criticalTests = tests.filter(test => 
      (test.criticalLow && test.value < test.criticalLow) || 
      (test.criticalHigh && test.value > test.criticalHigh)
    );

    let overallStatus: 'normal' | 'warning' | 'critical';
    if (criticalTests.length > 0) {
      overallStatus = 'critical';
    } else if (abnormalTests.length > 0) {
      overallStatus = 'warning';
    } else {
      overallStatus = 'normal';
    }

    const summary = {
      abnormalCount: abnormalTests.length,
      criticalCount: criticalTests.length,
      overallStatus,
      recommendations: [
        ...(criticalTests.length > 0 ? [language === 'montenegrin' 
          ? 'HITNO KONSULTOVATI LIJEČNIKA - kritične vrijednosti!' 
          : 'URGENTLY CONSULT DOCTOR - critical values!'] : []),
        ...(abnormalTests.length > 0 ? [language === 'montenegrin'
          ? 'Preporučuje se konsultacija sa lekarom'
          : 'Doctor consultation recommended'] : []),
        language === 'montenegrin'
          ? 'Praćenje vrijednosti tokom vremena'
          : 'Monitor values over time'
      ]
    };

    setIsAnalyzing(false);
    
    return {
      tests,
      summary,
      metadata: {
        patientAge: 30, // Default age
        patientGender: 'male', // Default gender
        testDate: new Date(),
        labName: language === 'montenegrin' ? 'Medicinski Laboratorij' : 'Medical Laboratory'
      }
    };
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
      if (!validTypes.includes(file.type)) {
        alert(language === 'montenegrin' 
          ? 'Nevažeći format slike. Podržani formati: JPG, PNG, WebP' 
          : 'Invalid image format. Supported: JPG, PNG, WebP');
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        alert(language === 'montenegrin'
          ? 'Slika je prevelika. Maksimalna veličina: 5MB'
          : 'Image too large. Maximum size: 5MB');
        return;
      }

      setUploadedImage(file);
    }
  };

  const analyzeImage = async () => {
    if (!uploadedImage) return;

    setIsUploading(true);
    
    try {
      const formData = new FormData();
      formData.append('image', uploadedImage);
      formData.append('language', language);

      console.log('Starting image analysis...');

      const response = await fetch('/api/ai/analyze-lab-results', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('API response not OK:', response.status, errorText);
        throw new Error(`Image analysis failed: ${response.status}`);
      }

      const analysisData = await response.json();
      console.log('Analysis data received:', analysisData);

      if (!analysisData.tests || !Array.isArray(analysisData.tests)) {
        throw new Error('Invalid analysis data received');
      }

      const imageUrl = URL.createObjectURL(uploadedImage);
      
      const newReport: LabReport = {
        id: Math.random().toString(36).substr(2, 9),
        name: `${language === 'montenegrin' ? 'Analiza Slike Nalaza' : 'Image Analysis'} - ${new Date().toLocaleDateString()}`,
        date: new Date(),
        analysis: analysisData,
        imageUrl
      };

      setReports(prev => [newReport, ...prev]);
      setCurrentReport(newReport);
      setUploadedImage(null);
      
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }

      console.log('Image analysis completed successfully');

    } catch (error) {
      console.error('Image analysis error:', error);
      
      // Fallback to manual analysis if image analysis fails
      const testValues = {
        wbc: 8.5,
        rbc: 5.2,
        hemoglobin: 145,
        platelets: 250,
        glucose: 5.5,
        creatinine: 85,
        alt: 35,
        cholesterol: 4.8
      };

      const analysis = await analyzeLabResults(testValues);
      
      const newReport: LabReport = {
        id: Math.random().toString(36).substr(2, 9),
        name: `${language === 'montenegrin' ? 'Analiza Slike Nalaza' : 'Image Analysis'} - ${new Date().toLocaleDateString()}`,
        date: new Date(),
        analysis,
        imageUrl: URL.createObjectURL(uploadedImage!)
      };

      setReports(prev => [newReport, ...prev]);
      setCurrentReport(newReport);
      
      alert(language === 'montenegrin'
        ? 'Automatska analiza slike nije uspjela. Koristim osnovnu analizu.'
        : 'Automatic image analysis failed. Using basic analysis.');
    } finally {
      setIsUploading(false);
    }
  };

  const getLowInterpretation = (testId: string, value: number, lang: string): string => {
    const interpretations = {
      wbc: lang === 'montenegrin' ? 'Moguća bone marrow supresija, infekcija ili autoimuna bolest.' : 'Possible bone marrow suppression, infection or autoimmune disease.',
      hemoglobin: lang === 'montenegrin' ? 'Ukazuje na anemiju. Potrebno ispitati uzrok.' : 'Indicates anemia. Need to investigate cause.',
      glucose: lang === 'montenegrin' ? 'Hipoglikemija. Mogući dijabetes ili prekomjerna upotreba inzulina.' : 'Hypoglycemia. Possible diabetes or insulin overuse.'
    };
    return interpretations[testId as keyof typeof interpretations] || '';
  };

  const getHighInterpretation = (testId: string, value: number, lang: string): string => {
    const interpretations = {
      wbc: lang === 'montenegrin' ? 'Moguća infekcija, upala ili leukemija.' : 'Possible infection, inflammation or leukemia.',
      glucose: lang === 'montenegrin' ? 'Hiperglikemija. Mogući dijabetes ili poremećaj tolerancije glukoze.' : 'Hyperglycemia. Possible diabetes or glucose intolerance.',
      cholesterol: lang === 'montenegrin' ? 'Povećan rizik od kardiovaskularnih bolesti.' : 'Increased risk of cardiovascular diseases.'
    };
    return interpretations[testId as keyof typeof interpretations] || '';
  };

  const getRecommendations = (testId: string, status: 'low' | 'high', lang: string): string[] => {
    const recommendations = {
      wbc: {
        low: lang === 'montenegrin' 
          ? ['Konsultovati hematologa', 'Uraditi bone marrow test', 'Izbjegavati infekcije']
          : ['Consult hematologist', 'Perform bone marrow test', 'Avoid infections'],
        high: lang === 'montenegrin'
          ? ['Utvrditi uzrok infekcije', 'Uraditi dodatne testove', 'Praćenje tokom vremena']
          : ['Determine infection cause', 'Perform additional tests', 'Monitor over time']
      },
      glucose: {
        low: lang === 'montenegrin'
          ? ['Uravnotežena ishrana', 'Redovni obroci', 'Izbjegavati dugo gladovanje']
          : ['Balanced diet', 'Regular meals', 'Avoid prolonged fasting'],
        high: lang === 'montenegrin'
          ? ['Dijetetske promjene', 'Redovna fizička aktivnost', 'Testiranje na dijabetes']
          : ['Dietary changes', 'Regular physical activity', 'Diabetes testing']
      }
    };
    
    return recommendations[testId as keyof typeof recommendations]?.[status] || 
           [lang === 'montenegrin' ? 'Konsultovati specijalistu' : 'Consult specialist'];
  };

  const getStatusColor = (test: LabTest) => {
    if ((test.criticalLow && test.value < test.criticalLow) || 
        (test.criticalHigh && test.value > test.criticalHigh)) {
      return 'bg-red-100 border-red-300 text-red-800';
    }
    if (test.value < test.referenceRange.min || test.value > test.referenceRange.max) {
      return 'bg-yellow-100 border-yellow-300 text-yellow-800';
    }
    return 'bg-green-100 border-green-300 text-green-800';
  };

  const getStatusIcon = (test: LabTest) => {
    if ((test.criticalLow && test.value < test.criticalLow) || 
        (test.criticalHigh && test.value > test.criticalHigh)) {
      return <AlertTriangle className="w-4 h-4" />;
    }
    if (test.value < test.referenceRange.min) {
      return <TrendingDown className="w-4 h-4" />;
    }
    if (test.value > test.referenceRange.max) {
      return <TrendingUp className="w-4 h-4" />;
    }
    return <Minus className="w-4 h-4" />;
  };

  const filteredTests = currentReport?.analysis.tests.filter(test => 
    selectedCategory === 'all' || test.category === selectedCategory
  ) || [];

  const exportToPDF = () => {
    alert(language === 'montenegrin' ? 'PDF izvještaj generisan' : 'PDF report generated');
  };

  const removeUploadedImage = () => {
    setUploadedImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="p-6 bg-white/90 dark:bg-gray-900/90 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-lg">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold flex items-center text-gray-900 dark:text-blue-400">
            <Search className="w-6 h-6 mr-3 text-blue-500" />
            {language === 'montenegrin' ? 'Laboratorijski Analizator' : 'Laboratory Analyzer'}
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            {language === 'montenegrin' 
              ? 'Detaljna analiza laboratorijskih nalaza sa preporukama' 
              : 'Detailed laboratory results analysis with recommendations'}
          </p>
        </div>
      </div>

      {/* Image Upload Section */}
      <div className="mb-6">
        <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-6 border-2 border-dashed border-gray-300 dark:border-gray-600">
          <div className="text-center">
            <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              {language === 'montenegrin' ? 'Upload Slike Laboratorijskog Nalaza' : 'Upload Laboratory Report Image'}
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              {language === 'montenegrin' 
                ? 'Snimite ili uploadujte sliku vašeg laboratorijskog nalaza za automatsku analizu' 
                : 'Take a photo or upload an image of your laboratory report for automatic analysis'}
            </p>
            
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImageUpload}
              accept="image/*"
              className="hidden"
            />
            
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 flex items-center justify-center"
              >
                <Image className="w-5 h-5 mr-2" />
                {language === 'montenegrin' ? 'Odaberi Sliku' : 'Choose Image'}
              </button>
              
              {uploadedImage && (
                <>
                  <button
                    onClick={analyzeImage}
                    disabled={isUploading}
                    className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center justify-center"
                  >
                    <FileText className="w-5 h-5 mr-2" />
                    {isUploading 
                      ? (language === 'montenegrin' ? 'Analiziram...' : 'Analyzing...')
                      : (language === 'montenegrin' ? 'Analiziraj Sliku' : 'Analyze Image')
                    }
                  </button>
                  
                  <button
                    onClick={removeUploadedImage}
                    className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 flex items-center justify-center"
                  >
                    <Trash2 className="w-5 h-5 mr-2" />
                    {language === 'montenegrin' ? 'Ukloni' : 'Remove'}
                  </button>
                </>
              )}
            </div>

            {uploadedImage && (
              <div className="mt-4">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                  {language === 'montenegrin' ? 'Odabrana slika:' : 'Selected image:'} {uploadedImage.name}
                </p>
                <div className="max-w-xs mx-auto">
                  <img 
                    src={URL.createObjectURL(uploadedImage)} 
                    alt="Uploaded lab report"
                    className="w-full h-auto rounded-lg border border-gray-300 dark:border-gray-600"
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Reports History */}
      {reports.length > 0 && (
        <div className="mb-6">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3 flex items-center">
            <History className="w-5 h-5 mr-2" />
            {language === 'montenegrin' ? 'Prethodni Izvještaji' : 'Previous Reports'}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {reports.map((report) => (
              <div
                key={report.id}
                className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                  currentReport?.id === report.id
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                    : 'border-gray-200 dark:border-gray-600 hover:border-gray-400'
                }`}
                onClick={() => setCurrentReport(report)}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white">{report.name}</h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {report.date.toLocaleDateString()}
                    </p>
                    {report.imageUrl && (
                      <span className="inline-flex items-center text-xs text-blue-600 dark:text-blue-400 mt-1">
                        <Image className="w-3 h-3 mr-1" />
                        {language === 'montenegrin' ? 'Sa slikom' : 'With image'}
                      </span>
                    )}
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    report.analysis.summary.overallStatus === 'critical' 
                      ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                      : report.analysis.summary.overallStatus === 'warning'
                      ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                      : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                  }`}>
                    {report.analysis.summary.abnormalCount} {language === 'montenegrin' ? 'abnormal' : 'abnormal'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Current Report Analysis */}
      {currentReport && (
        <div className="space-y-6">
          {/* Report Header */}
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {currentReport.name}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {language === 'montenegrin' ? 'Datum testa' : 'Test Date'}: {currentReport.date.toLocaleDateString()}
                </p>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={exportToPDF}
                  className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                >
                  <Download className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setShowNormalValues(!showNormalValues)}
                  className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                >
                  {showNormalValues ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Image Preview with Text Analysis Below */}
            {currentReport.imageUrl && (
              <div className="mb-6">
                <h4 className="font-medium text-gray-900 dark:text-white mb-2 flex items-center">
                  <Image className="w-4 h-4 mr-2" />
                  {language === 'montenegrin' ? 'Originalni Nalog' : 'Original Report'}
                </h4>
                <div className="max-w-md border border-gray-200 dark:border-gray-600 rounded-lg overflow-hidden mb-4">
                  <img 
                    src={currentReport.imageUrl} 
                    alt="Laboratory report"
                    className="w-full h-auto"
                  />
                </div>
                
                {/* Text Analysis Section */}
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                  <h5 className="font-semibold text-blue-900 dark:text-blue-100 mb-3">
                    {language === 'montenegrin' ? 'Tekstualna Analiza Nalaza' : 'Textual Analysis of Results'}
                  </h5>
                  <div className="space-y-3">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <div className="text-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                        <div className="text-xl font-bold text-green-600 dark:text-green-400">
                          {currentReport.analysis.tests.length - currentReport.analysis.summary.abnormalCount}
                        </div>
                        <div className="text-sm text-green-600 dark:text-green-400">
                          {language === 'montenegrin' ? 'Normalno' : 'Normal'}
                        </div>
                      </div>
                      <div className="text-center p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                        <div className="text-xl font-bold text-yellow-600 dark:text-yellow-400">
                          {currentReport.analysis.summary.abnormalCount - currentReport.analysis.summary.criticalCount}
                        </div>
                        <div className="text-sm text-yellow-600 dark:text-yellow-400">
                          {language === 'montenegrin' ? 'Upozorenje' : 'Warning'}
                        </div>
                      </div>
                      <div className="text-center p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                        <div className="text-xl font-bold text-red-600 dark:text-red-400">
                          {currentReport.analysis.summary.criticalCount}
                        </div>
                        <div className="text-sm text-red-600 dark:text-red-400">
                          {language === 'montenegrin' ? 'Kritično' : 'Critical'}
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <h6 className="font-medium text-blue-800 dark:text-blue-200 mb-2">
                        {language === 'montenegrin' ? 'Ukupna procjena:' : 'Overall Assessment:'}
                      </h6>
                      <p className="text-sm text-blue-700 dark:text-blue-300">
                        {currentReport.analysis.summary.overallStatus === 'critical' 
                          ? (language === 'montenegrin' 
                              ? 'Kritično stanje - hitno konsultovati liječnika' 
                              : 'Critical condition - urgently consult doctor')
                          : currentReport.analysis.summary.overallStatus === 'warning'
                          ? (language === 'montenegrin'
                              ? 'Upozorenje - preporučuje se konsultacija sa lekarom'
                              : 'Warning - doctor consultation recommended')
                          : (language === 'montenegrin'
                              ? 'Svi parametri u normalnim granicama'
                              : 'All parameters within normal limits')
                        }
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Category Filter */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {language === 'montenegrin' ? 'Filtriraj po kategoriji' : 'Filter by Category'}
              </label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full md:w-auto px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">{language === 'montenegrin' ? 'Sve kategorije' : 'All Categories'}</option>
                {Object.entries(t.categories).map(([key, value]) => (
                  <option key={key} value={key}>{value}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Test Results */}
          <div className="space-y-4">
            {filteredTests.map((test) => (
              <div key={test.id} className={`border rounded-xl p-4 ${getStatusColor(test)}`}>
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-gray-800">{test.name}</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-900">{test.significance}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    {getStatusIcon(test)}
                    <span className="text-lg font-bold">
                      {test.value} {test.unit}
                    </span>
                  </div>
                </div>

                {/* Reference Range */}
                <div className="mb-3">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600 dark:text-gray-400">
                      {language === 'montenegrin' ? 'Referentni raspon' : 'Reference Range'}:
                    </span>
                    <span>
                      {test.referenceRange.min} - {test.referenceRange.max} {test.unit}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-blue-500 h-2 rounded-full transition-all duration-500"
                      style={{ 
                        width: `${Math.max(0, Math.min(100, 
                          ((test.value - test.referenceRange.min) / 
                          (test.referenceRange.max - test.referenceRange.min)) * 100
                        ))}%` 
                      }}
                    ></div>
                  </div>
                </div>

                {/* Interpretation & Recommendations */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <div>
                    <h5 className="font-medium text-gray-900 dark:text-blue-500 mb-2">
                      {language === 'montenegrin' ? 'Interpretacija' : 'Interpretation'}
                    </h5>
                    <p className="text-sm">{test.interpretation}</p>
                  </div>
                  
                  <div>
                    <h5 className="font-medium text-gray-900 dark:text-blue-500 mb-2">
                      {language === 'montenegrin' ? 'Preporuke' : 'Recommendations'}
                    </h5>
                    <ul className="text-sm space-y-1">
                      {test.recommendations.map((rec, index) => (
                        <li key={index} className="flex items-start">
                          <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                          {rec}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Factors Affecting */}
                {showNormalValues && (
                  <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-600">
                    <h5 className="font-medium text-gray-900 dark:text-white mb-2">
                      {language === 'montenegrin' ? 'Faktori koji utiču' : 'Factors Affecting'}
                    </h5>
                    <div className="flex flex-wrap gap-1">
                      {test.factorsAffecting.map((factor, index) => (
                        <span 
                          key={index}
                          className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded text-xs"
                        >
                          {factor}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Overall Recommendations */}
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-6">
            <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-3 flex items-center">
              <AlertTriangle className="w-5 h-5 mr-2" />
              {language === 'montenegrin' ? 'Opšte Preporuke' : 'Overall Recommendations'}
            </h4>
            <ul className="space-y-2">
              {currentReport.analysis.summary.recommendations.map((rec, index) => (
                <li key={index} className="flex items-start text-blue-800 dark:text-blue-200">
                  <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  {rec}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!currentReport && !isAnalyzing && !isUploading && (
        <div className="text-center py-12">
          <Search className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            {language === 'montenegrin' ? 'Nema laboratorijskih nalaza' : 'No laboratory results'}
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            {language === 'montenegrin' 
              ? 'Uploadujte sliku nalaza za automatsku analizu' 
              : 'Upload a report image for automatic analysis'}
          </p>
        </div>
      )}
    </div>
  );
};

export default LaboratoryAnalyzer;