// import type { NotificationType } from '@/types/notification-types'
// import type { SocketRequest } from '@/types/port-types'
// import type { RateLimit } from '@/types/rate-limit-types'
// import type { PingResponse } from '@/types/socket-type'
// import { URLS } from '@/constants/app-urls'
// import { getAppState, ports } from '@/entrypoints/background'
// import { updateBadge } from '@/lib/badge'
// import { sendDataToPort } from '@/lib/handlers/message-handler'
// import { handleNotification } from '@/lib/notification/handle-notification'
// import { EventName } from '@/types/analytics-types'
// import { CONSUME_TYPES } from '@/types/consume-type'
// import { SocketRequestTypeConst } from '@/types/port-types'
// import { CUSTOM_EVENTS, SOCKET_ROOMS } from '@/types/socket-type'
// import { OpenPanelSDK } from '@/utils/open-panel-sdk'
// import { generateRequestId } from '@/utils/utils'
// import { validateNotification } from './notification/validate-notification'

// const SOCKET_INACTIVITY_THRESHOLD = 60000

// const MAX_RECONNECT_INTERVAL = 60000
// const BASE_RECONNECT_INTERVAL = 1000
// const PING_INTERVAL = 2000

// // Define type for event handlers
// type EventHandler = (data: any) => void | Promise<void>

// // Pre-create event handlers map to avoid function creation during runtime
// const dataEventHandlers: Record<string, EventHandler> = {}

// export class NepseWebSocket {
//   private static instance: NepseWebSocket | null = null
//   ws: WebSocket | null = null
//   private reconnectAttempts = 0
//   private _isConnected = false
//   subscriptionStatus: SubscriptionStatus = SubscriptionStatus.NOT_SUBSCRIBED

//   consumeGranted = false
//   private isConsumeScriptInjected = false

//   // connection state
//   private pingTimer: number | null = null
//   private _lastPingTime = 0

//   // handling JWT expired and reauthentication
//   isPausedForAuth = false
//   private isReconnecting = false

//   // Reusable request ID for pings to avoid regenerating
//   private readonly pingRequestId = generateRequestId()

//   // ping paylod onject creation optimization
//   private readonly pingPayloadPrefix = '{"requestId":"'
//   private readonly pingPayloadMiddle = '","type":"ping","room":["pong"],"ping":'
//   private readonly pingPayloadSuffix = '}'

//   // ping socket object creation optimization
//   private readonly _connectionStatusMessage = {
//     event: CUSTOM_EVENTS.CONNECTION_STATUS_RESPONSE,
//     data: {
//       isConnected: 'disconnected',
//       subscriptionStatus: 'pending',
//       message: 'Socket disconnected.',
//       bothWayLatency: 0,
//       oneWayLatency: 0,
//     },
//   }

//   private readonly _rateLimitMessage = {
//     event: CUSTOM_EVENTS.RATE_LIMIT_ERROR,
//     data: {
//       rateLimit: null as RateLimit | null,
//     },
//   }

//   private appState = getAppState()

//   private readonly boundHandlers = {
//     open: null as unknown as (event: Event) => void,
//     close: null as unknown as (event: CloseEvent) => void,
//     error: null as unknown as (event: Event) => void,
//     message: null as unknown as (event: MessageEvent) => void,
//   }

//   private constructor() {
//     updateBadge('Start')

//     // Bind handlers once to avoid creating functions repeatedly
//     this.boundHandlers.open = this.handleOpen.bind(this)
//     this.boundHandlers.close = this.handleClose.bind(this)
//     this.boundHandlers.error = this.handleError.bind(this)
//     this.boundHandlers.message = this.handleMessage.bind(this)

//     // Initialize event handlers map
//     this.initEventHandlers()

//     this.connect()
//   }

//   private initEventHandlers() {
//     dataEventHandlers[SOCKET_ROOMS.SEND_SUBSCRIPTION_CONFIG] = async () => {
//       await this.sendSubscriptionConfig(false)
//     }

