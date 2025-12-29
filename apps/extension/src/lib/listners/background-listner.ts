// import type { OddlotResponse } from '@/types/odd-types'
// import type { SocketMessage } from '@/types/port-types'
// import { rateLimitState } from '@/state/rate-limit-state'
// import { EventName } from '@/types/analytics-types'
// import { SOCKET_ROOMS } from '@/types/socket-type'
// import { OpenPanelWeb } from '@/utils/open-panel-web'
// import { messageHandlers, oddLotHandlers } from '../handlers/event-schema'

// // Singleton port instance maintained outside component to persist across re-renders
// let globalPort: Browser.runtime.Port | null = null

// export function initializePort(onMessage: (message: SocketMessage) => void): void {
//   if (!globalPort) {
//     try {
//       globalPort = browser.runtime.connect({ name: 'popup' })
//       globalPort.onMessage.addListener(onMessage)

//       globalPort.onDisconnect.addListener(() => {
//         if (browser.runtime.lastError) {
//           // do nothing, this spams the error logging so much
//         }
//         globalPort = null
//       })
//     }
//     catch (error) {
//       if (error instanceof Error) {
//         const errorMessage = error.message.toLowerCase()
//         if (
//           errorMessage.includes('receiving end does not exist')
//           || errorMessage.includes('extension context invalidated')
//           || errorMessage.includes('could not establish connection')
//           || errorMessage.includes('port closed')
//         ) {
//           globalPort = null
//           return
//         }
//       }

//       OpenPanelWeb.track(EventName.BACKGROUND_LISTENER_EVENTS, {
//         error: error instanceof Error ? error.message : String(error),
//         name: 'BackgroundListener - initializePort',
//       })

//       globalPort = null
//     }
//   }
// }

// // Utility function for reporting errors
// function reportError(errorMessage: string): void {
//   OpenPanelWeb.track(EventName.BACKGROUND_LISTENER_EVENTS, {
//     error: errorMessage,
//     name: 'BackgroundListener',
//   })
// }

// (function BackgroundListener() {
//   const handleMessage = (message: SocketMessage) => {
//     // Handle rate limit updates immediately
//     if (message.rateLimit) {
//       rateLimitState.getState().setRateLimit(message.rateLimit)
//     }

//     // Direct lookup of handlers without property access check for better performance
//     const messageHandler = messageHandlers[message.event as keyof typeof messageHandlers]
//     if (messageHandler) {
//       messageHandler(message.data)
//       return
//     }

//     if (message.event === SOCKET_ROOMS.VALIDATION_ERROR) {
//       // show notification in ui not in background
//       // showNotification(
//       //   message.data.error.error || message.data.error.originalError || 'An unknown error occurred',
//       //   'error',
//       // );
//     }

//     // Special case for odd lot which has nested types
//     if (message.event === SOCKET_ROOMS.ODD_LOT && message.data) {
//       const oddLotData = message.data as Omit<OddlotResponse, 'request_completion'>
//       const handler = oddLotHandlers[oddLotData.type as keyof typeof oddLotHandlers]

//       if (handler) {
//         handler(oddLotData.data)
//       }
//       else {
//         reportError(`Unknown odd lot type: ${oddLotData.type}`)
//       }
//     }
//   }

//   // Initialize port only once at startup
//   initializePort(handleMessage)

//   // Enhanced cleanup function that handles all resources
//   const cleanup = () => {
//     globalPort = null
//   }

//   // Ensure cleanup runs in all contexts
//   if (typeof window !== 'undefined') {
//     window.addEventListener('beforeunload', cleanup)

//     // Also use visibilitychange for better cleanup detection
//     document.addEventListener('visibilitychange', () => {
//       if (document.visibilityState === 'hidden') {
//         cleanup()
//       }
//     })
//   }

//   if (typeof globalThis !== 'undefined') {
//     globalThis.addEventListener('uninstall', cleanup)
//   }
// })()
