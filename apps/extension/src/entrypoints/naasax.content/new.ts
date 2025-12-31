// import type { Account } from '@/types/account-types'
// import { MatchPattern } from '#imports'
// import { connect } from 'crann-fork'
// import {
//   chrome_naasax_url,
//   naasa_dashboard_url,
// } from '@/constants/content-url'
// import { track } from '@/lib/analytics'
// import { onMessage } from '@/lib/messaging/window-messaging'
// import { appState } from '@/lib/service/app-service'
// import { AccountType } from '@/types/account-types'
// import { Env, EventName } from '@/types/analytics-types'

// // Patterns
// const naasaAuth = new MatchPattern(chrome_naasax_url)
// const naasaDashboard = new MatchPattern(naasa_dashboard_url)

// /**
//  * Constants & Selectors
//  */
// const ELEMENT_IDS = {
//   USERNAME: 'username',
//   PASSWORD: 'login-password',
//   LOGIN_BTN: 'kc-login',
//   ERROR_SPAN: 'input-error',
//   LOGIN_FORM: 'kc-form-login',
// } as const

// const ERRORS = {
//   INVALID_CREDENTIALS: 'Invalid username or password.',
//   ACTION_EXPIRED: 'Action expired. Please continue with login now.',
// } as const

// const MAX_LOGIN_ATTEMPTS = 3

// /**
//  * NaasaXAutomation Class
//  * Handles auto-login and auto-save for NaasaX (Non-SPA, reloads on submit).
//  */
// class NaasaXAutomation {
//   // --- State ---
//   private isActive = false
//   private isRunning = false
//   private abortController: AbortController | null = null

//   // Connection
//   private appConnection = connect(appState)

//   // Data
//   private accounts: Account[] = []
//   private currentAccount: Account | null = null

//   // Counters & Flags
//   private autoLoginAttempts = 0
//   private isProgrammaticInput = false

//   // Observers
//   private errorObserver: MutationObserver | null = null

//   // Credential Monitoring
//   private monitoredCredentials = {
//     username: '',
//     password: '',
//     isUserInput: false,
//   }

//   constructor() {
//     this.accounts = this.appConnection.get().accounts ?? []
//   }

//   public async init() {
//     if (this.isActive)
//       return
//     this.isActive = true

//     // 1. Listen for global messages
//     this.setupGlobalMessageListeners()

//     // 2. Subscribe
//     this.appConnection.subscribe(
//       async (state) => {
//         this.accounts = state.accounts ?? []
//         await this.syncState()
//       },
//       ['accounts', 'autofills', 'autoSaveNewAccount'],
//     )

//     // 3. Initial Sync
//     await this.syncState()
//   }

//   // --- Lifecycle ---

//   private async syncState() {
//     const url = new URL(window.location.href)

//     // Dashboard Logic
//     if (naasaDashboard.includes(url)) {
//       logger.log('NaasaX: on Dashboard.')
//       if (this.isRunning)
//         this.stop()
//       await this.handleDashboard()
//       return
//     }

//     // Login Page Logic
//     if (naasaAuth.includes(url)) {
//       logger.log('NaasaX: on Login Page.')
//       // If not running, start
//       if (!this.isRunning) {
//         await this.start()
//       }
//       else {
//         // If already running, just update current account
//         await this.updateCurrentAccount()
//       }
//     }
//   }

//   public async start() {
//     logger.log('NaasaX Automation: Starting...')
//     this.isRunning = true
//     this.abortController = new AbortController()

//     // Cleanup potential old resources just in case
//     this.disconnectFollowers()

//     // 1. Determine target account
//     await this.updateCurrentAccount()

//     if (!this.currentAccount) {
//       logger.log('NaasaX Automation: No NaasaX account found in state.')
//     }
//     else {
//       logger.log(`NaasaX Automation: Found account for ${this.currentAccount.alias}`)
//     }

//     // 2. Check for existing errors on page (Non-SPA specific)
//     const hasCriticalError = await this.checkForExistingErrors()
//     if (hasCriticalError) {
//       logger.log('NaasaX: Critical error on page load. Pausing automation.')
//       return
//     }

//     // 3. Enable modules
//     this.enableAutoSaveModule() // Monitor inputs for manual login
//     await this.attemptAutoLogin() // Try to login if applicable
//   }

//   public stop() {
//     logger.log('NaasaX Automation: Stopping...')
//     this.isRunning = false

