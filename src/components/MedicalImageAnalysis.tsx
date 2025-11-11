'use client';

import { useState, useRef } from 'react';
import { ImageIcon, Trash2, Loader2, ScanSearch, X, FileText, AlertCircle, AlertTriangle, TrendingUp, Search } from 'lucide-react';

// Types
interface MedicalImage {
  id: string;
  file: File;
  previewUrl: string;
  type: 'xray' | 'ct' | 'mri' | 'ultrasound' | 'other';
  analysis?: ImageAnalysisResult;
}

interface ImageAnalysisResult {
  findings: string[];
  impression: string;
  recommendations: string[];
  confidence: number;
  abnormalities: string[];
}

// Type guard functions
function isValidAnalysisResult(obj: unknown): obj is ImageAnalysisResult {
  if (!obj || typeof obj !== 'object') return false;
  
  const analysis = obj as Partial<ImageAnalysisResult>;
  return (
    Array.isArray(analysis.findings) &&
    analysis.findings.every((item: unknown) => typeof item === 'string') &&
    typeof analysis.impression === 'string' &&
    Array.isArray(analysis.recommendations) &&
    analysis.recommendations.every((item: unknown) => typeof item === 'string') &&
    typeof analysis.confidence === 'number' &&
    Array.isArray(analysis.abnormalities) &&
    analysis.abnormalities.every((item: unknown) => typeof item === 'string')
  );
}

function isPartialAnalysis(obj: unknown): obj is Partial<ImageAnalysisResult> {
  if (!obj || typeof obj !== 'object') return false;
  return true;
}

interface MedicalImageAnalysisProps {
  language: 'montenegrin' | 'english';
}

type TranslationKeys = {
  title: string;
  uploadTitle: string;
  uploadSubtitle: string;
  uploadedImages: string;
  analyze: string;
  analyzing: string;
  clearAll: string;
  results: string;
  findings: string;
  impression: string;
  recommendations: string;
  confidence: string;
  noAbnormalities: string;
  abnormalities: string;
  noFindings: string;
  noRecommendations: string;
  typeLabels: {
    xray: string;
    ct: string;
    mri: string;
    ultrasound: string;
    other: string;
  };
};

const imageAnalysisTranslations: Record<'montenegrin' | 'english', TranslationKeys> = {
  montenegrin: {
    title: 'Analiza Medicinskih Snimaka',
    uploadTitle: 'Kliknite ili prevucite RTG, CT, MR snimke',
    uploadSubtitle: 'Podržani formati: JPG, PNG, DICOM',
    uploadedImages: 'Učitane slike',
    analyze: 'Analiziraj snimke',
    analyzing: 'Analiziram...',
    clearAll: 'Obriši sve',
    results: 'Rezultati analize',
    findings: 'Nalazi',
    impression: 'Impresija',
    recommendations: 'Preporuke',
    confidence: 'Pouzdanost analize',
    noAbnormalities: 'Nema uočenih abnormalnosti',
    abnormalities: 'Abnormalnosti',
    noFindings: 'Nema dostupnih nalaza',
    noRecommendations: 'Nema dostupnih preporuka',
    typeLabels: {
      xray: 'RTG',
      ct: 'CT',
      mri: 'MR',
      ultrasound: 'Ultrazvuk',
      other: 'Ostalo'
    }
  },
  english: {
    title: 'Medical Image Analysis',
    uploadTitle: 'Click or drag X-Ray, CT, MRI images',
    uploadSubtitle: 'Supported formats: JPG, PNG, DICOM',
    uploadedImages: 'Uploaded Images',
    analyze: 'Analyze Images',
    analyzing: 'Analyzing...',
    clearAll: 'Clear All',
    results: 'Analysis Results',
    findings: 'Findings',
    impression: 'Impression',
    recommendations: 'Recommendations',
    confidence: 'Analysis confidence',
    noAbnormalities: 'No abnormalities detected',
    abnormalities: 'Abnormalities',
    noFindings: 'No findings available',
    noRecommendations: 'No recommendations available',
    typeLabels: {
      xray: 'X-Ray',
      ct: 'CT',
      mri: 'MRI',
      ultrasound: 'Ultrasound',
      other: 'Other'
    }
  }
};

