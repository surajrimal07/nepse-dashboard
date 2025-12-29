// import { useEffect, useRef } from "react";
// import { initDragManager } from "./drag-manager";
// import type { Language, Position } from "./store";
// import { useDragCardState } from "./store";

// export function useContentUtility() {
// 	// Subscribe to store state
// 	const isDragging = useDragCardState((state) => state.isDragging);
// 	const position = useDragCardState((state) => state.position);
// 	const isCollapsed = useDragCardState((state) => state.isCollapsed);
// 	const language = useDragCardState((state) => state.language);
// 	const toggleCollapsed = useDragCardState((state) => state.toggleCollapsed);
// 	const toggleLanguage = useDragCardState((state) => state.toggleLanguage);

// 	// Ref for cleanup function
// 	const cleanupRef = useRef<(() => void) | null>(null);

// 	// Element ref callback - initializes DragManager when element is attached
// 	const setElementRef = (element: HTMLDivElement | null) => {
// 		// Cleanup previous instance
// 		if (cleanupRef.current) {
// 			cleanupRef.current();
// 			cleanupRef.current = null;
// 		}

// 		// Initialize new instance
// 		if (element) {
// 			cleanupRef.current = initDragManager(element);
// 		}
// 	};

// 	// Cleanup on unmount
// 	useEffect(() => {
// 		return () => {
// 			if (cleanupRef.current) {
// 				cleanupRef.current();
// 			}
// 		};
// 	}, []);

// 	// Return same interface as before - 1:1 compatibility
// 	return {
// 		elementRef: setElementRef,
// 		isDragging,
// 		position,
// 		isCollapsed,
// 		toggleCollapsed,
// 		language,
// 		toggleLanguage,
// 	};
// }

// // Re-export types for convenience
// export type { Position, Language };
