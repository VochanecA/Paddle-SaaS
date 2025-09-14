// src/app/api/ai/chat/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { AIMessage } from '@/lib/ai';

interface ChatRequest {
  messages: AIMessage[];
  model?: string;
  maxTokens?: number;
  temperature?: number;
}

export async function POST(req: NextRequest) {
  try {
    const { messages, model, maxTokens, temperature }: ChatRequest = await req.json();

    if (!process.env.OPENROUTER_API_KEY) {
      return NextResponse.json(
        { error: 'Server is not configured with an OpenRouter API key.' },
        { status: 500 }
      );
    }

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': process.env.NEXT_PUBLIC_APP_URL ?? 'https://yourapp.vercel.app',
        'X-Title': 'AI Service',
      },
      body: JSON.stringify({
        model: model ?? 'deepseek/deepseek-chat-v3.1:free',
        messages,
        max_tokens: maxTokens ?? 1000,
        temperature: temperature ?? 0.7,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json(
        { error: `OpenRouter API error: ${response.status} - ${errorText}` },
        { status: response.status }
      );
    }

    const data = await response.json();

    return NextResponse.json({
      content: data.choices[0]?.message?.content ?? 'No response generated',
      usage: data.usage ?? null,
    });
  } catch (error) {
    console.error('API /api/ai/chat error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}