// import { create } from 'crann';
// import {
//   CHART_URL,
//   COMMUNITY_CHAT_URL,
//   LOGIN_URL,
//   PRIVACY_URL,
//   REVIEW_URL,
//   TELEGRAM_URL,
//   TERMS_URL,
// } from '@/constants/constants';
// import { op } from '@/op';
// import { socketClient } from '@/entrypoints/background/background';
// import { NepseWebSocket } from '../socket';
// import { EventName } from '@/types/analytics-types';
// import { showGlobalNotification } from '../notification/global-notification';
// import { userConfig } from './keys-service';

// function actionsHandlers() {
//   return {
//     handlePrivacyPolicy: {
//       handler: async () => {
//         op.screenView('/privacy-policy');
//         try {
//           await browser.tabs.create({ url: PRIVACY_URL });
//           return { success: true, message: 'Privacy policy opened successfully' };
//         } catch {
//           return { success: false, message: 'Failed to open privacy policy' };
//         }
//       },
//     },
//   };
// }

// export const testService = create(test());

// export const actionService = create({
//   handlePrivacyPolicy: {
//     handler: async () => {
//       op.screenView('/privacy-policy');
//       try {
//         await browser.tabs.create({ url: PRIVACY_URL });
//         return { success: true, message: 'Privacy policy opened successfully' };
//       } catch {
//         return { success: false, message: 'Failed to open privacy policy' };
//       }
//     },
//   },

//   handleJoinTelegram: {
//     handler: async () => {
//       op.screenView('/join-telegram');
//       try {
//         await browser.tabs.create({ url: TELEGRAM_URL, active: true });
//         return { success: true, message: 'Telegram opened successfully' };
//       } catch {
//         return { success: false, message: 'Failed to open Telegram' };
//       }
//     },
//   },

//   handleTermsOfService: {
//     handler: async () => {
//       op.screenView('/terms-of-service');
//       try {
//         await browser.tabs.create({ url: TERMS_URL });
//         return { success: true, message: 'Terms of service opened successfully' };
//       } catch {
//         return { success: false, message: 'Failed to open terms of service' };
//       }
//     },
//   },

//   handleReview: {
//     handler: async () => {
//       op.screenView('/review');
//       try {
//         await browser.tabs.create({ url: REVIEW_URL });
//         return { success: true, message: 'Review page opened successfully' };
//       } catch {
//         return { success: false, message: 'Failed to open review page' };
//       }
//     },
//   },

//   closeLoginTab: {
//     handler: async () => {
//       try {
//         const tabId = userConfig.get().loginTabId;
//         if (tabId) {
//           await browser.tabs.remove(tabId);

//               await userConfig.set({ id: null });

//           await userConfig.callAction('modifyLoginTabId', null);
//           return { success: true, message: 'Login tab closed successfully' };
//         }
//         return { success: false, message: 'No login tab found to close' };
//       } catch {
//         return { success: false, message: 'Failed to close login tab' };
//       }
//     },
//   },

//   handleOpenOptions: {
//     handler: async () => {
//       try {
//         if (browser.runtime.openOptionsPage) {
//           await browser.runtime.openOptionsPage();
//           return { success: true, message: 'Options page opened successfully' };
//         }
//         return { success: false, message: 'Options page not available' };
//       } catch {
//         return { success: false, message: 'Failed to open options page' };
//       }
//     },
//   },

//   handleSignIn: {
//     handler: async () => {
//       try {
//         const randomToken = Math.random().toString(36).substring(2, 15);

//         await userConfig.modifyLoginToken(randomToken);

//         const loginUrlObj = new URL(LOGIN_URL);
//         loginUrlObj.searchParams.set('id', randomToken);
//         const loginUrl = loginUrlObj.href;

//         browser.tabs.create({ url: loginUrl }, async function (tab) {
//           const tabId = tab.id;
//           if (tabId) {
//             await userConfig.modifyLoginTabId(tabId.toString());
//           }
//         });

//         op.screenView('/login');
//         return { success: true, message: 'Sign in page opened successfully' };
//       } catch {
//         return { success: false, message: 'Failed to open sign in page' };
//       }
//     },
//   },

//   handleNotification: {
//     handler: async (_state, _setState, _target, text: string, level: 'info' | 'error' = 'info') => {
//       try {
//         if (text && level) {
//           showGlobalNotification(text, level);
//           return { success: true, message: 'Notification shown successfully' };
//         }
//         op.track('notification', { text, level });
//         return { success: false, message: 'Invalid notification parameters' };
//       } catch {
//         return { success: false, message: 'Failed to show notification' };
//       }
//     },
//     validate: (text: string, level?: 'info' | 'error') => {
//       if (typeof text !== 'string') throw new Error('Valid text string is required');
//       if (level && !['info', 'error'].includes(level))
//         throw new Error('Level must be info or error');
//     },
//   },

//   handleInstallUpdate: {
//     handler: async () => {
//       try {
//         op.track('update_available');
//         setTimeout(() => browser.runtime.reload(), 2000);
//         return { success: true, message: 'Update installation started' };
//       } catch {
//         return { success: false, message: 'Failed to install update' };
//       }
//     },
//   },

//   handleVisitChart: {
//     handler: async (_state, _setState, _target, symbol: string) => {
//       try {
//         if (!symbol) {
//           return { success: false, message: 'Invalid stock symbol' };
//         }

