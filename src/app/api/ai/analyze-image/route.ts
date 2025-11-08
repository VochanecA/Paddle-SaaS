import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const image = formData.get('image') as File;
    const imageType = formData.get('imageType') as string;
    const language = formData.get('language') as string;

    if (!image) {
      return NextResponse.json({ error: 'No image provided' }, { status: 400 });
    }

    // Convert image to base64 for the AI model
    const arrayBuffer = await image.arrayBuffer();
    const base64Image = Buffer.from(arrayBuffer).toString('base64');

    const systemPrompt = language === 'montenegrin' 
      ? `Ti si specijalista za medicinsku silkovnu dijagnostiku. Analiziraj datu medicinsku snimku i vrati strukturirani JSON odgovor sa:
         - findings: niz ključnih nalaza na snimci (na crnogorskom jeziku)
         - impression: ukupna klinička impresija (na crnogorskom jeziku) 
         - recommendations: niz preporuka za dalje korake (na crnogorskom jeziku)
         - confidence: nivo pouzdanosti između 0 i 1
         - abnormalities: niz otkrivenih abnormalnosti (na crnogorskom jeziku)
         
         Budi precizan, koncizan i koristi medicinski tačne termine.`
      : `You are a medical imaging specialist AI. Analyze the provided medical image and return a structured JSON response with:
         - findings: array of key findings in the image
         - impression: overall clinical impression  
         - recommendations: array of next steps or recommendations
         - confidence: confidence score between 0 and 1
         - abnormalities: array of detected abnormalities
         
         Be precise, concise and use medically accurate terminology.`;

    const messages = [
      {
        role: "system",
        content: systemPrompt
      },
      {
        role: "user",
        content: [
          {
            type: "text",
            text: `Please analyze this ${imageType} medical image and provide a comprehensive assessment.`
          },
          {
            type: "image_url",
            image_url: {
              url: `data:${image.type};base64,${base64Image}`
            }
          }
        ]
      }
    ];

    // Use OpenRouter's vision-capable models
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': process.env.NEXTAUTH_URL || 'http://localhost:3000',
        'X-Title': 'Medical AI Assistant'
      },
      body: JSON.stringify({
        model: 'google/gemini-flash-1.5-8b', // Vision capable model
        messages,
        max_tokens: 2000
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenRouter error:', errorText);
      throw new Error('AI analysis failed');
    }

    const data = await response.json();
    const analysis = JSON.parse(data.choices[0].message.content);

    return NextResponse.json(analysis);
  } catch (error) {
    console.error('Image analysis error:', error);
    return NextResponse.json(
      { error: 'Analysis failed' }, 
      { status: 500 }
    );
  }
}