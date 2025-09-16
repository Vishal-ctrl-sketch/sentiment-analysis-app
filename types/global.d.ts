declare module 'ai/react' {
  import { FormEvent } from 'react';

  export interface ChatMessage {
  id?: string; // make optional
  role: 'user' | 'assistant' | 'system';
  content: string;
}

  export interface UseChatOptions {
    api?: string;
    initialMessages?: ChatMessage[];
    onResponse?: (message: ChatMessage) => void;
  }

  export function useChat(options?: UseChatOptions): {
    messages: ChatMessage[];
    input: string;
    handleInputChange: (value: string) => void;
    handleSubmit: (event?: FormEvent<HTMLFormElement>) => void;
    append: (message: ChatMessage) => void;
    isLoading: boolean; // <-- required by your component
  };
}