//     dataEventHandlers[SOCKET_ROOMS.REQUESTDATA_SUBSCRIPTION] = async () => {
//       this.subscriptionStatus = SubscriptionStatus.SUCCESS
//       await this.sendSubscriptionConfig(true)
//       this.startPingInterval()
//     }

//     dataEventHandlers[SOCKET_ROOMS.SUBSCRIPTION_TIMEOUT] = () => {
//       this.subscriptionStatus = SubscriptionStatus.TIMEOUT

//       updateBadge('Timeout')
//       OpenPanelSDK.track(EventName.SOCKET_EVENTS, {
//         event: 'subscription_timeout',
//       })
//       this.tryReconnect()
//     }

//     dataEventHandlers[SOCKET_ROOMS.SUBSCRIPTION_UPDATE_SUCCESS] = () => {
//       this.subscriptionStatus = SubscriptionStatus.SUCCESS
//     }

//     dataEventHandlers[SOCKET_ROOMS.NOTIFICATION] = function (data: any) {
//       const notificationData = data.data as NotificationType

//       const result = validateNotification(notificationData)
//       if (!result.success) {
//         OpenPanelSDK.track(EventName.NOTIFICATION_ERROR, {
//           error: result.message,
//           name: 'handleNotification',
//         })
//         return
//       }

//       handleNotification(notificationData)
//     }

//     // add type of rate limit data here
//     dataEventHandlers[SOCKET_ROOMS.RATE_LIMIT_ERROR] = (data: any) => {
//       this.subscriptionStatus = SubscriptionStatus.RATE_LIMITED
//       updateBadge('Limit')
//       this.handleRateLimit(data.rateLimit)

//       OpenPanelSDK.track(EventName.RATE_LIMITED, {
//         rateLimit: data.rateLimit,
//       })
//     }

//     dataEventHandlers[SOCKET_ROOMS.JWT_VERIFICATION_ERROR] = dataEventHandlers[
//       SOCKET_ROOMS.JWT_EXPIRED
//     ] = async () => {
//       updateBadge('AuthErr')
//       this.isPausedForAuth = true
//       this.subscriptionStatus = SubscriptionStatus.AUTH_REQUIRED

//       this.appState.set({
//         anonPending: true,
//       })

//       OpenPanelSDK.track(EventName.JWT_ERROR, {
//         event: 'JWT verification error or expired',
//       })
//     }

//     dataEventHandlers[SOCKET_ROOMS.PONG] = async (data: any) => {
//       const pingResponse = data.data as PingResponse
//       if (!pingResponse.clientTime)
//         return

//       const currentTime = Date.now()
//       this._lastPingTime = currentTime
//       const bothWayLatency = currentTime - pingResponse.clientTime
//       const oneWayLatency = currentTime - pingResponse.serverTime

//       // Update connection status message (reuse object)
//       if (oneWayLatency > SOCKET_HIGH_LATENCY_THRESHOLD) {
//         this._connectionStatusMessage.data.isConnected = 'high_latency'
//         this._connectionStatusMessage.data.message
//           = 'High latency. Please check your internet connection.'
//       }
//       else if (oneWayLatency > SOCKET_MEDIUM_LATENCY_THRESHOLD) {
//         this._connectionStatusMessage.data.isConnected = 'medium_latency'
//         this._connectionStatusMessage.data.message = 'Medium latency detected.'
//       }
//       else {
//         this._connectionStatusMessage.data.isConnected = 'connected'
//         this._connectionStatusMessage.data.message = 'Connected'
//       }

//       this._connectionStatusMessage.data.bothWayLatency = bothWayLatency
//       this._connectionStatusMessage.data.oneWayLatency = oneWayLatency

//       // If we were previously rate limited and now connected, update the status
//       if (this.subscriptionStatus === SubscriptionStatus.RATE_LIMITED) {
//         this.subscriptionStatus = SubscriptionStatus.SUCCESS
//       }

//       await this.sendConnectionStatus()
//     }

