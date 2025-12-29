export type tiers = 'anon' | 'free' | 'pro' | 'elite';

export type UserAccessInfo = {
  user_id: string;
  tier: tiers;
  user_email: string | null;
  is_active: boolean;
  expires_at: string | null;
  news_summary_tokens_used: number;
  ai_chat_tokens_used: number;
  total_tokens_granted: number;
  api_rpm: number;
  api_rpd: number;
  ws_rpm: number;
  ws_rpd: number;
  news_rpd: number;
  ai_chat_rpd: number;
  tokens_remaining: number;
  plan_active: boolean;
};

export type UserWsSession = UserAccessInfo & {
  connectedAt: string;
};
