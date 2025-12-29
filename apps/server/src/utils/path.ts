import { isDevelopment } from 'env';

export const getNepseWorkerPath = (): string => {
  return new URL(isDevelopment ? './worker.ts' : './worker.js', import.meta.url)
    .href;
};
