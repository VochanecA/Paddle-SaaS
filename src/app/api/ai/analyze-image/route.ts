import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const image = formData.get('image') as File;
    const imageType = formData.get('imageType') as string;
    const language = formData.get('language') as string;

    console.log('Received image analysis request:', {
      imageName: image?.name,
      imageType,
      imageSize: image?.size,
      language
    });

    if (!image) {
      return NextResponse.json({ error: 'No image provided' }, { status: 400 });
    }

    // Check if image is too large (limit to 5MB)
    if (image.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: 'Image too large. Maximum size is 5MB.' }, { status: 400 });
    }

    // Convert image to base64
    const arrayBuffer = await image.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const base64Image = buffer.toString('base64');
    const mimeType = image.type || 'image/jpeg';

    console.log('Image converted to base64, length:', base64Image.length);

    const systemPrompt = language === 'montenegrin' 
      ? `Ti si specijalista za medicinsku silkovnu dijagnostiku. Analiziraj datu medicinsku snimku i vrati strukturirani JSON odgovor sa:
         - findings: niz ključnih nalaza na snimci (na crnogorskom jeziku)
         - impression: ukupna klinička impresija (na crnogorskom jeziku) 
         - recommendations: niz preporuka za dalje korake (na crnogorskom jeziku)
         - confidence: nivo pouzdanosti između 0 i 1
         - abnormalities: niz otkrivenih abnormalnosti (na crnogorskom jeziku)
         
         Budi precizan, koncizan i koristi medicinski tačne termine. Ako nema jasnih abnormalnosti, to i navedi.`
      : `You are a medical imaging specialist AI. Analyze the provided medical image and return a structured JSON response with:
         - findings: array of key findings in the image
         - impression: overall clinical impression  
         - recommendations: array of next steps or recommendations
         - confidence: confidence score between 0 and 1
         - abnormalities: array of detected abnormalities
         
         Be precise, concise and use medically accurate terminology. If no clear abnormalities are present, state that.`;

    const userPrompt = language === 'montenegrin'
      ? `Analiziraj ovu ${imageType} medicinsku snimku. Opiši šta vidiš i navedi sve relevantne medicinske informacije.`
      : `Please analyze this ${imageType} medical image and provide a comprehensive assessment.`;

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
            text: userPrompt
          },
          {
            type: "image_url",
            image_url: {
              url: `data:${mimeType};base64,${base64Image}`
            }
          }
        ]
      }
    ];

    console.log('Sending request to OpenRouter...');

    // Try multiple vision models
    const models = [
      'google/gemini-flash-1.5-8b',
      'google/gemma-3-27b-it:free',
      'moonshotai/kimi-vl-a3b-thinking:free',
      'anthropic/claude-3-haiku',
      'meta-llama/llama-3.2-11b-vision-instruct',
      'qwen/qwen2.5-vl-72b-instruct:free'
    ];

//     google/gemma-3–4b-it:free
// google/gemma-3–12b-it:free
// google/gemma-3–27b-it:free
// meta-llama/llama-3.2–11b-vision-instruct:free
// mistralai/mistral-small-3.1–24b-instruct:free
// moonshotai/kimi-vl-a3b-thinking:free
// qwen/qwen2.5-vl-32b-instruct:free
// qwen/qwen2.5-vl-72b-instruct:free

    let lastError = null;

    for (const model of models) {
      try {
        console.log(`Trying model: ${model}`);
        
        const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
            'Content-Type': 'application/json',
            'HTTP-Referer': process.env.NEXTAUTH_URL || 'http://localhost:3000',
            'X-Title': 'Medical AI Assistant'
          },
          body: JSON.stringify({
            model: model,
            messages: messages,
            max_tokens: 2000,
            temperature: 0.1
          })
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error(`Model ${model} failed:`, errorText);
          lastError = new Error(`Model ${model} returned ${response.status}`);
          continue; // Try next model
        }

        const data = await response.json();
        console.log('OpenRouter response received:', data.choices[0].message.content.substring(0, 200) + '...');

        // Try to parse JSON response
        try {
          const content = data.choices[0].message.content;
          const jsonMatch = content.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            const analysis = JSON.parse(jsonMatch[0]);
            console.log('Analysis parsed successfully');
            return NextResponse.json(analysis);
          } else {
            // If no JSON found, create a structured response from text
            const analysis: unknown = {
              findings: [content.substring(0, 200) + '...'],
              impression: 'AI analysis completed successfully',
              recommendations: ['Consult with a medical specialist for detailed interpretation'],
              confidence: 0.8,
              abnormalities: ['Analysis completed - review findings above']
            };
            return NextResponse.json(analysis);
          }
        } catch (parseError) {
          console.error('JSON parse error:', parseError);
          // Fallback response
          const fallbackAnalysis = {
            findings: ['Image analysis completed. Unable to parse detailed structure.'],
            impression: 'AI analysis completed - manual review recommended',
            recommendations: ['Consult with a qualified radiologist for detailed interpretation'],
            confidence: 0.7,
            abnormalities: ['Automatic analysis completed - specialist review needed']
          };
          return NextResponse.json(fallbackAnalysis);
        }

      } catch (modelError) {
        console.error(`Model ${model} error:`, modelError);
        lastError = modelError;
        continue;
      }
    }

    // If all models failed
    throw lastError || new Error('All vision models failed');

  } catch (error) {
    console.error('Image analysis error:', error);
    
    // Return a fallback response instead of error
    const fallbackResponse = {
      findings: ['Trenutno nije moguće analizirati sliku. Pokušajte ponovo kasnije.', 'Currently unable to analyze image. Please try again later.'],
      impression: 'Greška u analizi / Analysis error',
      recommendations: ['Pokušajte ponovo sa drugom slikom', 'Try again with a different image'],
      confidence: 0.1,
      abnormalities: ['Sistem privremeno nedostupan / System temporarily unavailable']
    };
    
    return NextResponse.json(fallbackResponse);
  }
}