//         op.track(EventName.CHART_OPENED, { symbol });
//         chrome.tabs.create({
//           url: `${CHART_URL}${symbol}`,
//         });

//         return { success: true, message: `Chart opened for ${symbol}` };
//       } catch {
//         return { success: false, message: 'Failed to open chart' };
//       }
//     },
//     validate: (symbol: string) => {
//       if (typeof symbol !== 'string' || !symbol.trim()) throw new Error('Valid symbol is required');
//     },
//   },

//   handleReconnectWebSocket: {
//     handler: async (_state, _setState, _target, forceRefresh: boolean = true) => {
//       try {
//         if (forceRefresh || !socketClient?.isConnected) {
//           NepseWebSocket.getInstance(forceRefresh);
//         }
//         op.track(EventName.RECONNECT_SOCKET);
//         return { success: true, message: 'WebSocket reconnected successfully' };
//       } catch {
//         return { success: false, message: 'Failed to reconnect WebSocket' };
//       }
//     },
//     validate: (forceRefresh?: boolean) => {
//       if (forceRefresh !== undefined && typeof forceRefresh !== 'boolean') {
//         throw new Error('ForceRefresh must be a boolean');
//       }
//     },
//   },

//   handleCount: {
//     handler: async (_state, _setState, _target, countType: countType, loggedInAs?: string) => {
//       try {
//         const state = await userConfig.getState();
//         const id = state.id;

//         if (!id) {
//           console.warn('No Supabase ID found, using anonymous profile');
//         }

//         const payload: IncrementPayload = {
//           profileId: id || 'anonymous',
//           property: countType,
//           value: 1,
//         };

//         op.increment(payload);

//         if (loggedInAs) {
//           showGlobalNotification(`Logged in as ${loggedInAs}`, 'info');
//         }

//         op.track('count', { countType, loggedInAs });
//         return { success: true, message: 'Count handled successfully' };
//       } catch {
//         return { success: false, message: 'Failed to handle count' };
//       }
//     },
//     validate: (countType: countType, loggedInAs?: string) => {
//       if (!['activation', 'tms', 'meroshare'].includes(countType)) {
//         throw new Error('CountType must be activation, tms, or meroshare');
//       }
//       if (loggedInAs !== undefined && typeof loggedInAs !== 'string') {
//         throw new Error('LoggedInAs must be a string');
//       }
//     },
//   },

//   handleTrackAnalytics: {
//     handler: async (
//       _state,
//       _setState,
//       _target,
//       type: track,
//       event: EventName,
//       properties: Record<string, unknown>,
//     ) => {
//       try {
//         if (type === 'track' && event) {
//           op.track(event as EventName, properties);
//         }

//         return { success: true, message: 'Analytics tracked successfully' };
//       } catch {
//         return { success: false, message: 'Failed to track analytics' };
//       }
//     },
//     validate: (type: track, event: EventName, properties: Record<string, unknown>) => {
//       if (!['track', 'identify'].includes(type)) throw new Error('Type must be track or identify');
//       if (typeof event !== 'string') throw new Error('Event must be a string');
//       if (typeof properties !== 'object') throw new Error('Properties must be an object');
//     },
//   },

//   checkCommunityChatAvailability: {
//     handler: async () => {
//       try {
//         const controller = new AbortController();
//         const timeoutId = window.setTimeout(() => controller.abort(), 5000);

//         const response = await fetch(COMMUNITY_CHAT_URL, {
//           method: 'HEAD',
//           signal: controller.signal,
//           cache: 'no-cache',
//         });

//         clearTimeout(timeoutId);

//         if (!response.ok) {
//           return { success: false, message: 'Service returned an error response' };
//         }

//         return { success: true, message: 'Service is available' };
//       } catch (error) {
//         op.track(EventName.CHAT_DOWN, {
//           error: error instanceof Error ? error.message : String(error),
//           name: 'Community Chat',
//         });
//         return { success: false, message: 'Service check failed or timed out' };
//       }
//     },
//   },

//   openTradePage: {
//     handler: async (
//       _state,
//       _setState,
//       _target,
//       tradeData: { tmsUrl: string; stock: string; type: 'Buy' | 'Sell' },
//     ) => {
//       try {
//         const { tmsUrl, stock, type } = tradeData;

//         if (!tmsUrl || !stock) {
//           return { success: false, message: 'Invalid trade data' };
//         }

//         const url = `${tmsUrl}/me/memberclientorderentry?symbol=${stock.toUpperCase()}&transaction=${type}`;
//         chrome.tabs.create({ url });

//         op.track(type === 'Buy' ? EventName.BUY_INITIATED : EventName.SELL_INITIATED, {
//           broker: tmsUrl,
//           symbol: stock,
//         });

//         return { success: true, message: `Trade page opened for ${type} ${stock}` };
//       } catch {
//         return { success: false, message: 'Failed to open trade page' };
//       }
//     },
//     validate: (tradeData: { tmsUrl: string; stock: string; type: 'Buy' | 'Sell' }) => {
//       if (typeof tradeData !== 'object') throw new Error('Trade data must be an object');
//       if (typeof tradeData.tmsUrl !== 'string') throw new Error('TMS URL must be a string');
//       if (typeof tradeData.stock !== 'string') throw new Error('Stock must be a string');
//       if (!['Buy', 'Sell'].includes(tradeData.type)) throw new Error('Type must be Buy or Sell');
//     },
//   },
// });

// export type ActionServiceResult = Result;