//     dataEventHandlers[SOCKET_ROOMS.NEPSE_INDEX] = (data: any) => {
//       // Pre-format the data to avoid object creation in the hot path
//       const formattedData = {
//         event: data.event,
//         data: {
//           'NEPSE Index': data.data,
//         },
//         requestId: data.requestId || undefined,
//       }

//       sendDataToPort(formattedData)

//       const change = data.data.change
//       if (change) {
//         updateBadge(change)
//       }
//     }

//     dataEventHandlers[SOCKET_ROOMS.CONSUME] = (data: any) => {
//       switch (data.data.consumeType) {
//         case CONSUME_TYPES.CONSUME_TIMEOUT:
//         case CONSUME_TYPES.CONSUME_UNAVAILABLE: {
//           if (this.isConsumeScriptInjected) {
//             this.unregisterContentScript()
//           }
//           this.consumeGranted = false
//           break
//         }
//         case CONSUME_TYPES.CONSUME_GRANTED: {
//           this.consumeGranted = true
//           break
//         }
//         case CONSUME_TYPES.CONSUME_AVAILABLE: {
//           this.registerContentScript()
//           break
//         }
//       }
//     }
//   }

//   // New private method that can be called manually
//   private async sendSubscriptionConfig(requestConfig?: boolean): Promise<void> {
//     // early varible check to avoid unnecessary processing
//     const config = this.appState.get().subscribeConfig
//     if (!config || !config.room || config.room.length === 0) {
//       OpenPanelSDK.track(EventName.SOCKET_EXCEPTION, {
//         error: 'No subscription config available',
//         name: 'sendSubscriptionConfig',
//       })

//       updateBadge('fatal')
//       return
//     }

//     if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
//       return
//     }

//     const userToken = this.appState.get().userProfile?.supabaseAccessToken

//     // If JWT is not available, pause for authentication
//     if (!userToken) {
//       this.pauseForAuth()
//       return
//     }

//     if (!requestConfig) {
//       this.subscriptionStatus = SubscriptionStatus.PENDING
//     }

//     const message: SocketRequest = {
//       ...config,
//       requestId: generateRequestId(),
//       type: requestConfig ? SocketRequestTypeConst.requestData : SocketRequestTypeConst.subscribe,
//       userToken,
//     }
//     this.ws.send(JSON.stringify(message))
//     updateBadge('Sent')
//   }

//   // Public method to trigger subscription config sending manually
//   public async triggerSendSubscriptionConfig(): Promise<void> {
//     await this.sendSubscriptionConfig(false)
//   }

//   static getInstance(): NepseWebSocket {
//     if (!NepseWebSocket.instance) {
//       NepseWebSocket.instance = new NepseWebSocket()
//     }

//     return NepseWebSocket.instance!
//   }

//   forceReconnect() {
//     if (
//       this.ws
//       && this.ws.readyState === WebSocket.OPEN
//       && this.isConnected
//     ) {
//       this.close()
//     }
//     this.reconnectAttempts = 0
//     this.tryReconnect()
//   }

//   private startPingInterval() {
//     this.stopPingInterval()
//     if (this.subscriptionStatus === SubscriptionStatus.SUCCESS) {
//       const pingPayloadStart = this.pingPayloadPrefix + this.pingRequestId + this.pingPayloadMiddle

//       // eslint-disable-next-line no-restricted-globals
//       this.pingTimer = self.setInterval(() => {
//         if (this.ws?.readyState === WebSocket.OPEN) {
//           const timestamp = Date.now()
//           const payload = pingPayloadStart + timestamp + this.pingPayloadSuffix
//           this.ws.send(payload)
//         }
//       }, PING_INTERVAL)
//     }
//   }

//   private stopPingInterval() {
//     if (this.pingTimer) {
//       globalThis.clearInterval(this.pingTimer)
//       this.pingTimer = null
//     }
//   }

//   // to do
//   async registerContentScript() {
//     if (this.isConsumeScriptInjected)
//       return

