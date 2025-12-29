// import type { LiveDataFromTMS } from '@/types/consume-type'
// import type { StackError, stateResult } from '@/types/misc-types'
// import { defineProxyService } from '@webext-core/proxy-service'
// import {
//   AUTHOR_EMAIL,
//   CHART_URL,
//   COMMUNITY_CHAT_URL,
//   LOGIN_URL,
//   PRIVACY_URL,
//   REVIEW_URL,
//   TELEGRAM_URL,
//   TERMS_URL,
// } from '@/constants/constants'
// import { appInstance, socketClient } from '@/entrypoints/background'
// import { op } from '@/op'
// import { EventName } from '@/types/analytics-types'
// import { SocketRequestTypeConst } from '@/types/port-types'
// import { getBrokers } from '../fetcher'
// import { showGlobalNotification } from '../notification/global-notification'
// import { NepseWebSocket } from '../socket'
// import { loginTabId, loginToken, supabaseId } from '../storage/storage'

// // ----- CONSTANTS & INITIALIZATION -----
// const ONE_MINUTE = 60 * 1000
// let lastConsumeCheck = 0

// type track = 'track' | 'identify'
// type countType = 'activation' | 'tms' | 'meroshare'

// interface IncrementPayload {
//   profileId: string
//   property: string
//   value?: number
// }

// function createActionsService() {
//   return {
//     async handlePrivacyPolicy(): Promise<stateResult> {
//       op.screenView('/privacy-policy')
//       try {
//         await browser.tabs.create({ url: PRIVACY_URL })
//         return { success: true, message: 'Privacy policy opened successfully.' }
//       }
//       catch {
//         return { success: false, message: 'Failed to open privacy policy.' }
//       }
//     },

//     async handleJoinTelegram(): Promise<stateResult> {
//       op.screenView('/join-telegram')
//       try {
//         await browser.tabs.create({ url: TELEGRAM_URL, active: true })
//         return { success: true, message: 'Telegram opened successfully.' }
//       }
//       catch {
//         return { success: false, message: 'Failed to open Telegram.' }
//       }
//     },

//     async handleEmailSupport(error: StackError): Promise<stateResult> {
//       op.screenView('/email-support')
//       try {
//         const mailBody = encodeURIComponent(`Error Details:\n${JSON.stringify(error, null, 2)}`)
//         const emailUrl = `mailto:${AUTHOR_EMAIL}?subject=Nepse%20Dashboard%20Error%20Report&body=${mailBody}`

//         await browser.tabs.create({ url: emailUrl, active: true })
//         return { success: true, message: 'Email client opened successfully.' }
//       }
//       catch (error) {
//         op.track(EventName.EMAIL_OPEN_ERROR, {
//           error: error instanceof Error ? error.message : String(error),
//           name: 'Nepse Dashboard',
//         })
//         return { success: false, message: 'Failed to open email client.' }
//       }
//     },

//     async handleTermsOfService(): Promise<stateResult> {
//       op.screenView('/terms-of-service')
//       try {
//         await browser.tabs.create({ url: TERMS_URL })
//         return { success: true, message: 'Terms of service opened successfully.' }
//       }
//       catch {
//         return { success: false, message: 'Failed to open terms of service.' }
//       }
//     },

//     async handleReview(): Promise<stateResult> {
//       op.screenView('/review')
//       try {
//         await browser.tabs.create({ url: REVIEW_URL })
//         return { success: true, message: 'Review page opened successfully.' }
//       }
//       catch {
//         return { success: false, message: 'Failed to open review page.' }
//       }
//     },

//     async closeLoginTab(): Promise<stateResult> {
//       try {
//         const tabId = await loginTabId.getValue()
//         if (tabId) {
//           await Promise.allSettled([
//             browser.tabs.remove(tabId),
//             loginTabId.removeValue(),
//           ])
//           return { success: true, message: 'Login tab closed successfully.' }
//         }
//         return { success: false, message: 'No login tab found to close.' }
//       }
//       catch {
//         return { success: false, message: 'Failed to close login tab.' }
//       }
//     },