//     if (this.abortController) {
//       this.abortController.abort()
//       this.abortController = null
//     }
//     this.disconnectFollowers()
//   }

//   private disconnectFollowers() {
//     if (this.errorObserver) {
//       this.errorObserver.disconnect()
//       this.errorObserver = null
//     }
//   }

//   private async updateCurrentAccount() {
//     const matchingAccounts = this.accounts.filter(
//       acc => acc.type === AccountType.NAASAX,
//     )
//     this.currentAccount
//       = matchingAccounts.find(acc => acc.isPrimary)
//         || matchingAccounts[0]
//         || null

//     // logger.log("NaasaX: Current account updated:", this.currentAccount?.alias);
//   }

//   // --- Auto Login Logic ---

//   private async attemptAutoLogin() {
//     logger.log('NaasaX: Attempting auto-login...')
//     if (!this.isRunning) {
//       logger.log('NaasaX: Automation not running, aborting auto-login.')
//       return
//     }
//     if (!this.currentAccount) {
//       logger.log('NaasaX: No current account found in state.', this.currentAccount)
//       logger.log('NaasaX: No current account, aborting auto-login.')
//       return
//     }

//     // Check User Settings
//     const isAutofillEnabled = this.appConnection.get().autofills.naasax
//     logger.log('NaasaX: Autofill enabled setting:', isAutofillEnabled)

//     if (!isAutofillEnabled) {
//       logger.log('NaasaX: Auto-login disabled by user.')
//       return
//     }

//     // Check Account Health
//     if (this.currentAccount.error) {
//       logger.log('NaasaX: Account has error, skipping auto-login.')
//       await this.appConnection.callAction(
//         'showNotification',
//         `Auto-login details have error: ${this.currentAccount.error}`,
//         'info',
//       )
//       return
//     }

//     // Look for form - Wait for it!
//     logger.log(`NaasaX: Waiting for username field (#${ELEMENT_IDS.USERNAME})...`)
//     const usernameField = await this.waitForElement(ELEMENT_IDS.USERNAME)

//     if (!usernameField) {
//       logger.log('NaasaX: Login form not found after waiting (timeout).')
//       return // Exit if form never appears
//     }
//     logger.log('NaasaX: Login form found.')

//     // SETUP ERROR MONITORING immediately before action
//     this.setupErrorMonitoring()

//     // FILL & PREPARE
//     this.fillCredentials(this.currentAccount)
//     logger.log('NaasaX: Credentials filled.')

//     // SUBMIT
//     // We use a slight delay and a "Temp Data" trick because page reloads
//     if (this.autoLoginAttempts >= MAX_LOGIN_ATTEMPTS) {
//       logger.log('NaasaX: Max attempts reached.')
//       await this.appConnection.callAction(
//         'showNotification',
//         'Auto-login stopped: too many attempts.',
//         'warning',
//       )
//       // Disable autofill to prevent loops
//       await this.appConnection.callAction('setAutofill', AccountType.NAASAX, false)
//       return
//     }

//     this.autoLoginAttempts++
//     logger.log(`NaasaX: Submitting form (Attempt ${this.autoLoginAttempts})...`)
//     await this.submitForm(this.currentAccount.alias, true)
//   }

//   private fillCredentials(account: Account) {
//     this.fillInput(ELEMENT_IDS.USERNAME, account.username)
//     this.fillInput(ELEMENT_IDS.PASSWORD, account.password)
//   }

//   private fillInput(id: string, value: string) {
//     const el = document.getElementById(id) as HTMLInputElement
//     if (!el) {
//       logger.log(`NaasaX: Could not find input #${id} to fill.`)
//       return
//     }

//     this.isProgrammaticInput = true
//     el.value = value
//     el.dispatchEvent(new Event('input', { bubbles: true }))
//     el.dispatchEvent(new Event('change', { bubbles: true }))
//     this.isProgrammaticInput = false
//   }

//   private async submitForm(aliasOrUser: string, isAutoLogin: boolean) {
//     const btn = document.getElementById(ELEMENT_IDS.LOGIN_BTN) as HTMLButtonElement
//     if (!btn) {
//       logger.log('NaasaX: Login button not found!')
//       return
//     }
//     if (btn.disabled) {
//       logger.log('NaasaX: Login button is disabled!')
//       return
//     }

