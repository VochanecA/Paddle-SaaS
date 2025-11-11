import { NextRequest, NextResponse } from 'next/server';

// Types - ostaju isti
interface LabTest {
  id: string;
  name: string;
  value: number;
  unit: string;
  referenceRange: {
    min: number;
    max: number;
    gender?: 'male' | 'female';
  };
  category: string;
  significance: string;
  interpretation: string;
  recommendations: string[];
  factorsAffecting: string[];
  criticalLow?: number;
  criticalHigh?: number;
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
    testDate: string;
    labName: string;
  };
}

interface OpenRouterResponse {
  choices?: Array<{
    message?: {
      content?: string;
    };
  }>;
  error?: {
    message: string;
  };
}

// Type guards - ostaju isti
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
    test.recommendations.every((item: unknown) => typeof item === 'string') &&
    Array.isArray(test.factorsAffecting) &&
    test.factorsAffecting.every((item: unknown) => typeof item === 'string')
  );
}

function isValidLabAnalysis(obj: unknown): obj is LabAnalysis {
  if (!obj || typeof obj !== 'object') return false;
  
  const analysis = obj as Partial<LabAnalysis>;
  return (
    Array.isArray(analysis.tests) &&
    analysis.tests.every(isValidLabTest) &&
    typeof analysis.summary === 'object' &&
    typeof analysis.summary?.abnormalCount === 'number' &&
    typeof analysis.summary?.criticalCount === 'number' &&
    typeof analysis.summary?.overallStatus === 'string' &&
    Array.isArray(analysis.summary?.recommendations) &&
    analysis.summary.recommendations.every((item: unknown) => typeof item === 'string') &&
    typeof analysis.metadata === 'object' &&
    typeof analysis.metadata?.patientAge === 'number' &&
    typeof analysis.metadata?.patientGender === 'string' &&
    typeof analysis.metadata?.testDate === 'string' &&
    typeof analysis.metadata?.labName === 'string'
  );
}

function isValidLanguage(lang: string): lang is 'montenegrin' | 'english' {
  return lang === 'montenegrin' || lang === 'english';
}

// Mock data for fallback
const MOCK_LAB_ANALYSIS: LabAnalysis = {
  tests: [
    {
      id: "wbc",
      name: "White Blood Cells (WBC)",
      value: 7.2,
      unit: "×10⁹/L",
      referenceRange: { min: 4.0, max: 11.0, gender: "male" },
      category: "hematology",
      significance: "Number of white blood cells. Elevated values indicate infection, inflammation or leukemia.",
      interpretation: "Value within normal range",
      recommendations: ["No changes recommended"],
      factorsAffecting: ["Infections", "Inflammatory processes", "Stress", "Medications"],
      criticalLow: 2.0,
      criticalHigh: 22.0
    },
    {
      id: "hemoglobin",
      name: "Hemoglobin",
      value: 148,
      unit: "g/L",
      referenceRange: { min: 135, max: 175, gender: "male" },
      category: "hematology",
      significance: "Protein in red blood cells that carries oxygen.",
      interpretation: "Value within normal range",
      recommendations: ["No changes recommended"],
      factorsAffecting: ["Anemia", "Hydration", "Altitude"],
      criticalLow: 67.5,
      criticalHigh: 350
    }
  ],
  summary: {
    abnormalCount: 0,
    criticalCount: 0,
    overallStatus: "normal",
    recommendations: [
      "All values within normal range",
      "Continue regular health monitoring"
    ]
  },
  metadata: {
    patientAge: 30,
    patientGender: "male",
    testDate: new Date().toISOString(),
    labName: "Medical Laboratory"
  }
};

