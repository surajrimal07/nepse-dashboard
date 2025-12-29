import { createJSONStorage, persist } from "zustand/middleware";
import { useStore } from "zustand/react";
import { createStore } from "zustand/vanilla";

export interface Position {
	x: number;
	y: number;
}

export type Language = "en" | "np";

export interface DragCardState {
	// State
	position: Position;
	isDragging: boolean;
	isCollapsed: boolean;
	language: Language;

	// Actions
	setPosition: (position: Position) => void;
	setIsDragging: (isDragging: boolean) => void;
	toggleCollapsed: () => void;
	toggleLanguage: () => void;
}

const DEFAULT_POSITION: Position = { x: 20, y: 20 };

export const dragCardStore = createStore<DragCardState>()(
	persist(
		(set, get) => ({
			// Initial state
			position: DEFAULT_POSITION,
			isDragging: false,
			isCollapsed: true,
			language: "en",

			// Actions
			setPosition: (position) => set({ position }),
			setIsDragging: (isDragging) => set({ isDragging }),
			toggleCollapsed: () => set({ isCollapsed: !get().isCollapsed }),
			toggleLanguage: () =>
				set({ language: get().language === "en" ? "np" : "en" }),
		}),
		{
			name: "nepse-dashboard-state",
			storage: createJSONStorage(() => localStorage),
			version: 1,
			// Only persist these fields, exclude isDragging
			partialize: (state) => ({
				position: state.position,
				isCollapsed: state.isCollapsed,
				language: state.language,
			}),
		},
	),
);

export function useDragCardState<T>(selector: (state: DragCardState) => T) {
	return useStore(dragCardStore, selector);
}