export default function MedicalImageAnalysis({ language }: MedicalImageAnalysisProps) {
  const [images, setImages] = useState<MedicalImage[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const t = imageAnalysisTranslations[language];

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    const newImages: MedicalImage[] = [];
    
    Array.from(files).forEach(file => {
      const fileType = file.type;
      let imageType: MedicalImage['type'] = 'other';
      
      if (fileType.includes('dicom') || file.name.toLowerCase().includes('dicom')) {
        imageType = 'xray';
      } else if (file.name.toLowerCase().includes('ct')) {
        imageType = 'ct';
      } else if (file.name.toLowerCase().includes('mri')) {
        imageType = 'mri';
      } else if (file.name.toLowerCase().includes('ultrasound')) {
        imageType = 'ultrasound';
      }

      const previewUrl = URL.createObjectURL(file);
      newImages.push({
        id: Math.random().toString(36).substr(2, 9),
        file,
        previewUrl,
        type: imageType
      });
    });

    setImages(prev => [...prev, ...newImages]);
  };

  const removeImage = (id: string) => {
    setImages(prev => {
      const image = prev.find(img => img.id === id);
      if (image) {
        URL.revokeObjectURL(image.previewUrl);
      }
      return prev.filter(img => img.id !== id);
    });
  };

  const analyzeImages = async () => {
    if (images.length === 0) return;
    
    setIsAnalyzing(true);
    setAnalysisProgress(0);

    try {
      for (let i = 0; i < images.length; i++) {
        const image = images[i];
        
        // Simulate progress
        setAnalysisProgress(((i + 1) / images.length) * 100);
        
        // Prepare the image for analysis
        const formData = new FormData();
        formData.append('image', image.file);
        formData.append('imageType', image.type);
        formData.append('language', language);

        const response = await fetch('/api/ai/analyze-image', {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) throw new Error('Analysis failed');

        const analysisData: unknown = await response.json();
        
        // Validate the analysis data
        if (isValidAnalysisResult(analysisData)) {
          setImages(prev => prev.map(img => 
            img.id === image.id ? { ...img, analysis: analysisData } : img
          ));
        } else {
          console.warn('Invalid analysis data received:', analysisData);
          // Create a fallback analysis result
          const fallbackAnalysis: ImageAnalysisResult = {
            findings: [language === 'montenegrin' ? 'Analiza nije uspjela' : 'Analysis failed'],
            impression: language === 'montenegrin' ? 'Greška u analizi' : 'Analysis error',
            recommendations: [language === 'montenegrin' ? 'Pokušajte ponovo' : 'Please try again'],
            confidence: 0,
            abnormalities: []
          };
          setImages(prev => prev.map(img => 
            img.id === image.id ? { ...img, analysis: fallbackAnalysis } : img
          ));
        }

        // Small delay between analyses
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    } catch (error) {
      console.error('Image analysis error:', error);
      alert(language === 'montenegrin' 
        ? 'Greška pri analizi slika. Pokušajte ponovno.' 
        : 'Error analyzing images. Please try again.'
      );
    } finally {
      setIsAnalyzing(false);
      setAnalysisProgress(0);
    }
  };

  const clearAllImages = () => {
    images.forEach(image => {
      URL.revokeObjectURL(image.previewUrl);
    });
    setImages([]);
  };

  // Helper function to safely get analysis arrays
  const getSafeAnalysisArray = (
    analysis: ImageAnalysisResult | undefined, 
    key: keyof Pick<ImageAnalysisResult, 'findings' | 'recommendations' | 'abnormalities'>
  ): string[] => {
    if (!analysis || !analysis[key] || !Array.isArray(analysis[key])) {
      return [];
    }
    return analysis[key].filter((item: unknown): item is string => typeof item === 'string');
  };

  // Helper function to get safe confidence value
  const getSafeConfidence = (analysis: ImageAnalysisResult | undefined): number => {
    if (!analysis || typeof analysis.confidence !== 'number') {
      return 0;
    }
    return Math.max(0, Math.min(1, analysis.confidence));
  };

  // Helper function to get safe impression
  const getSafeImpression = (analysis: ImageAnalysisResult | undefined): string => {
    if (!analysis || typeof analysis.impression !== 'string') {
      return language === 'montenegrin' ? 'Nema dostupne impresije' : 'No impression available';
    }
    return analysis.impression;
  };

  return (
    <div className="p-6 bg-white/90 dark:bg-gray-900/90 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-lg transition-colors duration-300">
      <h2 className="text-xl font-semibold mb-4 flex items-center">
        <ImageIcon className="w-6 h-6 mr-3 text-blue-500" />
        <span className="text-gray-900 dark:text-white">
          {t.title}
        </span>
      </h2>

      {/* Upload Area */}
      <div className="mb-6">
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleImageUpload}
          multiple
          accept="image/*,.dcm,.dicom"
          className="hidden"
        />
        <div 
          className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-2xl p-8 text-center cursor-pointer hover:border-blue-400 transition-colors"
          onClick={() => fileInputRef.current?.click()}
        >
          <ImageIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-lg text-gray-600 dark:text-gray-400 mb-2">
            {t.uploadTitle}
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-500">
            {t.uploadSubtitle}
          </p>
        </div>
      </div>

      {/* Uploaded Images */}
      {images.length > 0 && (
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              {t.uploadedImages} ({images.length})
            </h3>
            <button
              onClick={clearAllImages}
              disabled={isAnalyzing}
              className="text-sm text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 disabled:opacity-50 transition-colors"
            >
              {t.clearAll}
            </button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {images.map((image) => (
              <div key={image.id} className="relative group bg-gray-50 dark:bg-gray-800 rounded-xl p-2">
                <div className="aspect-square rounded-lg overflow-hidden border-2 border-gray-200 dark:border-gray-700">
                  <img 
                    src={image.previewUrl} 
                    alt={image.file.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <button
                  onClick={() => removeImage(image.id)}
                  className="absolute -top-2 -right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600 transition-colors opacity-0 group-hover:opacity-100"
                >
                  <X className="w-3 h-3" />
                </button>
                <div className="mt-2">
                  <span className="bg-blue-600 text-white text-xs px-2 py-1 rounded-full">
                    {t.typeLabels[image.type]}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Analysis Controls */}
      {images.length > 0 && (
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <button
            onClick={analyzeImages}
            disabled={isAnalyzing}
            className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-xl font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
          >
            {isAnalyzing ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                {t.analyzing} ({Math.round(analysisProgress)}%)
              </>
            ) : (
              <>
                <ScanSearch className="w-5 h-5 mr-2" />
                {t.analyze}
              </>
            )}
          </button>
        </div>
      )}

      {/* Analysis Results */}
      {images.some(img => img.analysis) && (
        <div className="space-y-6">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
            {t.results}
          </h3>
          
          {images.map((image) => {
            if (!image.analysis) return null;

            const safeFindings = getSafeAnalysisArray(image.analysis, 'findings');
            const safeRecommendations = getSafeAnalysisArray(image.analysis, 'recommendations');
            const safeAbnormalities = getSafeAnalysisArray(image.analysis, 'abnormalities');
            const safeConfidence = getSafeConfidence(image.analysis);
            const safeImpression = getSafeImpression(image.analysis);

            return (
              <div key={image.id} className="border border-gray-200 dark:border-gray-700 rounded-2xl p-6 bg-white/50 dark:bg-gray-800/50">
                <div className="flex flex-col lg:flex-row gap-6">
                  {/* Image Preview */}
                  <div className="flex-shrink-0">
                    <div className="w-48 h-48 rounded-xl overflow-hidden border-2 border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-900">
                      <img 
                        src={image.previewUrl} 
                        alt={image.file.name}
                        className="w-full h-full object-contain"
                      />
                    </div>
                    <div className="mt-3 text-center">
                      <span className="bg-blue-600 text-white text-sm px-3 py-1 rounded-full">
                        {t.typeLabels[image.type]}
                      </span>
                    </div>
                  </div>
                  
                  {/* Analysis Results */}
                  <div className="flex-1 space-y-6">
                    {/* Findings */}
                    <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                      <h4 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center">
                        <Search className="w-4 h-4 mr-2 text-blue-500" />
                        {t.findings}
                      </h4>
                      <ul className="space-y-2">
                        {safeFindings.length > 0 ? (
                          safeFindings.map((finding, index) => (
                            <li key={index} className="flex items-start">
                              <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                              <span className="text-gray-700 dark:text-gray-300 text-sm">{finding}</span>
                            </li>
                          ))
                        ) : (
                          <li className="text-gray-500 dark:text-gray-400 text-sm">
                            {t.noFindings}
                          </li>
                        )}
                      </ul>
                    </div>

                    {/* Impression */}
                    <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                      <h4 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center">
                        <FileText className="w-4 h-4 mr-2 text-green-500" />
                        {t.impression}
                      </h4>
                      <p className="text-gray-700 dark:text-gray-300 text-sm bg-green-50 dark:bg-green-900/20 p-3 rounded-lg border border-green-200 dark:border-green-800">
                        {safeImpression}
                      </p>
                    </div>

                    {/* Abnormalities */}
                    <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                      <h4 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center">
                        <AlertTriangle className="w-4 h-4 mr-2 text-red-500" />
                        {t.abnormalities}
                      </h4>
                      <ul className="space-y-2">
                        {safeAbnormalities.length > 0 ? (
                          safeAbnormalities.map((abnormality, index) => (
                            <li key={index} className="flex items-start">
                              <span className="w-2 h-2 bg-red-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                              <span className="text-red-700 dark:text-red-300 text-sm">{abnormality}</span>
                            </li>
                          ))
                        ) : (
                          <li className="text-gray-500 dark:text-gray-400 text-sm">
                            {t.noAbnormalities}
                          </li>
                        )}
                      </ul>
                    </div>

                    {/* Recommendations */}
                    <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                      <h4 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center">
                        <AlertCircle className="w-4 h-4 mr-2 text-orange-500" />
                        {t.recommendations}
                      </h4>
                      <ul className="space-y-2">
                        {safeRecommendations.length > 0 ? (
                          safeRecommendations.map((recommendation, index) => (
                            <li key={index} className="flex items-start">
                              <span className="w-2 h-2 bg-orange-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                              <span className="text-gray-700 dark:text-gray-300 text-sm">{recommendation}</span>
                            </li>
                          ))
                        ) : (
                          <li className="text-gray-500 dark:text-gray-400 text-sm">
                            {t.noRecommendations}
                          </li>
                        )}
                      </ul>
                    </div>

                    {/* Confidence Score */}
                    <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                      <h4 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center">
                        <TrendingUp className="w-4 h-4 mr-2 text-purple-500" />
                        {t.confidence}
                      </h4>
                      <div className="flex items-center space-x-3">
                        <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                          <div 
                            className="bg-purple-500 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${safeConfidence * 100}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          {(safeConfidence * 100).toFixed(1)}%
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}