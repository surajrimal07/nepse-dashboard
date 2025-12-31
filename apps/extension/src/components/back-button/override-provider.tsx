import type { ReactNode } from "react";
import { createContext, useContext } from "react";

interface WidgetOverrideContextValue {
	fullscreen?: boolean | null;
	canGoBack?: boolean | null;
}

const WidgetOverrideContext = createContext<WidgetOverrideContextValue | null>(
	null,
);

export function useWidgetOverride(): WidgetOverrideContextValue {
	return useContext(WidgetOverrideContext) ?? {};
}

interface WidgetOverrideProviderProps {
	value: WidgetOverrideContextValue;
	children: ReactNode;
}

export function ProviderOverride({
	value,
	children,
}: WidgetOverrideProviderProps) {
	return (
		<WidgetOverrideContext.Provider value={value}>
			{children}
		</WidgetOverrideContext.Provider>
	);
}
