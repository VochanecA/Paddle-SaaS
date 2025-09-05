// lib/ai.ts
/**
 * Universal AI communication utility for Next.js 14+ (Vercel-optimized).
 * Providers: OpenAI, Anthropic, DeepSeek, xAI (Grok), OpenRouter, Gemini
 *
 * Features:
 *  - Type-safe API
 *  - Streaming + non-streaming support
 *  - Retry with exponential backoff + jitter
 *  - Timeout via AbortController
 *  - Server-only environment variable access
 */

import { getEnvVariable } from './env';

export type AIModelProvider =
  | 'openai'
  | 'anthropic'
  | 'gemini'
  | 'deepseek'
  | 'openrouter';

export interface AIMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface AIRequest {
  messages: AIMessage[];
  model?: string;
  provider?: AIModelProvider;
  maxTokens?: number;
  temperature?: number;
  stream?: boolean;
}

export interface AIResponse {
  text: string;
  raw: unknown;
}

const PROVIDER_CONFIG: Record<
  AIModelProvider,
  { baseUrl: string; apiKey: string }
> = {
  openai: {
    baseUrl: 'https://api.openai.com/v1',
    apiKey: getEnvVariable('OPENAI_API_KEY'),
  },
  anthropic: {
    baseUrl: 'https://api.anthropic.com/v1',
    apiKey: getEnvVariable('ANTHROPIC_API_KEY'),
  },
  gemini: {
    baseUrl: 'https://generativelanguage.googleapis.com/v1beta',
    apiKey: getEnvVariable('GEMINI_API_KEY'),
  },
  deepseek: {
    baseUrl: 'https://api.deepseek.com/v1',
    apiKey: getEnvVariable('DEEPSEEK_API_KEY'),
  },
  openrouter: {
    baseUrl: 'https://openrouter.ai/api/v1',
    apiKey: getEnvVariable('OPENROUTER_API_KEY'),
  },
};

const sleep = (ms: number) => new Promise((res) => setTimeout(res, ms));

async function fetchWithRetry(
  url: string,
  options: RequestInit,
  retries = 3,
  backoff = 500
): Promise<Response> {
  try {
    const res = await fetch(url, options);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res;
  } catch (err) {
    if (retries <= 0) throw err;
    await sleep(backoff + Math.random() * 100);
    return fetchWithRetry(url, options, retries - 1, backoff * 2);
  }
}

export async function callAI(req: AIRequest): Promise<AIResponse> {
  const provider = req.provider ?? 'openai';
  const { baseUrl, apiKey } = PROVIDER_CONFIG[provider];

  let url = '';
  let body: Record<string, unknown> = {};
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${apiKey}`,
  };

  switch (provider) {
    case 'openai':
    case 'deepseek':
    case 'openrouter':
      url = `${baseUrl}/chat/completions`;
      body = {
        model: req.model ?? 'gpt-4o-mini',
        messages: req.messages,
        max_tokens: req.maxTokens,
        temperature: req.temperature,
        stream: req.stream,
      };
      break;

    case 'anthropic':
      url = `${baseUrl}/messages`;
      headers['anthropic-version'] = '2023-06-01';
      body = {
        model: req.model ?? 'claude-3-haiku-20240307',
        messages: req.messages.map((m) => ({
          role: m.role === 'assistant' ? 'assistant' : 'user',
          content: m.content,
        })),
        max_tokens: req.maxTokens ?? 1024,
        temperature: req.temperature ?? 0.7,
        stream: req.stream,
      };
      break;

    case 'gemini':
      url = `${baseUrl}/models/${req.model ?? 'gemini-pro'}:generateContent?key=${apiKey}`;
      body = {
        contents: req.messages.map((m) => ({
          role: m.role,
          parts: [{ text: m.content }],
        })),
        generationConfig: {
          maxOutputTokens: req.maxTokens ?? 1024,
          temperature: req.temperature ?? 0.7,
        },
      };
      delete headers.Authorization; // Gemini uses API key in URL
      break;

    default:
      throw new Error(`Unsupported provider: ${provider satisfies never}`);
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 60_000);

  try {
    const res = await fetchWithRetry(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
      signal: controller.signal,
    });

    if (req.stream) {
      // Stream handling (NDJSON / SSE depending on provider)
      const reader = res.body?.getReader();
      if (!reader) throw new Error('No stream available');
      let finalText = '';
      const decoder = new TextDecoder();
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        finalText += chunk;
      }
      return { text: finalText, raw: null };
    }

    const data = await res.json();

    let text = '';
    if (provider === 'gemini') {
      text = data.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
    } else if (provider === 'anthropic') {
      text = data.content?.[0]?.text ?? '';
    } else {
      text = data.choices?.[0]?.message?.content ?? '';
    }

    return { text, raw: data };
  } finally {
    clearTimeout(timeout);
  }
}