// Helper function to validate and clean analysis data
function validateAndCleanAnalysis(analysis: unknown, language: string): LabAnalysis {
  if (isValidLabAnalysis(analysis)) {
    return analysis;
  }

  // If analysis is invalid, return cleaned version or fallback
  const partialAnalysis = analysis as Partial<LabAnalysis>;
  const safeLanguage = isValidLanguage(language) ? language : 'english';

  return {
    tests: Array.isArray(partialAnalysis.tests) 
      ? partialAnalysis.tests.filter(isValidLabTest)
      : MOCK_LAB_ANALYSIS.tests,
    summary: {
      abnormalCount: typeof partialAnalysis.summary?.abnormalCount === 'number' 
        ? partialAnalysis.summary.abnormalCount 
        : 0,
      criticalCount: typeof partialAnalysis.summary?.criticalCount === 'number' 
        ? partialAnalysis.summary.criticalCount 
        : 0,
      overallStatus: partialAnalysis.summary?.overallStatus === 'warning' || 
                    partialAnalysis.summary?.overallStatus === 'critical' 
        ? partialAnalysis.summary.overallStatus 
        : 'normal',
      recommendations: Array.isArray(partialAnalysis.summary?.recommendations)
        ? partialAnalysis.summary.recommendations.filter((item: unknown): item is string => typeof item === 'string')
        : [safeLanguage === 'montenegrin' ? 'Analiza završena' : 'Analysis completed']
    },
    metadata: {
      patientAge: typeof partialAnalysis.metadata?.patientAge === 'number' 
        ? partialAnalysis.metadata.patientAge 
        : 30,
      patientGender: partialAnalysis.metadata?.patientGender === 'female' 
        ? 'female' 
        : 'male',
      testDate: typeof partialAnalysis.metadata?.testDate === 'string' 
        ? partialAnalysis.metadata.testDate 
        : new Date().toISOString(),
      labName: typeof partialAnalysis.metadata?.labName === 'string' 
        ? partialAnalysis.metadata.labName 
        : safeLanguage === 'montenegrin' ? 'Medicinski Laboratorij' : 'Medical Laboratory'
    }
  };
}

// List of vision models to try (ordered by reliability)
const VISION_MODELS = [
  'nvidia/nemotron-nano-12b-v2-vl:free', // Best for vision
  'anthropic/claude-3-haiku', // Good vision capabilities
  'openai/gpt-4o-mini', // Good for vision
  'meta-llama/llama-3.2-11b-vision-instruct:free', // Free vision model
  'qwen/qwen2-vl-72b-instruct:free', // Free alternative
];