//     // PERSIST INTENT: Save a temp record in backend so we know who we were trying to log in as
//     // when the page reloads and hits the dashboard.
//     if (isAutoLogin) {
//       logger.log('NaasaX: Saving temp data before submit...')
//       await this.appConnection.callAction('setTempNaasaxData', { alias: aliasOrUser })
//     }
//     else {
//       // For manual autosave, we passed the data earlier or will handle differently?
//       // The `enableAutoSaveModule` handles the temp data setting for manual cases.
//     }

//     logger.log('NaasaX: Clicking login button...')
//     btn.click()
//   }

//   private waitForElement(id: string, timeout = 5000): Promise<HTMLElement | null> {
//     return new Promise((resolve) => {
//       if (document.getElementById(id)) {
//         // logger.log(`NaasaX: Element #${id} found immediately.`);
//         return resolve(document.getElementById(id) as HTMLElement)
//       }

//       // logger.log(`NaasaX: Element #${id} not found immediately, observing...`);
//       const observer = new MutationObserver(() => {
//         if (document.getElementById(id)) {
//           // logger.log(`NaasaX: Element #${id} found via observer.`);
//           resolve(document.getElementById(id) as HTMLElement)
//           observer.disconnect()
//         }
//       })

//       observer.observe(document.body, {
//         childList: true,
//         subtree: true,
//       })

//       setTimeout(() => {
//         observer.disconnect()
//         // logger.log(`NaasaX: Timeout waiting for #${id}.`);
//         resolve(null)
//       }, timeout)
//     })
//   }

//   // --- Modules ---

//   private enableAutoSaveModule() {
//     const uField = document.getElementById(ELEMENT_IDS.USERNAME) as HTMLInputElement
//     const pField = document.getElementById(ELEMENT_IDS.PASSWORD) as HTMLInputElement
//     const btn = document.getElementById(ELEMENT_IDS.LOGIN_BTN)

//     if (!uField || !pField || !btn) {
//       logger.log('NaasaX: AutoSave - Input fields missing.')
//       return
//     }

//     const signal = this.abortController?.signal

//     const inputHandler = (type: 'username' | 'password') => (e: Event) => {
//       if (this.isProgrammaticInput)
//         return
//       this.monitoredCredentials[type] = (e.target as HTMLInputElement).value
//       this.monitoredCredentials.isUserInput = true
//     }

//     uField.addEventListener('input', inputHandler('username'), { signal })
//     pField.addEventListener('input', inputHandler('password'), { signal })

//     btn.addEventListener('click', async () => {
//       if (
//         this.monitoredCredentials.isUserInput
//         && this.monitoredCredentials.username
//         && this.monitoredCredentials.password
//       ) {
//         logger.log('NaasaX: Manual login detected. Saving temp data...')
//         // Trick: Save to backend before reload
//         await this.appConnection.callAction('setTempNaasaxData', {
//           username: this.monitoredCredentials.username,
//           password: this.monitoredCredentials.password,
//         })
//       }
//     }, { signal })
//   }

//   private setupErrorMonitoring() {
//     if (this.errorObserver)
//       this.errorObserver.disconnect()

//     this.errorObserver = new MutationObserver((mutations) => {
//       for (const m of mutations) {
//         if (m.type === 'childList' && m.addedNodes.length > 0) {
//           this.checkForErrorMutations()
//         }
//       }
//     })

//     const target = document.getElementById(ELEMENT_IDS.LOGIN_FORM) || document.body
//     this.errorObserver.observe(target, { childList: true, subtree: true })
//   }

//   private checkForErrorMutations() {
//     const errorSpan = document.getElementById(ELEMENT_IDS.ERROR_SPAN)
//     const alertTitle = document.querySelector('.pf-c-alert__title.kc-feedback-text')

//     const errorText = errorSpan?.textContent?.trim() || alertTitle?.textContent?.trim()
//     if (!errorText)
//       return

//     logger.log('NaasaX Error detected:', errorText)

//     // Handle Errors
//     if (errorText.includes(ERRORS.INVALID_CREDENTIALS)) {
//       logger.log('NaasaX: Invalid Credentials detected.')
//       if (this.currentAccount) {
//         this.appConnection.callAction('setError', this.currentAccount.alias, 'passwordError')
//         this.stop()
//         this.appConnection.callAction(
//           'showNotification',
//           `Login failed for ${this.currentAccount.alias}: Invalid Password.`,
//           'error',
//         )
//       }
//       this.errorObserver?.disconnect() // Stop watching to prevent loops
//     }
//     else if (errorText.includes(ERRORS.ACTION_EXPIRED)) {
//       // Reload page to fix "Action Expired"
//       logger.log('NaasaX: Action Expired. Reloading...')
//       location.reload()
//     }
//   }

