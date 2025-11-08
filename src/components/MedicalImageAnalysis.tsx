'use client';

import { useState, useRef } from 'react';
import { ImageIcon, Trash2, Loader2, ScanSearch, X } from 'lucide-react';

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

interface MedicalImageAnalysisProps {
  language: 'montenegrin' | 'english';
}

const imageAnalysisTranslations = {
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
    confidence: 'Pouzdanost analize:',
    noAbnormalities: 'Nema uočenih abnormalnosti',
    abnormalities: 'Abnormalnosti',
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
    confidence: 'Analysis confidence:',
    noAbnormalities: 'No abnormalities detected',
    abnormalities: 'Abnormalities',
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

        const analysis: ImageAnalysisResult = await response.json();
        
        // Update image with analysis
        setImages(prev => prev.map(img => 
          img.id === image.id ? { ...img, analysis } : img
        ));

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
          
          {images.map((image) => image.analysis && (
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
                <div className="flex-1 space-y-4">
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-2 flex items-center">
                      <ScanSearch className="w-4 h-4 mr-2" />
                      {t.findings}
                    </h4>
                    <ul className="space-y-2">
                      {image.analysis.findings.map((finding, index) => (
                        <li key={index} className="flex items-start">
                          <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                          <span className="text-gray-700 dark:text-gray-300 text-sm">{finding}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                      {t.impression}
                    </h4>
                    <p className="text-gray-700 dark:text-gray-300 text-sm bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg border border-blue-200 dark:border-blue-800">
                      {image.analysis.impression}
                    </p>
                  </div>
                  
                  {image.analysis.abnormalities && image.analysis.abnormalities.length > 0 && (
                    <div>
                      <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                        {t.abnormalities}
                      </h4>
                      <ul className="space-y-1">
                        {image.analysis.abnormalities.map((abnormality, index) => (
                          <li key={index} className="flex items-start">
                            <span className="w-2 h-2 bg-red-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                            <span className="text-red-700 dark:text-red-300 text-sm">{abnormality}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                      {t.recommendations}
                    </h4>
                    <ul className="space-y-2">
                      {image.analysis.recommendations.map((rec, index) => (
                        <li key={index} className="flex items-start">
                          <span className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                          <span className="text-gray-700 dark:text-gray-300 text-sm">{rec}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      {t.confidence}
                    </span>
                    <div className="flex items-center">
                      <div className="w-24 bg-gray-200 dark:bg-gray-700 rounded-full h-2 mr-3">
                        <div 
                          className="bg-green-500 h-2 rounded-full transition-all duration-500"
                          style={{ width: `${image.analysis.confidence * 100}%` }}
                        ></div>
                      </div>
                      <span className="font-semibold text-green-600 text-sm">
                        {Math.round(image.analysis.confidence * 100)}%
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}