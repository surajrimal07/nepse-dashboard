// Keep the original enum for direct access like EventName.STOCK_SCROLLING_ENABLED_SIDEPANEL
export const EventName = {
  // Auth events
  USER_LOGIN: 'user_login',
  USER_LOGOUT: 'user_logout',
  LOGIN_FAILED: 'login_failed',
  LOGOUT_FAILED: 'logout_failed',
  INSTALLED: 'installed',
  UPDATED: 'updated',
  GET_USER_FAILED: 'get_user_failed',
  LANDED_IN_NOT_FOUND_PAGE: 'landed_in_not_found_page',
  BANNER_LEARN_MORE_CLICKED: 'banner_learn_more_clicked',
  ITEM_PIN_IN_DASHBOARD_MENU: 'item_pin_in_dashboard_menu',
  UNKNOWN_MESSAGE_RECEIVED: 'unknown_message_received',
  TTS_NOT_AVAILABLE: 'tts_not_available',
  BANNER_DISMISSED: 'banner_dismissed',
  OTP_ERROR: 'otp_error',
  MANUAL_LOGIN_SUCCESS_MEROSHARE: 'manual_login_success_meroshare',
  MANUAL_LOGIN_SUCCESS_TMS: 'manual_login_success_tms',
  MANUAL_LOGIN_FAILED_MEROSHARE: 'manual_login_failed_meroshare',
  MANUAL_LOGIN_FAILED_TMS: 'manual_login_failed_tms',
  NEWS_VOICE_ERROR: 'news_voice_error',
  NEWS_VOICE_PLAYED: 'news_voice_played',
  SUMMARY_TOO_LARGE: 'summary_too_large',
  SUMMARY_GENERATION_FAILED_SERVER: 'summary_generation_failed_server',
  STOCK_CHART_ADDED: 'stock_chart_added',
  STOCK_CHART_REMOVED: 'stock_chart_removed',
  SUMMARY_GENERATION_FAILED_OWN: 'summary_generation_failed_own',
  SUMMARY_GENERATION_SUCCESS: 'summary_generation_success',
  SUGGESTION_GENERATION_FAILED: 'suggestion_generation_failed',
  SUGGESTION_GENERATION_SUCCESS: 'suggestion_generation_success',
  CHAT_TITLE_GENERATION_FAILED: 'chat_title_generation_failed',
  CHAT_QUERY_FAILED: 'chat_query_failed',
  CHAT_QUERY_EXCEPTION: 'chat_query_exception',
  COUNT_FAILED: 'count_failed',
  AUTOFILL_UPDATED: 'autofill_updated',
  AUTOSAVE_NEW_ACCOUNT_UPDATED: 'autosave_new_account_updated',
  SYNC_PORTFOLIO_UPDATED: 'sync_portfolio_updated',

  GCM_REGISTRATION_ERROR: 'gcm_registration_error',
  GCM_REGISTRATION_SUCCESS: 'gcm_registration_success',
  BADGE_UPDATE_ERROR: 'badge_update_error',
  ERROR_BOUNDARY_NEWS_CONTENT: 'error_boundary_news_content',
  ERROR_BOUNDARY_SEARCH_CONTENT: 'error_boundary_search_content',
  NEWS_INFO_CLICKED: 'news_info_clicked',
  BYOK_API_KEY_SAVED: 'byok_api_key_saved',
  BYOK_API_KEY_REMOVED: 'byok_api_key_removed',
  SEARCH_CONTENT_ERROR: 'search_content_error',
  CONTENT_UNIVERSAL_ERROR: 'content_universal_error',
  NEWS_AUDIO_PLAYED: 'news_audio_played',
  NEWS_FEEDBACK_SUBMITTED: 'news_feedback_submitted',
  CHART_ERROR: 'chart_error',

  NEWS_ERROR: 'news_error',

  // Feature events
  NOTIFICATION_ENABLED: 'notification_enabled',
  NOTIFICATION_DISABLED: 'notification_disabled',
  NEPSE_LIVE_ENABLED: 'nepse_live_enabled',
  NEPSE_LIVE_DISABLED: 'nepse_live_disabled',
  AI_CHAT_ENABLED: 'ai_chat_enabled',
  AI_CHAT_DISABLED: 'ai_chat_disabled',
  CHAT_DOWN: 'chat_down',
  CHAT_ERROR: 'chat_error',
  CHAT_ENABLED: 'chat_enabled',
  CHAT_DISABLED: 'chat_disabled',
  // Popup events
  DASHBOARD_ADDED: 'dashboard_added',
  DASHBOARD_REMOVED: 'dashboard_removed',
  STOCK_SCROLLING_ENABLED: 'stock_scrolling_enabled',
  STOCK_SCROLLING_DISABLED: 'stock_scrolling_disabled',
  STOCK_SCROLLING_ENABLED_SIDEPANEL: 'stock_scrolling_enabled_sidepanel',
  STOCK_SCROLLING_DISABLED_SIDEPANEL: 'stock_scrolling_disabled_sidepanel',

  // Sidepanel events
  WIDGET_ADDED: 'widget_added',
  WIDGET_REMOVED: 'widget_removed',
  WIDGET_NOT_FOUND: 'widget_not_found',
  TAB_CHANGED_HOME: 'tab_changed_home',
  TAB_CHANGED_SIDEPANEL_CHAT: 'tab_changed_sidpanel_chat',

  // Trade events
  BUY_INITIATED: 'buy_initiated',
  SELL_INITIATED: 'sell_initiated',
  VIEW_CHART: 'view_chart',

  // screenshots
  SCREENSHOT_SUCCESS: 'screenshot_success',
  SCREENSHOT_FAILED: 'screenshot_failed',

  // User preferences
  THEME_CHANGED_LIGHT: 'theme_changed_light',
  THEME_CHANGED_DARK: 'theme_changed_dark',
  THEME_CHANGED_SYSTEM: 'theme_changed_system',

  // Accounts events
  ACCOUNT_ADDED: 'account_added',
  ACCOUNT_REMOVED: 'account_removed',
  ACCOUNT_RELATED_ERRORS: 'account_related_errors',
  TMS_URL_UPDATED: 'tms_url_updated',
  PRIMARY_STATUS_CHANGED: 'primary_status_changed',

  // Chat with AI events
  CHAT_WITH_AI_STARTED: 'chat_with_ai_started',

  // Auto Login events
  AUTO_LOGIN_SUCCESS_MEROSHARE: 'auto_login_success_meroshare',
  AUTO_LOGIN_SUCCESS_NAASAX: 'auto_login_success_naasax',
  AUTO_LOGIN_SUCCESS_TMS: 'auto_login_success_tms',
  AUTO_LOGIN_FAILED_NAASAX: 'auto_login_failed_naasax',
  AUTO_LOGIN_FAILED_MEROSHARE: 'auto_login_failed_meroshare',
  AUTO_LOGIN_FAILED_TMS: 'auto_login_failed_tms',

  // auto save
  AUTO_SAVE_SUCCESS_MEROSHARE: 'auto_save_success_meroshare',
  AUTO_SAVE_SUCCESS_TMS: 'auto_save_success_tms',
  AUTO_SAVE_FAILED_MEROSHARE: 'auto_save_failed_meroshare',
  AUTO_SAVE_FAILED_TMS: 'auto_save_failed_tms',
  AUTO_SAVE_FAILED_NAASAX: 'auto_save_failed_naasax',
  AUTO_SAVE_SUCCESS_NAASAX: 'auto_save_success_naasax',

  // Backup Restore events
  BACKUP_COMPLETED: 'backup_completed',
  RESTORE_COMPLETED: 'restore_completed',
  BACKUP_FAILED: 'backup_failed',
  RESTORE_FAILED: 'restore_failed',

  MARKET_DEPTH_SYMBOL_ADDED: 'market_depth_symbol_added',
  MARKET_DEPTH_SYMBOL_REMOVED: 'market_depth_symbol_removed',
  WIDGET_RELOADED: 'widget_reloaded',
  WIDGET_LIMIT_REACHED: 'widget_limit_reached',
  UPDATE_CHECKED: 'update_checked',
  HANDLE_UPDATE_CLICKED: 'handle_update_clicked',
  UPDATE_AVAILABLE: 'update_available',
  RESET_REQUESTED: 'reset_requested',
  RELOAD_REQUESTED: 'reload_requested',
  RELOAD_FAILED: 'reload_failed',
  RESET_COMPLETED: 'reset_completed',
  RESET_FAILED: 'reset_failed',
  PORT_ERROR: 'port_error',
  RECONNECT_SOCKET: 'reconnect_socket',

  // Update
  UPDATE_CHECK_ERROR: 'update_check_error',
  UPDATE_ERROR: 'update_error',
  UPDATE_SUCCESS: 'update_success',
  UPDATE_REJECTED: 'update_rejected',
  UPDATE_MISMATCH: 'update_mismatch',
  EXTERNAL_MESSAGE: 'external_message',
  COUNTS: 'counts',
  CLIPBOARD_COPY_ERROR: 'clipboard_copy_error',
  CLIPBOARD_COPY_SUCCESS: 'clipboard_copy_success',
  EMAIL_OPEN_ERROR: 'email_open_error',

  // Activations & Installs & Updates
  ACTIVATION: 'activation', // count
  INSTALLATION: 'installation',
  UPDATE: 'update',
  UNINSTALL: 'uninstall',

  // Exceptions
  CONVEX_EXCEPTION: 'convex_exception',
  CONVEX_EVENTS: 'convex_events',
  BACKGROUND_EXCEPTION: 'background_exception',
  PIN_ERROR: 'pin_error',
  NOT_PINNED: 'not_pinned',
  PINNED: 'pinned',
  BACKGROUND_INFO: 'background_info',
  BACKGROUND_METRICS: 'background_metrics',
  MEROSHARE_CONTENT_EXCEPTION: 'meroshare_content_exception',
  TMS_CONTENT_EXCEPTION: 'tms_content_exception',
  NAASAX_CONTENT_EXCEPTION: 'naasax_content_exception',

  LOGIN_TOKEN_ERROR: 'login_token_error',
  CONTENT_ELEMENT_NOT_FOUND: 'content_element_not_found',

  UNHANDLED_REJECTION: 'unhandled_rejection',

  BACKGROUND_LISTENER_EXCEPTION: 'background_listener_exception',
  BACKGROUND_LISTENER_EVENTS: 'background_listener_events',

  POPUP_EXCEPTION: 'popup_exception',
  OPTIONS_EXCEPTION: 'options_exception',
  SIDEPANEL_EXCEPTION: 'sidepanel_exception',
  SCHEMA_EXCEPTION: 'schema_exception',
  STORAGE_EXCEPTION: 'storage_exception',
  EXCEPTION: 'exception',
  APP_SERVICE_ERROR: 'app_service_error',
  LOCATION_ERROR: 'location_error',

  APP_CONFIG_UPDATED: 'app_config_updated',
  APP_CONFIG_ERROR: 'app_config_error',

  ERROR_BOUNDARY_UNIVERSAL: 'error_boundary_universal',
  ERROR_BOUNDARY_COMPONENT: 'error_boundary_component',

  SCHEMA_NOT_FOUND: 'schema_not_found',

  RATE_LIMITED: 'rate_limited',

  JWT_ERROR: 'jwt_error',
  NOTIFICATION_ERROR: 'notification_error',
  NOTIFICATION_EXPIRED: 'notification_expired',
  NOTIFICATION_BUTTON_ACCEPT: 'notification_button_accept',
  NOTIFICATION_BUTTON_ACCEPT_NO_ACTION: 'notification_button_accept_no_action',
  NOTIFICATION_BUTTON_REJECT: 'notification_button_reject',
  MEROSHARE_CONTENT_SCRIPT_ERROR: 'meroshare_content_script_error',
  MEROSHARE_CONTENT_SCRIPT_EVENTS: 'meroshare_content_script_events',

  TMS_CONTENT_SCRIPT_ERROR: 'tms_content_script_error',
  TMS_CONTENT_SCRIPT_EVENTS: 'tms_content_script_events',

  CHART_OPENED: 'chart_opened',
  WIDGET_REORDERED: 'widget_reordered',
  WIDGET_PINNED: 'widget_pinned',

  LINK_OPENED: 'link_opened',
  PERMISSION_DENIED: 'permission_denied',

  // pin
  PIN_NOT_AVAILABLE: 'pin_not_available',
  PIN_NOT_PINNED: 'pin_not_pinned',
  PIN_PINNED: 'pin_pinned',
  PIN_EXCEPTION: 'pin_exception',
}

export type EventName = (typeof EventName)[keyof typeof EventName]

export const Env = {
  BACKGROUND: 'background',
  POPUP: 'popup',
  SIDEPANEL: 'sidepanel',
  OPTIONS: 'options',
  UNIVERSAL: 'universal',
  CONTENT: 'content',
  NEWS: 'news',
  SEARCH: 'search',
  BROKERPANEL: 'brokerpanel',
  BROKERAUTOFLL: 'brokerautofill',
  BROKERINJECTEDSCRIPT: 'brokerinjectedscript',
} as const

export type Env = (typeof Env)[keyof typeof Env]

export type AnalyticsMessage
  = | {
    type: 'track'
    eventName: EventName
    context: Env
    params?: Record<string, unknown>
  }
  | {
    type: 'page'
    path: string
    title?: string
    context: Env
  }
  | {
    type: 'identify'
  }
