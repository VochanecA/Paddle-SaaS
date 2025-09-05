'use client';
import Image from 'next/image';
import {
  useState,
  useEffect,
  forwardRef,
  useImperativeHandle,
  useRef,
} from 'react';
import type { AIMessage } from '@/lib/ai';

interface AIChatProps {
  className?: string;
  initialPrompt?: string;
  title?: string;
  description?: string;
  userId: string;
}

interface AIChatRef {
  openChat: () => void;
  clearConversation: () => void;
  focusInput: () => void;
}

const AIChat = forwardRef<AIChatRef, AIChatProps>(
  (
    {
      className = '',
      initialPrompt = `You are an experienced AI, DeepSeek, a helpful and knowledgeable AI assistant. Follow these rules carefully:
1. Think step-by-step to ensure accuracy and logical reasoning.
2. Give clear, concise answers in short sentences.
3. Support all claims with valid, verifiable references when possible.
4. Avoid hype, clichés, and marketing language.
5. Cut adverbs and filler words.
6. Provide concrete examples and actionable steps.
7. Be direct and avoid unnecessary details.
8. Use a natural, conversational tone to keep responses engaging and easy to read.
9. When analyzing images, describe what you see and provide insights based on visual content.
10. Always reason thoroughly before responding to ensure high-quality answers.
11. Ensure all suggestions are feasible and have been tested or implemented within the European Union, or are supported by EU-related experience.
12. Tailor advice to comply with EU regulations, standards, and local conditions to guarantee practical and relevant responses.`,
      title = 'Your AI Assistant',
      description = 'Ask me anything! I can analyze text and images 😊',
      userId,
    },
    ref
  ) => {
    const [message, setMessage] = useState('');
    const [conversation, setConversation] = useState<AIMessage[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [aiAvailable] = useState(true);
    const [isMinimized, setIsMinimized] = useState(false);
    const [uploadingImage, setUploadingImage] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Scroll to bottom when conversation updates
    useEffect(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [conversation, isLoading]);

    // Expose ref methods
    useImperativeHandle(ref, () => ({
      openChat: () => {
        setIsMinimized(false);
        setTimeout(() => inputRef.current?.focus(), 100);
      },
      clearConversation: () => {
        setConversation([]);
        setTimeout(() => inputRef.current?.focus(), 100);
      },
      focusInput: () => inputRef.current?.focus(),
    }));

    const handleSendMessage = async (imageData?: string): Promise<void> => {
      const messageToSend = imageData ? "[Image attached] " + message : message;
      if ((!messageToSend.trim() && !imageData) || isLoading || !aiAvailable) return;

      setIsLoading(true);
      setMessage('');

      const updatedConversation: AIMessage[] = [
        ...conversation,
        { role: 'user', content: messageToSend, ...(imageData && { image: imageData }) },
      ];
      setConversation(updatedConversation);

      try {
        const response = await fetch('/api/ai/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            messages:
              conversation.length === 0
                ? [
                    { role: 'system', content: initialPrompt },
                    { role: 'user', content: messageToSend, ...(imageData && { image: imageData }) },
                  ]
                : updatedConversation,
            userId,
          }),
        });

        if (!response.ok) {
          throw new Error(`API returned ${response.status}`);
        }

        const data: { content: string } = await response.json();

        setConversation([
          ...updatedConversation,
          { role: 'assistant', content: data.content },
        ]);
      } catch (error) {
        console.error('Error sending message:', error);
        setConversation([
          ...updatedConversation,
          {
            role: 'assistant',
            content:
              'Sorry, I encountered an error processing your request. Please try again later.',
          },
        ]);
      } finally {
        setIsLoading(false);
        setUploadingImage(false);
      }
    };

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      // Check if file is an image
      if (!file.type.startsWith('image/')) {
        alert('Please upload an image file');
        return;
      }

      // Check file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('Please upload an image smaller than 5MB');
        return;
      }

      setUploadingImage(true);
      
      const reader = new FileReader();
      reader.onload = (event) => {
        const imageData = event.target?.result as string;
        handleSendMessage(imageData);
      };
      reader.readAsDataURL(file);
    };

    // const suggestedQuestions = [
    //   'How can I get started?',
    //   'What can you help me with?',
    //   'Tell me about yourself',
    //   'Explain like I’m a beginner',
    // ];

    // const handleSuggestionClick = (question: string): void => {
    //   setMessage(question);
    //   setTimeout(() => inputRef.current?.focus(), 100);
    // };

    // Minimized view
    if (isMinimized) {
      return (
        <div
          className={`fixed bottom-4 right-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white p-3 sm:p-4 rounded-full shadow-2xl cursor-pointer transition-all hover:scale-105 ${className}`}
          onClick={() => setIsMinimized(false)}
        >
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                />
              </svg>
            </div>
            <span className="text-sm font-semibold">AI Assistant</span>
            {conversation.length > 0 && (
              <span className="bg-white/30 text-xs px-2 py-1 rounded-full">
                {conversation.length}
              </span>
            )}
          </div>
        </div>
      );
    }

    return (
      <div
        className={`w-full sm:max-w-5xl mx-auto bg-white/70 dark:bg-gray-900/70 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 dark:border-gray-700/20 flex flex-col max-h-[80vh] ${className}`}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-indigo-500/10 p-4 sm:p-6 rounded-t-3xl border-b border-gray-200/50 dark:border-gray-700/50 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
              <svg
                className="w-6 h-6 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {title} 🤖
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {description}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setConversation([])}
              className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors p-2"
              title="Clear conversation"
              disabled={conversation.length === 0}
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                />
              </svg>
            </button>
            <button
              onClick={() => setIsMinimized(true)}
              className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors p-2"
              title="Minimize chat"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
              </svg>
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 p-4 sm:p-6 space-y-4 overflow-y-auto">
          {conversation.length === 0 ? (
            <div className="text-center text-gray-600 dark:text-gray-300 py-6">
<div className="w-16 h-16 bg-gradient-to-r from-blue-400/20 to-purple-400/20 rounded-full flex items-center justify-center mx-auto mb-4">
  <Image 
    src="/smiley2.png" 
    alt="Smiley face" 
    width={64} 
    height={64} 
    priority
    style={{ borderRadius: '9999px' }} // to keep the rounded-full style
  />
</div>
              <p className="text-lg font-medium mb-2">
                Hello! I&apos;m your AI assistant 😊
              </p>
              <p className="text-sm mb-6">
                I can help answer questions, analyze images, and provide insights.
                How can I assist you today? 
              </p>
              {/* <div className="space-y-2">
                {suggestedQuestions.map((question) => (
                  <button
                    key={question}
                    onClick={() => handleSuggestionClick(question)}
                    className="block w-full text-left p-3 text-sm bg-gray-100/50 dark:bg-gray-800/50 hover:bg-gray-200/50 dark:hover:bg-gray-700/50 rounded-lg transition-colors border border-gray-200 dark:border-gray-700"
                  >
                    {question}
                  </button>
                ))}
              </div> */}
            </div>
          ) : (
            conversation.map((msg, index) => (
              <div
                key={index}
                className={`flex ${
                  msg.role === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                <div
                  className={`max-w-[90%] sm:max-w-[80%] p-4 rounded-2xl shadow-md ${
                    msg.role === 'user'
                      ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-br-none'
                      : 'bg-gray-100/70 dark:bg-gray-800/70 text-gray-900 dark:text-white rounded-bl-none'
                  }`}
                >
                  {/* {msg.image && (
                    <div className="mb-3">
                      <img 
                        src={msg.image} 
                        alt="Uploaded" 
                        className="max-w-full h-auto rounded-lg max-h-40 object-contain"
                      />
                    </div>
                  )} */}
                  <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                  <div
                    className={`text-xs mt-2 opacity-70 ${
                      msg.role === 'user'
                        ? 'text-white/70'
                        : 'text-gray-600 dark:text-gray-400'
                    }`}
                  >
                    {msg.role === 'user' ? 'You' : 'AI'} •{' '}
                    {new Date().toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </div>
                </div>
              </div>
            ))
          )}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-gray-100/70 dark:bg-gray-800/70 text-gray-900 dark:text-white p-4 rounded-2xl rounded-bl-none max-w-[90%] sm:max-w-[80%] shadow-md">
                <div className="flex space-x-1 items-center">
                  <div className="w-2 h-2 bg-blue-500/70 rounded-full animate-bounce"></div>
                  <div
                    className="w-2 h-2 bg-blue-500/70 rounded-full animate-bounce"
                    style={{ animationDelay: '0.1s' }}
                  ></div>
                  <div
                    className="w-2 h-2 bg-blue-500/70 rounded-full animate-bounce"
                    style={{ animationDelay: '0.2s' }}
                  ></div>
                  <span className="text-xs ml-2 font-medium">
                    {uploadingImage ? 'Analyzing image...' : 'Thinking...'}
                  </span>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="p-4 sm:p-6 border-t border-gray-200/50 dark:border-gray-700/50">
          <div className="flex space-x-3">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImageUpload}
              accept="image/*"
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={isLoading || !aiAvailable}
              className="px-4 py-3 bg-gray-200/70 dark:bg-gray-700/70 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300/70 dark:hover:bg-gray-600/70 disabled:bg-gray-400/50 disabled:cursor-not-allowed transition-all shadow-md flex items-center justify-center"
              title="Upload image"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            </button>
            <input
              ref={inputRef}
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder="Ask your AI assistant..."
              className="flex-1 px-4 py-3 bg-gray-100/70 dark:bg-gray-800/70 text-gray-900 dark:text-white border border-gray-300/50 dark:border-gray-600/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
              disabled={isLoading || !aiAvailable}
            />
            <button
              onClick={() => handleSendMessage()}
              disabled={isLoading || (!message.trim() && !uploadingImage) || !aiAvailable}
              className="px-4 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-all transform hover:scale-105 shadow-md"
              title="Send message"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                />
              </svg>
            </button>
          </div>
          {!aiAvailable && (
            <p className="text-xs text-red-500 mt-2 text-center">
              AI service is currently unavailable. Please check your
              configuration.
            </p>
          )}
        </div>
      </div>
    );
  }
);

AIChat.displayName = 'AIChat';

export default AIChat;