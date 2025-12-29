/**
 * TMS CONTENT SCRIPT - AUTO-LOGIN & AUTO-SAVE DOCUMENTATION
 *
 * PURPOSE:
 * This content script handles automated login and credential auto-save functionality
 * for TMS (Trading Management System) platforms. TMS is a NON-SPA platform that requires
 * CAPTCHA solving for login, making it unique among the three content scripts.
 *
 * KEY FEATURES:
 * 1. AUTO-LOGIN: Automatically fills username/password and solves CAPTCHA for saved accounts
 * 2. AUTO-SAVE: Monitors manual user input and saves new credentials after successful login
 * 3. CAPTCHA HANDLING: Automated CAPTCHA solving with reload limits and confidence checking
 * 4. ERROR HANDLING: Robust retry logic with attempt limits and error reporting
 * 5. BROKER MATCHING: Extracts broker number from URL to match with correct account
 *
 * HOW IT WORKS:
 *
 * A. INITIALIZATION (on login page):
 *    1. Check if auto-save is enabled in settings
 *    2. If enabled, setup credential monitoring (username/password input listeners)
 *    3. Setup login button monitoring to capture manual login attempts
 *    4. Extract broker number from URL for account matching
 *    5. Setup CAPTCHA monitoring and solving
 *    6. Attempt auto-login with saved credentials after CAPTCHA is solved
 *
 * B. AUTO-LOGIN FLOW:
 *    1. Extract broker number from URL (e.g., tms15.nepsetms.com.np → broker 15)
 *    2. Find matching TMS account with same broker number
 *    3. Fill username and password fields
 *    4. Wait for CAPTCHA to be solved automatically
 *    5. Submit form and verify login success via URL pattern
 *    6. On success: set TMS URL, show notification, track event
 *
 * C. AUTO-SAVE FLOW (Manual Login):
 *    1. Monitor user input in username/password fields (set isUserInput flag)
 *    2. On login button click, if user entered credentials manually:
 *       - Store credentials temporarily (using appropriate storage strategy)
 *    3. After successful login verification (URL pattern match):
 *       - Call saveNaasaXAccountIfNeeded() to save the new account
 *       - Reset monitoring state
 *
 * D. CAPTCHA HANDLING:
 *    - MutationObserver watches for CAPTCHA image src changes
 *    - solve_captcha() function processes CAPTCHA images
 *    - Reload limit (RELOAD_LIMIT = 3) prevents infinite CAPTCHA reloads
 *    - Confidence checking: only proceed with high-confidence CAPTCHA solutions
 *    - Auto-refill credentials after each CAPTCHA reload
 *
 * E. ERROR HANDLING:
 *    - Max login attempts: 1 (configurable via MAX_LOGIN_ATTEMPTS)
 *    - CAPTCHA reload limit: 3 attempts
 *    - On failure: calls setError(), disables auto-login, tracks events
 *    - Page reload if CAPTCHA element not found
 *
 * F. BROKER MATCHING:
 *    - Extracts broker number from URL using regex pattern
 *    - Matches with TMS accounts having same broker number (padded to 2 digits)
 *    - Prioritizes primary accounts, falls back to first matching account
 *
 * IMPORTANT PATTERNS:
 * - CAPTCHA solving is critical - credentials are refilled after each CAPTCHA reload
 * - Broker number extraction enables multi-broker support
 * - Similar to NaasaX in being NON-SPA but with additional CAPTCHA complexity
 * - Manual login monitoring must not interfere with CAPTCHA solving process
 */
