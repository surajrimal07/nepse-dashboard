import { isDevelopment } from 'env';

export function isAllowedOrigin(origin: string): boolean {
  if (isDevelopment) {
    return true;
  }

  const allowedOrigins = [
    'chrome-extension://efglamoipanaajcmhfeblhdbhciggojd',
  ];

  if (allowedOrigins.includes(origin)) {
    return true;
  }

  if (origin.startsWith('https://surajrimal.dev')) {
    return true;
  }

  if (
    origin.endsWith('.nepsechatbot.com') ||
    origin === 'https://nepsechatbot.com'
  ) {
    return true;
  }

  if (origin.startsWith('moz-extension://')) {
    return true;
  }

  if (origin.startsWith('chrome-extension://')) {
    return true;
  }

  return false;
}
