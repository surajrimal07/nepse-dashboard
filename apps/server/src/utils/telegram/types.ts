import type { Context } from 'grammy';

// Define session structure
export interface SessionData {
  lastCommand?: string;
  preferences?: {
    notifications: boolean;
    favoriteStocks: string[];
  };
  // Add spam protection tracking
  spamProtection?: {
    messageCount: number;
    lastMessageTime: number;
    warningLevel: number;
    mutedUntil?: number;
  };
}

// Extend Context to include session data
export interface BotContext extends Context {
  session: SessionData;
}
