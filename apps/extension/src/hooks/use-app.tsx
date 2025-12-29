// import type { ReactNode } from "react";
// import { createContext, use } from "react";

// export type ExtensionEnv = "popup" | "sidepanel" | "options";

// interface AppContextValue {
// 	env?: ExtensionEnv;
// 	fullScreen?: boolean;
// }

// const AppContext = createContext<AppContextValue | undefined>(undefined);

// export function AppProvider({
// 	env,
// 	fullScreen,
// 	children,
// }: {
// 	env?: ExtensionEnv;
// 	fullScreen?: boolean;
// 	children: ReactNode;
// }) {
// 	return <AppContext value={{ env, fullScreen }}>{children}</AppContext>;
// }

// function useAppContext(): AppContextValue {
// 	return use(AppContext) ?? { env: "popup", fullScreen: false };
// }

// // Environment hooks
// export const useIsSidepanel = () => useAppContext().env === "sidepanel";
// export const useIsPopup = () => useAppContext().env === "popup";
// export const useIsOptions = () => useAppContext().env === "options";

// // Fullscreen hooks
// export function useIsFullScreen(): boolean {
// 	return useAppContext().fullScreen ?? false;
// }