//     async handleOpenOptions(): Promise<stateResult> {
//       try {
//         if (browser.runtime.openOptionsPage) {
//           await browser.runtime.openOptionsPage()
//           return { success: true, message: 'Options page opened successfully.' }
//         }
//         return { success: false, message: 'Options page not available.' }
//       }
//       catch {
//         return { success: false, message: 'Failed to open options page.' }
//       }
//     },

//     async handleSignIn(): Promise<stateResult> {
//       try {
//         const randomToken = Math.random().toString(36).substring(2, 15)

//         await loginToken.setValue(randomToken)

//         const loginUrlObj = new URL(LOGIN_URL)
//         loginUrlObj.searchParams.set('id', randomToken)
//         const loginUrl = loginUrlObj.href

//         browser.tabs.create({ url: loginUrl }, async (tab) => {
//           const tabId = tab.id
//           if (tabId) {
//             await loginTabId.setValue(tabId)
//           }
//         })

//         op.screenView('/login')
//         return { success: true, message: 'Sign in page opened successfully.' }
//       }
//       catch {
//         return { success: false, message: 'Failed to open sign in page.' }
//       }
//     },

//     handleNotification(text: string, level: 'info' | 'error' = 'info'): stateResult {
//       try {
//         if (text && level) {
//           showGlobalNotification(text, level)
//           return { success: true, message: 'Notification shown successfully.' }
//         }
//         op.track('notification', { text, level })
//         return { success: false, message: 'Invalid notification parameters.' }
//       }
//       catch {
//         return { success: false, message: 'Failed to show notification.' }
//       }
//     },

//     handleInstallUpdate(): stateResult {
//       try {
//         op.track('update_available')
//         setTimeout(() => browser.runtime.reload(), 2000)
//         return { success: true, message: 'Update installation started.' }
//       }
//       catch {
//         return { success: false, message: 'Failed to install update.' }
//       }
//     },

//     handleVisitChart(symbol: string): stateResult {
//       try {
//         if (!symbol) {
//           return { success: false, message: 'Invalid stock symbol.' }
//         }

//         op.track(EventName.CHART_OPENED, { symbol })
//         browser.tabs.create({
//           url: `${CHART_URL}${symbol}`,
//         })

//         return { success: true, message: `Chart opened for ${symbol}.` }
//       }
//       catch {
//         return { success: false, message: 'Failed to open chart.' }
//       }
//     },

//     handleReconnectWebSocket(forceRefresh = true): stateResult {
//       try {
//         if (forceRefresh || !socketClient?.isConnected) {
//           NepseWebSocket.getInstance(forceRefresh)
//         }
//         op.track(EventName.RECONNECT_SOCKET)
//         return { success: true, message: 'WebSocket reconnected successfully.' }
//       }
//       catch {
//         return { success: false, message: 'Failed to reconnect WebSocket.' }
//       }
//     },

//     async handleCount(countType: countType, loggedInAs: string | null): Promise<stateResult> {
//       try {
//         const id = await supabaseId.getValue()

//         if (!id) {
//           console.warn('No Supabase ID found, using anonymous profile')
//         }

//         const payload: IncrementPayload = {
//           profileId: id || 'anonymous',
//           property: countType,
//           value: 1,
//         }

//         op.increment(payload)

//         if (loggedInAs) {
//           showGlobalNotification(`Logged in as ${loggedInAs}`, 'info')
//         }

//         op.track('count', { countType, loggedInAs })
//         return { success: true, message: 'Count handled successfully.' }
//       }
//       catch {
//         return { success: false, message: 'Failed to handle count.' }
//       }
//     },