//   private async checkForExistingErrors(): Promise<boolean> {
//     const errorSpan = document.getElementById(ELEMENT_IDS.ERROR_SPAN)
//     const errorText = errorSpan?.textContent?.trim()

//     if (errorText)
//       logger.log('NaasaX: Existing error on page:', errorText)

//     if (errorText === ERRORS.INVALID_CREDENTIALS) {
//       if (this.currentAccount) {
//         await this.appConnection.callAction('setError', this.currentAccount.alias, 'passwordError')
//         await this.appConnection.callAction('setAutofill', AccountType.NAASAX, false)
//         await this.appConnection.callAction('showNotification', 'Invalid credentials. Auto-login paused.', 'error')
//         return true
//       }
//     }
//     else if (errorText === ERRORS.ACTION_EXPIRED) {
//       location.reload()
//       return true
//     }
//     return false
//   }

//   // --- Dashboard / Post-Login ---

//   public async handleDashboard() {
//     logger.log('NaasaX: Handling Dashboard...')
//     // 1. Check Temp Data from Backend
//     const tempData = await this.appConnection.get().tempNaasaxData
//     if (!tempData) {
//       logger.log('NaasaX: No temp data found (regular navigation).')
//       return
//     }

//     const { alias, username, password } = tempData
//     logger.log('NaasaX: Found temp data:', { alias, hasCreds: !!(username && password) })

//     // Case A: Auto-Login Success
//     if (alias) {
//       // Validate validity
//       const exists = this.accounts.find(
//         acc => acc.type === AccountType.NAASAX && acc.alias === alias,
//       )
//       if (exists) {
//         await this.appConnection.callAction('showNotification', `Logged in as ${alias}`, 'success')
//         await this.appConnection.callAction('setLastLoggedIn', alias)
//         track({
//           context: Env.CONTENT,
//           eventName: EventName.AUTO_LOGIN_SUCCESS_NAASAX,
//           params: { alias },
//         })
//         this.handleChangeToDashboardPage()
//       }
//       else {
//         logger.log('NaasaX: Account from temp data not found in state.')
//       }
//     }

//     // Case B: Manual Login Auto-Save
//     if (username && password) {
//       logger.log('NaasaX: Saving manual NaasaX credentials...')
//       await this.appConnection.callAction(
//         'saveAccountIfNeeded',
//         AccountType.NAASAX,
//         null, // No broker for NaasaX
//         username,
//         password,
//       )
//       // Also set as last logged in? Maybe.
//       // The save action usually handles notifications.
//     }

//     // Cleanup Temp Data
//     await this.appConnection.callAction('setTempNaasaxData', null)
//   }

//   public async handleChangeToDashboardPage() {
//     this.stop()
//   }

//   public async handleAutoSaveCredentials() {
//     // Handled via handleDashboard() logic for NaasaX due to page reload nature
//   }

//   // --- Global Msg ---

//   private setupGlobalMessageListeners() {
//     onMessage('manualLoginNaasax', async ({ data }) => {
//       if (data.error) {
//         await this.appConnection.callAction('showNotification', `Cannot login: ${data.error}`, 'error')
//         return
//       }
//       logger.log('NaasaX: Received manual login request.')
//       // Manual login requested
//       this.currentAccount = data as Account
//       // Fill & Submit immediately
//       this.fillCredentials(this.currentAccount)
//       setTimeout(() => {
//         // We treat this like auto-login for tracking purposes (setTempData with alias)
//         // so dashboard recognizes it.
//         this.submitForm(this.currentAccount!.alias, true)
//       }, 500)
//     })
//   }
// }

// export default defineContentScript({
//   matches: [chrome_naasax_url, naasa_dashboard_url],
//   runAt: 'document_idle', // changed to idle for better element availability
//   async main(ctx) {
//     logger.log('NaasaX Content Script Initialized')
//     const automation = new NaasaXAutomation()

//     // Initial Run
//     await automation.init()

//     // Watch URL changes (if they happen via History API too, though NaasaX is MPA)
//     ctx.addEventListener(window, 'wxt:locationchange', async () => {
//       logger.log('NaasaX: Location changed (WXT handle)')
//       // NaasaX usually reloads, but just in case
//       await automation.init()
//     })
//   },
// })
