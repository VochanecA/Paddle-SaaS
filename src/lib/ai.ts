import { getEnvVariable } from './env';

export type AIModelProvider = 'openrouter' | 'anthropic' | 'openai' | 'gemini';

export interface AIMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface AIRequest {
  messages: AIMessage[];
  maxTokens?: number;
  temperature?: number;
  model?: string;
}

export interface AIResponse {
  content: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

export interface AIProviderConfig {
  apiKey: string;
  baseURL?: string;
  defaultModel?: string;
  defaultMaxTokens?: number;
  defaultTemperature?: number;
}

export class AIService {
  private provider: AIModelProvider;
  private config: AIProviderConfig;

  constructor(provider: AIModelProvider, config: AIProviderConfig) {
    this.provider = provider;
    this.config = config;
  }

  async chatCompletion(request: AIRequest): Promise<AIResponse> {
    switch (this.provider) {
      case 'openrouter':
        return this.openRouterRequest(request);
      default:
        throw new Error(`Unsupported AI provider: ${this.provider}`);
    }
  }

  private async openRouterRequest(request: AIRequest): Promise<AIResponse> {
    const {
      apiKey,
      defaultModel = 'deepseek/deepseek-chat-v3.1:free',
      defaultMaxTokens = 1000,
      defaultTemperature = 0.7,
    } = this.config;

    const referer = typeof window !== 'undefined' ? window.location.origin : '';

    try {
      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': referer,
          'X-Title': 'AI Service',
        },
        body: JSON.stringify({
          model: request.model || defaultModel,
          messages: request.messages,
          max_tokens: request.maxTokens || defaultMaxTokens,
          temperature: request.temperature || defaultTemperature,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`OpenRouter API error: ${response.status} - ${errorText}`);
      }

      const data = await response.json();

      return {
        content: data.choices[0]?.message?.content || 'No response generated',
        usage: data.usage
          ? {
              promptTokens: data.usage.prompt_tokens,
              completionTokens: data.usage.completion_tokens,
              totalTokens: data.usage.total_tokens,
            }
          : undefined,
      };
    } catch (error) {
      console.error('OpenRouter API error:', error);
      throw new Error(`Failed to get response from OpenRouter: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}

// Helper function to create AI service instance
export function createAIService(provider: AIModelProvider): AIService | null {
  // Don't run this on server side
  if (typeof window === 'undefined') {
    return null;
  }

  const envVars: Record<AIModelProvider, string> = {
    openrouter: 'NEXT_PUBLIC_OPENROUTER_API_KEY',
    anthropic: 'NEXT_PUBLIC_ANTHROPIC_API_KEY',
    openai: 'NEXT_PUBLIC_OPENAI_API_KEY',
    gemini: 'NEXT_PUBLIC_GEMINI_API_KEY',
  };

  const envVarName = envVars[provider];
  const apiKey = getEnvVariable(envVarName);

  if (!apiKey) {
    console.warn(`${provider} API key not configured.`);
    return null;
  }

  return new AIService(provider, { apiKey });
}

// Simple function to test if API key is available
export function isAIServiceAvailable(provider: AIModelProvider = 'openrouter'): boolean {
  const envVars: Record<AIModelProvider, string> = {
    openrouter: 'NEXT_PUBLIC_OPENROUTER_API_KEY',
    anthropic: 'NEXT_PUBLIC_ANTHROPIC_API_KEY',
    openai: 'NEXT_PUBLIC_OPENAI_API_KEY',
    gemini: 'NEXT_PUBLIC_GEMINI_API_KEY',
  };

  const envVarName = envVars[provider];
  return !!getEnvVariable(envVarName);
}

// General chat function for any type of question
export async function chatWithAI(
  message: string,
  provider: AIModelProvider = 'openrouter',
  systemPrompt = 'You are a helpful and knowledgeable AI assistant. Provide clear, concise, and helpful responses.',
  context = '',
  previousMessages: AIMessage[] = []
): Promise<string> {
  const aiService = createAIService(provider);

  if (!aiService) {
    return 'AI service is not configured. Please check your API keys.';
  }

  const messages: AIMessage[] = [
    {
      role: 'system',
      content: systemPrompt,
    },
    ...previousMessages,
    {
      role: 'user',
      content: context ? `${context}\n\n${message}` : message,
    },
  ];

  try {
    const response = await aiService.chatCompletion({
      messages,
      maxTokens: 1000,
      temperature: 0.7,
    });

    return response.content;
  } catch (error) {
    console.error('AI chat error:', error);
    return 'AI service is temporarily unavailable. Please try again later.';
  }
}

// Function for multi-turn conversations
export async function continueConversation(
  messages: AIMessage[],
  provider: AIModelProvider = 'openrouter'
): Promise<{ response: string; updatedMessages: AIMessage[] }> {
  const aiService = createAIService(provider);

  if (!aiService) {
    return {
      response: 'AI service is not configured. Please check your API keys.',
      updatedMessages: messages,
    };
  }

  try {
    const response = await aiService.chatCompletion({
      messages,
      maxTokens: 1000,
      temperature: 0.7,
    });

    const updatedMessages: AIMessage[] = [
      ...messages,
      {
        role: 'assistant',
        content: response.content,
      },
    ];

    return {
      response: response.content,
      updatedMessages,
    };
  } catch (error) {
    console.error('AI conversation error:', error);
    return {
      response: 'AI service is temporarily unavailable. Please try again later.',
      updatedMessages: messages,
    };
  }
}