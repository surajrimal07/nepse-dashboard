// import type { stateResult } from '@/types/misc-types'

// import { defineProxyService } from '@webext-core/proxy-service'

// import { showBrowserNotification } from '@/components/notification/browser-notifications'
// import { injectedShowNotification } from '@/components/notification/notification'
// import { op } from '@/op'
// import { EventName } from '@/types/analytics-types'

// function createContentService() {
//   return {
//     async showNotification(text: string, level = 'info'): Promise<void> {
//       try {
//         const [tab] = await chrome.tabs.query({ active: true, currentWindow: true })

//         if (!tab?.id || !tab.url) {
//           return
//         }

//         const tabUrl = tab.url
//         const isRestricted
//       = tabUrl.startsWith('chrome://')
//         || tabUrl.startsWith('https://chrome.google.com/webstore/')
//         || tabUrl.startsWith('about:')
//         || tabUrl.startsWith('chrome-extension://')
//         || tabUrl.startsWith('file://')

//         if (isRestricted) {
//           showBrowserNotification({
//             id: 'notification',
//             title: 'Nepse Dashboard',
//             message: text,
//             priority: 'high',
//             category: 'system',
//             timestamp: Date.now(),
//             read: false,
//           })
//           return
//         }

//         await browser.scripting.executeScript({
//           target: { tabId: tab.id },
//           func: injectedShowNotification,
//           args: [text, level],
//           injectImmediately: true,
//           world: 'ISOLATED',
//         })
//       }
//       catch (error) {
//         showBrowserNotification({
//           id: 'notification',
//           title: 'Nepse Dashboard',
//           message: text,
//           priority: 'high',
//           category: 'system',
//           timestamp: Date.now(),
//           read: false,
//         })

//         op.track(EventName.NOTIFICATION_ERROR, {
//           error: error instanceof Error ? error.message : String(error),
//           stack: error instanceof Error ? error.stack : undefined,
//           timestamp: new Date().toISOString(),
//         })
//       }
//     },

//     trackEvent(data: any): stateResult {
//       op.track(data.event as EventName, data.data)
//       return { success: true, message: 'Event tracked successfully' }
//     },
//   }
// }

// export const [registerContentService, getContentService] = defineProxyService(
//   'ContentService',
//   createContentService,
// )
