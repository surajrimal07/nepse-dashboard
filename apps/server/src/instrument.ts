import {
  dataloaderIntegration,
  fsIntegration,
  getDefaultIntegrations,
  init,
  nativeNodeFetchIntegration,
  onUncaughtExceptionIntegration,
  onUnhandledRejectionIntegration,
  postgresIntegration,
  redisIntegration,
  vercelAIIntegration,
} from '@sentry/bun';
import env, { isProduction } from 'env';

init({
  dsn: env.SENTRY_DSN,
  defaultIntegrations: getDefaultIntegrations({}).filter(
    (i) => i.name !== 'Http'
  ),
  tracesSampleRate: 1.0,
  enabled: isProduction,
  integrations: [
    redisIntegration(),
    nativeNodeFetchIntegration(),
    dataloaderIntegration(),
    fsIntegration(),
    onUnhandledRejectionIntegration(),
    onUncaughtExceptionIntegration(),
    postgresIntegration(),
    vercelAIIntegration({
      recordInputs: true,
      recordOutputs: true,
    }),
  ],
});
