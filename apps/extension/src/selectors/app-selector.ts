// import type { AppState } from '@/state/app-state'
// import type { stateResult } from '@/types/misc-types'
// import type { NewsSiteType } from '@/types/news-types'
// import type { Version } from '@/types/socket-type'

// export const selectTmsUrl = (state: AppState): string | null => state.tmsUrl
// export const selectSetTmsUrl = (state: AppState): ((url: string) => void) => state.setTmsUrl

// export const selectVersion = (state: AppState) => state.version
// export const selectSetVersion = (state: AppState): ((version: Version) => void) => state.setVersion
// export const selectIsUpdateAvailable = (state: AppState): boolean => state.version.updateAvailable

// // Global news selectors
// export const selectGlobalNewsEnabled = (state: AppState): boolean => state.globalNewsEnabled
// export const selectSetGlobalNewsEnabled = (state: AppState): ((enabled: boolean) => stateResult) => state.setGlobalNewsEnabled
// export const selectToggleGlobalNews = (state: AppState): (() => stateResult) => state.toggleGlobalNews

// // Fine-grained news visibility selectors
// export const selectNewsVisibility = (state: AppState): Record<NewsSiteType, boolean> => state.newsVisibility
// export const selectSetNewsVisibility = (state: AppState): ((accountType: NewsSiteType, visible: boolean) => stateResult) => state.setNewsVisibility
// export const selectToggleNewsVisibility = (state: AppState): ((accountType: NewsSiteType) => stateResult) => state.toggleNewsVisibility
// export const selectIsNewsVisible = (state: AppState): ((accountType: NewsSiteType) => boolean) => state.isNewsVisible

// // Convenience selectors for specific news sites
// export const selectMerolaganiVisibility = (state: AppState): boolean => state.newsVisibility.merolagani
// export const selectSharesansarVisibility = (state: AppState): boolean => state.newsVisibility.sharesansar
// export const selectIsMerolaganiVisible = (state: AppState): boolean => state.isNewsVisible('merolagani')
// export const selectIsSharesansarVisible = (state: AppState): boolean => state.isNewsVisible('sharesansar')