//     try {
//       await browser.scripting.registerContentScripts([
//         {
//           id: 'tms-live-fetch-script',
//           js: ['content-script/tms/content-script-tms.js'],
//           matches: ['https://*.nepsetms.com.np/*'],
//           runAt: 'document_idle',
//           persistAcrossSessions: true,
//         },
//       ])

//       this.isConsumeScriptInjected = true
//     }
//     catch (error) {
//       OpenPanelSDK.track(EventName.SOCKET_EXCEPTION, {
//         error: error instanceof Error ? error.message : String(error),
//         name: 'registerContentScript',
//       })
//     }
//   }

//   async unregisterContentScript() {
//     if (!this.isConsumeScriptInjected)
//       return

//     try {
//       const registeredContentScripts = await browser.scripting.getRegisteredContentScripts()

//       const isScriptRegistered = registeredContentScripts.some(
//         script => script.id === 'tms-live-fetch-script',
//       )

//       if (!isScriptRegistered) {
//         return
//       }

//       await browser.scripting.unregisterContentScripts({
//         ids: ['tms-live-fetch-script'],
//       })

//       this.isConsumeScriptInjected = false
//     }
//     catch (error) {
//       OpenPanelSDK.track(EventName.SOCKET_EXCEPTION, {
//         error: error instanceof Error ? error.message : String(error),
//         name: 'unregisterContentScript',
//       })
//     }
//   }

//   private async sendConnectionStatus() {
//     if (!this._isConnected) {
//       this._connectionStatusMessage.data.isConnected = 'disconnected'
//       this._connectionStatusMessage.data.message = 'Socket disconnected. Attempting to reconnect.'
//     }

//     if (this._lastPingTime && Date.now() - this._lastPingTime > SOCKET_INACTIVITY_THRESHOLD) {
//       this._connectionStatusMessage.data.isConnected = 'inactive'
//       this._connectionStatusMessage.data.message = 'Socket inactive. No data received recently.'
//       updateBadge('Idle')
//     }

//     this._connectionStatusMessage.data.subscriptionStatus = this.subscriptionStatus

//     this.sendMessage(this._connectionStatusMessage)
//   }

//   private handleRateLimit(rateLimitData: RateLimit) {
//     this._rateLimitMessage.data.rateLimit = rateLimitData
//     this.sendMessage(this._rateLimitMessage)
//   }

//   private async sendMessage(message: object) {
//     if (!ports || ports.size === 0)
//       return
//     for (const port of ports) {
//       try {
//         port.postMessage(message)
//       }
//       catch (error) {
//         OpenPanelSDK.track(EventName.PORT_ERROR, {
//           error: error instanceof Error ? error.message : String(error),
//           name: 'NepseWebSocket.sendMessage',
//         })
//       }
//     }
//   }

//   private handleMessage(event: MessageEvent) {
//     try {
//       const data = JSON.parse(event.data)

//       if (data.rateLimit) {
//         this.handleRateLimit(data.rateLimit)
//       }

//       const handler = dataEventHandlers[data.event]
//       if (handler) {
//         handler(data)
//         return
//       }

//       sendDataToPort(data)
//     }
//     catch (error) {
//       OpenPanelSDK.track(EventName.SOCKET_EXCEPTION, {
//         error: error instanceof Error ? error.message : String(error),
//         name: 'handleMessage',
//       })
//     }
//   }

//   private connect() {
//     if (this.isPausedForAuth) {
//       return
//     }

//     if (this.ws && this.ws.readyState === WebSocket.OPEN) {
//       return
//     }

//     const apiKey = import.meta.env.VITE_SOCKET_KEY || undefined
//     const wsUrl = URLS.ws_url

//     if (!wsUrl || !apiKey) {
//       OpenPanelSDK.track(EventName.SOCKET_EXCEPTION, {
//         error: `Missing baseUrl or apiKey - ${wsUrl} - ${apiKey}`,
//         name: 'connect',
//       })
//       return
//     }

//     this.ws = new WebSocket(wsUrl, [apiKey])