//     handleTrackAnalytics(
//       type: track,
//       event: EventName,
//       properties: Record<string, unknown>,
//     ): stateResult {
//       try {
//         if (type === 'track' && event) {
//           op.track(event as EventName, properties)
//         }

//         return { success: true, message: 'Analytics tracked successfully.' }
//       }
//       catch {
//         return { success: false, message: 'Failed to track analytics.' }
//       }
//     },

//     async checkCommunityChatAvailability(): Promise<stateResult> {
//       try {
//         const controller = new AbortController()
//         const timeoutId = window.setTimeout(() => controller.abort(), 5000)

//         const response = await fetch(COMMUNITY_CHAT_URL, {
//           method: 'HEAD',
//           signal: controller.signal,
//           cache: 'no-cache',
//         })

//         clearTimeout(timeoutId)

//         if (!response.ok) {
//           return { success: false, message: 'Service returned an error response.' }
//         }

//         return { success: true, message: 'Service is available.' }
//       }
//       catch (error) {
//         op.track(EventName.CHAT_DOWN, {
//           error: error instanceof Error ? error.message : String(error),
//           name: 'Community Chat',
//         })
//         return { success: false, message: 'Service check failed or timed out.' }
//       }
//     },

//     openTradePage({
//       tmsUrl,
//       stock,
//       type,
//     }: {
//       tmsUrl: string
//       stock: string
//       type: 'Buy' | 'Sell'
//     }): stateResult {
//       try {
//         if (!tmsUrl || !stock) {
//           return { success: false, message: 'Invalid trade data.' }
//         }

//         const url = `${tmsUrl}/me/memberclientorderentry?symbol=${stock.toUpperCase()}&transaction=${type}`
//         browser.tabs.create({ url })

//         op.track(type === 'Buy' ? EventName.BUY_INITIATED : EventName.SELL_INITIATED, {
//           broker: tmsUrl,
//           symbol: stock,
//         })

//         return { success: true, message: `Trade page opened for ${type} ${stock}` }
//       }
//       catch {
//         return { success: false, message: 'Failed to open trade page.' }
//       }
//     },

//     // to be called from content script
//     handleNepseIndexUpdate(data: LiveDataFromTMS): stateResult {
//       const now = Date.now()

//       // Check if we need to verify consumption privileges
//       if (!socketClient?.consumeGranted) {
//         if (now - lastConsumeCheck >= ONE_MINUTE) {
//           if (socketClient?.ws && socketClient.isConnected) {
//             socketClient.ws.send(
//               JSON.stringify({
//                 requestId: generateRequestId(),
//                 type: SocketRequestTypeConst.isConsumeAvailable,
//                 userToken: access_token,
//               }),
//             )
//           }
//           lastConsumeCheck = now
//         }
//         return { success: true, message: 'Consumption privileges verified.' }
//       }

//       // Send data if client is ready
//       if (socketClient?.ws && socketClient.isConnected) {
//         socketClient.ws.send(
//           JSON.stringify({
//             requestId: generateRequestId(),
//             type: SocketRequestTypeConst.sendData,
//             consumeData: data,
//           }),
//         )
//         return { success: true, message: 'Nepse index data sent successfully.' }
//       }
//       return { success: false, message: 'WebSocket not connected. Cannot send data.' }
//     },

//     async fetchBrokers(): Promise<stateResult> {
//       try {
//         const brokers = await getBrokers()
//         if (!brokers) {
//           return { success: false, message: 'Failed to fetch brokers.' }
//         }
//         return { success: true, message: 'Brokers fetched successfully.', data: brokers }
//       }
//       catch (error) {
//         op.track(EventName.EXCEPTION, {
//           error: error instanceof Error ? error.message : String(error),
//           name: 'getBrokers',
//         })
//         return { success: false, message: 'Failed to fetch brokers.' }
//       }
//     },

//   }
// }
// export const [registerActions, getActions] = defineProxyService(
//   'ActionsService',
//   createActionsService,
// )
