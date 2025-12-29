// import { ports } from '@/entrypoints/background'
// import { EventName } from '@/types/analytics-types'
// import { OpenPanelSDK } from '@/utils/open-panel-sdk'

// export function broadcastToPorts(data: unknown): void {
//   if (!ports || ports.size === 0) {
//     return
//   }

//   for (const port of ports) {
//     try {
//       port.postMessage(data)
//     }
//     catch (error) {
//       if (error instanceof Error) {
//         const errorMessage = error.message.toLowerCase()
//         if (
//           errorMessage.includes('receiving end does not exist')
//           || errorMessage.includes('extension context invalidated')
//           || errorMessage.includes('could not establish connection')
//           || errorMessage.includes('port closed')
//           || errorMessage.includes('disconnected')
//         ) {
//           continue
//         }
//       }

//       OpenPanelSDK.track(EventName.PORT_ERROR, {
//         error: error instanceof Error ? error.message : String(error),
//         name: 'Error in broadcastToPorts',
//         portSize: ports.size,
//       })
//     }
//   }
// }
