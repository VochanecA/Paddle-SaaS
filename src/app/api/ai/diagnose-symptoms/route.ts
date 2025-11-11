// src/app/api/ai/diagnose-symptoms/route.ts
import { NextRequest, NextResponse } from 'next/server';

interface DiagnosisRequest {
  symptoms: string;
  language: 'montenegrin' | 'english';
}

const SYSTEM_PROMPTS = {
  montenegrin: `Ti si medicinski AI asistent za opštu dijagnozu. Analiziraj simptome i vrati SAMO JSON odgovor sa ovom strukturom:
{
  "condition": "naziv stanja",
  "description": "detaljan opis stanja",
  "confidence": 0.85,
  "medications": [
    {
      "name": "naziv lijeka",
      "dosage": "preporučena doza",
      "frequency": "učestalost uzimanja",
      "duration": "trajanje liječenja", 
      "purpose": "svrha lijeka",
      "euApproved": true
    }
  ],
  "recommendations": ["preporuka1", "preporuka2"],
  "recoveryTime": {
    "estimatedDays": 7,
    "description": "opis oporavka",
    "phases": ["faza1", "faza2"]
  },
  "severity": "low|moderate|high",
  "urgentRecommendations": ["hitna preporuka"] // samo ako je potrebno
}

PRAVILA:
1. Koristi samo lijekove koji su odobreni u EU
2. Budi precizan sa dozama i trajanjem
3. Procijeni realno vrijeme oporavka
4. Označava ozbiljnost stanja
5. Ako stanje zahtjeva hitnu medicinsku pomoć, dodaj urgentRecommendations
6. Budi koncizan ali detaljan`,

  english: `You are a medical AI assistant for general diagnosis. Analyze symptoms and return ONLY JSON response with this structure:
{
  "condition": "condition name",
  "description": "detailed condition description", 
  "confidence": 0.85,
  "medications": [
    {
      "name": "medication name",
      "dosage": "recommended dosage",
      "frequency": "administration frequency",
      "duration": "treatment duration",
      "purpose": "medication purpose",
      "euApproved": true
    }
  ],
  "recommendations": ["recommendation1", "recommendation2"],
  "recoveryTime": {
    "estimatedDays": 7,
    "description": "recovery description",
    "phases": ["phase1", "phase2"]
  },
  "severity": "low|moderate|high",
  "urgentRecommendations": ["urgent recommendation"] // only if needed
}

RULES:
1. Use only EU-approved medications
2. Be precise with dosages and duration
3. Estimate realistic recovery time
4. Assess condition severity
5. If condition requires emergency care, add urgentRecommendations
6. Be concise but detailed`
};

export async function POST(request: NextRequest) {
  try {
    const { symptoms, language }: DiagnosisRequest = await request.json();

    if (!symptoms) {
      return NextResponse.json(
        { error: 'Symptoms are required' },
        { status: 400 }
      );
    }

    // Use the same vision models but for text analysis
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': process.env.NEXTAUTH_URL || 'http://localhost:3000',
        'X-Title': 'Medical Diagnosis Assistant'
      },
      body: JSON.stringify({
        model: 'nvidia/nemotron-nano-12b-v2-vl:free', // Good for medical text
        messages: [
          {
            role: 'system',
            content: SYSTEM_PROMPTS[language]
          },
          {
            role: 'user',
            content: `Simptomi: ${symptoms}`
          }
        ],
        max_tokens: 2000,
        temperature: 0.1,
        response_format: { type: 'json_object' }
      })
    });

    if (!response.ok) {
      throw new Error('AI service unavailable');
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error('No response from AI');
    }

    const diagnosis = JSON.parse(content);
    return NextResponse.json(diagnosis);

  } catch (error) {
    console.error('Diagnosis error:', error);
    return NextResponse.json(
      { error: 'Diagnosis failed' },
      { status: 500 }
    );
  }
}