//     this.ws.onopen = this.boundHandlers.open
//     this.ws.onclose = this.boundHandlers.close
//     this.ws.onerror = this.boundHandlers.error
//     this.ws.onmessage = this.boundHandlers.message
//   }

//   get isConnected(): boolean {
//     return (
//       this._isConnected
//       && this.ws !== null
//       && this.ws?.readyState === WebSocket.OPEN
//       && this.subscriptionStatus === SubscriptionStatus.SUCCESS
//     )
//   }

//   private handleOpen() {
//     this.reconnectAttempts = 0
//     this.isReconnecting = false
//     this._isConnected = true
//   }

//   private handleClose() {
//     this._isConnected = false
//     updateBadge('Close')
//     this.sendConnectionStatus()

//     this.stopPingInterval()
//     this.subscriptionStatus = SubscriptionStatus.PENDING
//     this.tryReconnect()
//   }

//   private handleError(event: Event) {
//     this.stopPingInterval()
//     this._isConnected = false
//     updateBadge('Error')

//     OpenPanelSDK.track(EventName.SOCKET_EXCEPTION, {
//       error: event instanceof Error ? event.message : String(event),
//       name: 'handleError',
//     })

//     this.subscriptionStatus = SubscriptionStatus.PENDING
//     this.sendConnectionStatus()
//     this.tryReconnect()
//   }

//   private tryReconnect() {
//     if (this.isPausedForAuth) {
//       updateBadge('AuthErr')
//       return
//     }

//     if (this.ws && this.ws.readyState === WebSocket.OPEN)
//       return

//     if (this.isReconnecting) {
//       return
//     }

//     this.reconnectAttempts++

//     if (this.reconnectAttempts > 10) {
//       updateBadge('Fail')

//       OpenPanelSDK.track(EventName.SOCKET_EVENTS, {
//         event: 'reconnect_failed',
//         attempts: this.reconnectAttempts,
//       })
//       return
//     }

//     updateBadge(`Retry${this.reconnectAttempts}`)
//     this.isReconnecting = true

//     // Use exponential backoff with jitter
//     const base = Math.min(
//       BASE_RECONNECT_INTERVAL * 1.5 ** (this.reconnectAttempts - 1), // Use current attempt number for backoff calculation
//       MAX_RECONNECT_INTERVAL,
//     )
//     const jitter = Math.random() * 0.3 * base
//     const timeout = base + jitter

//     setTimeout(() => {
//       this.isReconnecting = false
//       this.connect()
//     }, timeout)
//   }

//   resumeAfterAuth() {
//     this.isPausedForAuth = false
//     this.reconnectAttempts = 0
//     updateBadge('AuthOK')
//     this.connect()
//   }

//   public pauseForAuth() {
//     this.isPausedForAuth = true
//     this.subscriptionStatus = SubscriptionStatus.AUTH_REQUIRED

//     OpenPanelSDK.track(EventName.SOCKET_EVENTS, {
//       event: 'paused_auth',
//       status: this.subscriptionStatus,
//     })

//     if (this.ws) {
//       this.ws.close()
//       return
//     }

//     updateBadge('Pause')
//     this.stopPingInterval()
//     this.sendConnectionStatus()
//   }

//   close() {
//     if (!this.ws && !this.isPausedForAuth)
//       return

//     updateBadge(this.isPausedForAuth ? 'Pause' : 'Close')

//     this.sendConnectionStatus()

//     if (this.ws) {
//       this.ws.onopen = null
//       this.ws.onmessage = null
//       this.ws.onclose = null
//       this.ws.onerror = null

//       if (this.ws.readyState === WebSocket.OPEN || this.ws.readyState === WebSocket.CONNECTING) {
//         this.ws.close()
//       }
//       this.ws = null
//     }

//     this._isConnected = false
//     this.subscriptionStatus = this.isPausedForAuth
//       ? SubscriptionStatus.AUTH_REQUIRED
//       : SubscriptionStatus.PENDING
//     this.stopPingInterval()
//   }
// }
