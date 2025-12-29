/**
 * NAASAX CONTENT SCRIPT - AUTO-LOGIN & AUTO-SAVE DOCUMENTATION
 *
 * PURPOSE:
 * This content script handles automated login and credential auto-save functionality
 * for NaasaX (Nepal Stock Exchange) platform. NaasaX is a NON-SPA (Single Page Application)
 * website, meaning pages reload during navigation, requiring special handling for data persistence.
 *
 * KEY FEATURES:
 * 1. AUTO-LOGIN: Automatically fills and submits login credentials for saved accounts
 * 2. AUTO-SAVE: Monitors manual user input and saves new credentials after successful login
 * 3. ERROR HANDLING: Robust retry logic with attempt limits and error reporting
 * 4. NON-SPA PERSISTENCE: Uses localStorage to persist data across page reloads
 *
 * HOW IT WORKS:
 *
 * A. INITIALIZATION (on login page):
 *    1. Check if auto-save is enabled in settings
 *    2. If enabled, setup credential monitoring (username/password input listeners)
 *    3. Setup login button monitoring to capture manual login attempts
 *    4. Attempt auto-login with saved credentials
 *
 * B. AUTO-LOGIN FLOW:
 *    1. Retrieve account from state (primary NAASAX account or first available)
 *    2. Fill username and password fields
 *    3. Store alias in localStorage before clicking login (for post-login verification)
 *    4. Submit form (page will reload to dashboard)
 *    5. On dashboard page, cleanUP() verifies success and shows notification
 *
 * C. AUTO-SAVE FLOW (Manual Login):
 *    1. Monitor user input in username/password fields (set isUserInput flag)
 *    2. On login button click, if user entered credentials manually:
 *       - Save credentials to localStorage with special format before page reload
 *    3. On dashboard page load, cleanUP() detects manual credentials in localStorage
 *    4. Call saveNaasaXAccountIfNeeded() to save the new account
 *    5. Clear localStorage data after successful save
 *
 * D. ERROR HANDLING:
 *    - Max login attempts: 1 (configurable via MAX_LOGIN_ATTEMPTS)
 *    - On failure: calls setError(), disables auto-login, tracks event
 *    - Toast notifications for user feedback
 *
 * E. LOCALSTORAGE STRATEGY (NON-SPA):
 *    - TEMP_ALIAS: stores account alias during auto-login for post-login verification
 *    - TEMP_CREDENTIALS: stores manual credentials before page reload for auto-save
 *    - cleanUP(): processes localStorage data on dashboard page load
 *
 * IMPORTANT PATTERNS:
 * - Uses localStorage because NaasaX reloads pages (loses in-memory state)
 * - cleanUP() function handles post-login processing on dashboard page
 * - Efficient: only sets up monitoring if auto-save is enabled
 * - Avoids duplicate API calls by checking settings once during initialization
 */
