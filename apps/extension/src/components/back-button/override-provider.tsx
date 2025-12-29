import { createContext, type ReactNode, useContext } from "react";

interface WidgetOverrideContextValue {
	fullscreen?: boolean | null;
	canGoBack?: boolean | null;
}

const WidgetOverrideContext = createContext<WidgetOverrideContextValue | null>(
	null,
);

export const useWidgetOverride = (): WidgetOverrideContextValue => {
	return useContext(WidgetOverrideContext) ?? {};
};

interface WidgetOverrideProviderProps {
	value: WidgetOverrideContextValue;
	children: ReactNode;
}

export const ProviderOverride = ({
	value,
	children,
}: WidgetOverrideProviderProps) => (
	<WidgetOverrideContext.Provider value={value}>
		{children}
	</WidgetOverrideContext.Provider>
);
