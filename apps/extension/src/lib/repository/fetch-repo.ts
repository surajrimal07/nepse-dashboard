// import type { SocketRequest } from '@/types/port-types'
// import { defineProxyService } from '@webext-core/proxy-service'
// import { getAppState, socketClient } from '@/entrypoints/background'
// import { generateRequestId } from '@/utils/utils'

// const MAX_CONCURRENT_REQUESTS = 50
// const DEFAULT_REQUEST_TIMEOUT_MS = 30000

// export interface PendingRequestEntry {
//   resolve: (value: any) => void
//   reject: (reason?: any) => void
//   timeoutId: ReturnType<typeof setTimeout>
//   timestamp: number
// }
// export const pendingRequests = new Map<string, PendingRequestEntry>()

// function cleanup(): void {
//   if (pendingRequests.size >= MAX_CONCURRENT_REQUESTS) {
//     const oldestRequestId = pendingRequests.keys().next().value
//     if (oldestRequestId) {
//       const oldestRequest = pendingRequests.get(oldestRequestId)
//       if (oldestRequest) {
//         clearTimeout(oldestRequest.timeoutId)
//         const errorMessage = `Request (ID: ${oldestRequestId}) was cancelled due to exceeding maximum concurrent requests.`
//         console.warn(`FetchService: ${errorMessage}`)
//         oldestRequest.reject(new Error(errorMessage))
//         pendingRequests.delete(oldestRequestId)
//       }
//     }
//   }
// }

// function createFetchService() {
//   return {
//     async fetch<TResponse = any>(data: Omit<SocketRequest, 'requestId' | 'userToken'>): Promise<TResponse> {
//       return new Promise<TResponse>((resolve, reject) => {
//         const access_token = getAppState().get().supabaseAccessToken

//         if (!socketClient || !socketClient.ws || !socketClient.isConnected) {
//           return reject(new Error('WebSocket not connected. Cannot send request.'))
//         }

//         if (!data) {
//           return reject(new Error('No data provided for fetch request.'))
//         }

//         if (!access_token) {
//           return reject(new Error('Access token is missing. Cannot send request.'))
//         }

//         if (pendingRequests.size >= MAX_CONCURRENT_REQUESTS) {
//           cleanup()
//         }

//         const message: SocketRequest = {
//           requestId: generateRequestId(),
//           userToken: access_token,
//           ...data,
//         }

//         const requestId = message.requestId!

//         const timeoutId = setTimeout(() => {
//           if (pendingRequests.has(requestId)) {
//             const timedOutRequest = pendingRequests.get(requestId)!
//             pendingRequests.delete(requestId)

//             timedOutRequest.reject(
//               new Error(`Request  timed out after ${DEFAULT_REQUEST_TIMEOUT_MS}ms.`),
//             )
//           }
//         }, DEFAULT_REQUEST_TIMEOUT_MS)

//         pendingRequests.set(requestId, {
//           resolve,
//           reject,
//           timeoutId,
//           timestamp: Date.now(),
//         })

//         try {
//           socketClient.ws.send(JSON.stringify(message))
//         }
//         catch (error) {
//           clearTimeout(timeoutId) // Clear the timeout
//           pendingRequests.delete(requestId) // Remove from pending
//           const errorMessage = error instanceof Error ? error.message : String(error)
//           reject(new Error(`Failed to send WebSocket request: ${errorMessage}`))
//         }
//       })
//     },
//   }
// }
// export const [registerFetch, getFetch] = defineProxyService('FetchService', createFetchService)