export async function POST(request: NextRequest): Promise<NextResponse<LabAnalysis | { error: string }>> {
  try {
    const formData = await request.formData();
    const image = formData.get('image') as File | null;
    const language = formData.get('language') as string;

    if (!image) {
      return NextResponse.json(
        { error: 'No image provided' },
        { status: 400 }
      );
    }

    // Validate API key
    if (!process.env.OPENROUTER_API_KEY) {
      console.log('❌ OpenRouter API key not configured, using mock data');
      return NextResponse.json(MOCK_LAB_ANALYSIS);
    }

    console.log('✅ API key configured, starting image analysis...');
    console.log('📸 Image details:', {
      name: image.name,
      type: image.type,
      size: image.size
    });

    // Convert image to base64
    const arrayBuffer = await image.arrayBuffer();
    const base64 = Buffer.from(arrayBuffer).toString('base64');
    const mimeType = image.type;

    const safeLanguage = isValidLanguage(language) ? language : 'english';

    const systemPrompt = safeLanguage === 'montenegrin' 
      ? `Ti si specijalista za laboratorijsku medicinu. Analiziraj sliku laboratorijskog nalaza i ekstrahuj sve vrijednosti. 

VAŽNO: Morate analizirati sliku i ekstrahovati stvarne vrijednosti iz laboratorijskog izvještaja.

Vrati JSON u ovom formatu:
{
  "tests": [
    {
      "id": "test_id",
      "name": "Ime testa",
      "value": 7.2,
      "unit": "jedinica",
      "referenceRange": {"min": 4.0, "max": 11.0},
      "category": "kategorija",
      "significance": "Značaj testa...",
      "interpretation": "Interpretacija vrijednosti...",
      "recommendations": ["preporuka1"],
      "factorsAffecting": ["faktor1"]
    }
  ],
  "summary": {
    "abnormalCount": 0,
    "criticalCount": 0,
    "overallStatus": "normal",
    "recommendations": ["opšta preporuka"]
  }
}

Budí pažljiv sa vrijednostima i jedinicama. Ako ne možeš pročitati sliku, prijavi grešku.`
      : `You are a laboratory medicine specialist. Analyze the laboratory report image and extract all values.

IMPORTANT: You must analyze the image and extract actual values from the laboratory report.

Return JSON in this format:
{
  "tests": [
    {
      "id": "test_id",
      "name": "Test name",
      "value": 7.2,
      "unit": "unit",
      "referenceRange": {"min": 4.0, "max": 11.0},
      "category": "category",
      "significance": "Test significance...",
      "interpretation": "Value interpretation...",
      "recommendations": ["recommendation1"],
      "factorsAffecting": ["factor1"]
    }
  ],
  "summary": {
    "abnormalCount": 0,
    "criticalCount": 0,
    "overallStatus": "normal",
    "recommendations": ["general recommendation"]
  }
}

Be careful with values and units. If you cannot read the image, report an error.`;

    const userPrompt = safeLanguage === 'montenegrin' 
      ? 'Analiziraj ovu sliku laboratorijskog nalaza i ekstrahuj sve vrijednosti testova:'
      : 'Analyze this laboratory report image and extract all test values:';

    let lastError = '';

    // Try multiple vision models
    for (const model of VISION_MODELS) {
      try {
        console.log(`🔄 Trying model: ${model}`);
        
        const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
            'Content-Type': 'application/json',
            'HTTP-Referer': process.env.NEXTAUTH_URL || 'http://localhost:3000',
            'X-Title': 'Medical Laboratory Image Analyzer'
          },
          body: JSON.stringify({
            model,
            messages: [
              {
                role: 'system',
                content: systemPrompt
              },
              {
                role: 'user',
                content: [
                  {
                    type: 'text',
                    text: userPrompt
                  },
                  {
                    type: 'image_url',
                    image_url: {
                      url: `data:${mimeType};base64,${base64}`
                    }
                  }
                ]
              }
            ],
            max_tokens: 4000,
            temperature: 0.1,
            response_format: { type: 'json_object' }
          })
        });

        if (!response.ok) {
          const errorText = await response.text();
          lastError = `Model ${model} failed: ${response.status} - ${errorText.substring(0, 200)}`;
          console.error(`❌ ${lastError}`);
          continue; // Try next model
        }

        const data: OpenRouterResponse = await response.json();
        
        if (data.error) {
          lastError = `Model ${model} error: ${data.error.message}`;
          console.error(`❌ ${lastError}`);
          continue;
        }

        const content = data.choices?.[0]?.message?.content;

        if (!content) {
          lastError = `Model ${model} returned empty content`;
          console.error(`❌ ${lastError}`);
          continue;
        }

        console.log(`✅ Model ${model} responded successfully`);
        console.log('📄 AI Response preview:', content.substring(0, 300) + '...');

        let analysis: unknown;
        try {
          analysis = JSON.parse(content);
          console.log('✅ JSON parsed successfully');
        } catch (parseError) {
          console.error('❌ JSON parse error:', parseError);
          // Try to extract JSON from text if parsing fails
          const jsonMatch = content.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            try {
              analysis = JSON.parse(jsonMatch[0]);
              console.log('✅ JSON extracted from text successfully');
            } catch {
              lastError = 'Invalid JSON format in AI response';
              continue;
            }
          } else {
            lastError = 'No JSON found in AI response';
            continue;
          }
        }

        // Validate and clean the analysis data
        const validatedAnalysis = validateAndCleanAnalysis(analysis, safeLanguage);
        
        // Check if we got real data (not just mock structure)
        if (validatedAnalysis.tests.length > 0 && 
            validatedAnalysis.tests.some(test => 
              test.value !== 7.2 && // Not the mock value
              test.name.toLowerCase() !== 'white blood cells' && // Not mock name
              test.interpretation.includes('normal') // Has real interpretation
            )) {
          console.log('✅ Real analysis data received from AI');
          return NextResponse.json(validatedAnalysis);
        } else {
          console.log('⚠️ AI returned mock-like data, trying next model...');
          lastError = 'AI returned mock data instead of real analysis';
          continue;
        }

      } catch (modelError) {
        lastError = `Model ${model} error: ${modelError}`;
        console.error(`❌ ${lastError}`);
        continue;
      }
    }

    // If all models failed
    console.error('❌ All vision models failed:', lastError);
    throw new Error(`AI analysis failed: ${lastError}`);

  } catch (error) {
    console.error('💥 Final image analysis error:', error);
    
    // Return mock data as fallback with a note about the failure
    const fallbackAnalysis = {
      ...MOCK_LAB_ANALYSIS,
      summary: {
        ...MOCK_LAB_ANALYSIS.summary,
        recommendations: [
          ...MOCK_LAB_ANALYSIS.summary.recommendations,
          'Note: AI analysis unavailable. Showing demo data.'
        ]
      }
    };
    
    return NextResponse.json(fallbackAnalysis);
  }
}