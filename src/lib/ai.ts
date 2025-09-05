// src/lib/ai.ts
import { getEnvVariable } from './env';

export type AIModelProvider = 'openrouter' | 'anthropic' | 'openai' | 'gemini' | 'deepseek';

export interface AIMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface AIRequest {
  messages: AIMessage[];
  maxTokens?: number;
  temperature?: number;
  provider?: AIModelProvider;
  model?: string;
  stream?: boolean;
}

export interface AIResponse {
  role: 'assistant';
  content: string;
}

// Centralized provider configs
const PROVIDER_CONFIG: Record<
  AIModelProvider,
  { baseUrl: string; apiKey?: string }
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
  openrouter: {
    baseUrl: 'https://openrouter.ai/api/v1',
    apiKey: getEnvVariable('OPENROUTER_API_KEY'),
  },
  deepseek: {
    baseUrl: 'https://api.deepseek.com/v1',
    apiKey: getEnvVariable('DEEPSEEK_API_KEY'),
  },
};

// Provider-specific model defaults
const DEFAULT_MODELS: Record<AIModelProvider, string> = {
  openai: 'gpt-4o-mini',
  anthropic: 'claude-3-5-sonnet-20240620',
  gemini: 'gemini-1.5-pro',
  openrouter: 'openai/gpt-4o-mini',
  deepseek: 'deepseek-chat',
};

export async function callAI(req: AIRequest): Promise<AIResponse> {
  const provider: AIModelProvider = req.provider ?? 'deepseek';
  const { baseUrl, apiKey } = PROVIDER_CONFIG[provider];

  if (!apiKey) {
    throw new Error(`Missing API key for provider: ${provider}`);
  }

  const model = req.model ?? DEFAULT_MODELS[provider];

  const body =
    provider === 'anthropic'
      ? {
          model,
          max_tokens: req.maxTokens ?? 800,
          temperature: req.temperature ?? 0.7,
          messages: req.messages.map((m) => ({
            role: m.role,
            content: m.content,
          })),
        }
      : {
          model,
          max_tokens: req.maxTokens ?? 800,
          temperature: req.temperature ?? 0.7,
          messages: req.messages,
          stream: req.stream ?? false,
        };

  const response = await fetch(
    provider === 'gemini'
      ? `${baseUrl}/models/${model}:generateContent?key=${apiKey}`
      : `${baseUrl}/chat/completions`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization:
          provider === 'gemini' ? undefined : `Bearer ${apiKey}`,
        'HTTP-Referer': provider === 'openrouter' ? 'https://your-app.com' : undefined,
        'X-Title': provider === 'openrouter' ? 'Your App Name' : undefined,
      },
      body: JSON.stringify(body),
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `AI API error (${provider}, ${response.status}): ${errorText}`
    );
  }

  const data = await response.json();

  // Handle provider-specific response formats
  let content: string | undefined;

  if (provider === 'anthropic') {
    content = data.content?.[0]?.text;
  } else if (provider === 'gemini') {
    content = data.candidates?.[0]?.content?.parts?.[0]?.text;
  } else {
    content = data.choices?.[0]?.message?.content;
  }

  if (!content) {
    throw new Error(`Empty response from ${provider}`);
  }

  return { role: 'assistant', content };
}