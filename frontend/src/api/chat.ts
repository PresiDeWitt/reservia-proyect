import { api } from './client';

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export const chatApi = {
  send: async (
    message: string,
    history: ChatMessage[],
    location?: { lat: number; lng: number },
  ): Promise<string> => {
    const data = await api.post<{ reply: string }>(
      '/chat/',
      {
        message,
        history,
        ...(location ? { lat: location.lat, lng: location.lng } : {}),
      },
      true,  // noRetry
      25000, // timeout en 25s (backend tiene 20s)
    );
    return data.reply;
  },
};
