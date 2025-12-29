import type { Position } from "./store";
import { dragCardStore } from "./store";

/**
 * Pure JavaScript drag manager - no React dependencies
 * Handles all drag logic and DOM manipulation
 * Updates Zustand store for state persistence
 */

// Private state - module scoped
let element: HTMLElement | null = null;
let dragData = { startX: 0, startY: 0, offsetX: 0, offsetY: 0 };
let isDragging = false;
let dragStartPosition: Position = { x: 0, y: 0 };
let currentPosition: Position = { x: 0, y: 0 }; // Track position during drag without saving

/**
 * Apply position directly to DOM element
 * Using left/top instead of transform to avoid conflicts with scale animations
 */
function applyPosition(el: HTMLElement, position: Position) {
	el.style.left = `${position.x}px`;
	el.style.top = `${position.y}px`;
}

/**
 * Constrain position within viewport bounds
 */
function constrainPosition(x: number, y: number): Position {
	if (!element) return { x, y };

	const rect = element.getBoundingClientRect();
	const maxX = window.innerWidth - rect.width;
	const maxY = window.innerHeight - rect.height;

	return {
		x: Math.max(0, Math.min(maxX, x)),
		y: Math.max(0, Math.min(maxY, y)),
	};
}

/**
 * Mouse down handler - start drag
 */
function handleMouseDown(e: MouseEvent) {
	if (!element) return;

	const target = e.target as HTMLElement;
	const dragHandle = target.closest("[data-drag-handle]");

	if (!dragHandle) return;

	e.preventDefault();
	e.stopPropagation();

	const rect = element.getBoundingClientRect();
	dragData = {
		startX: e.clientX,
		startY: e.clientY,
		offsetX: e.clientX - rect.left,
		offsetY: e.clientY - rect.top,
	};

	isDragging = true;
	dragStartPosition = dragCardStore.getState().position;
	dragCardStore.getState().setIsDragging(true);
}

/**
 * Mouse move handler - update position during drag
 */
function handleMouseMove(e: MouseEvent) {
	if (!isDragging || !element) return;

	e.preventDefault();

	const newX = e.clientX - dragData.offsetX;
	const newY = e.clientY - dragData.offsetY;
	const constrainedPos = constrainPosition(newX, newY);

	// Store position in memory only - NO storage writes during drag
	currentPosition = constrainedPos;

	// Apply directly to DOM for immediate visual feedback
	applyPosition(element, constrainedPos);
}

/**
 * Mouse up handler - end drag
 */
function handleMouseUp() {
	if (!isDragging || !element) return;

	isDragging = false;
	dragCardStore.getState().setIsDragging(false);

	// Save to store ONCE after drag ends - triggers single localStorage write
	if (
		currentPosition.x !== dragStartPosition.x ||
		currentPosition.y !== dragStartPosition.y
	) {
		dragCardStore.getState().setPosition(currentPosition);
	}

	// Re-apply to ensure position sticks after state update
	applyPosition(element, currentPosition);
}

/**
 * Initialize drag manager with element
 * Returns cleanup function
 */
export function initDragManager(el: HTMLElement): () => void {
	element = el;

	// Apply initial position from store and sync to memory
	const initialPosition = dragCardStore.getState().position;
	currentPosition = initialPosition;
	applyPosition(el, initialPosition);

	// Attach event listeners
	el.addEventListener("mousedown", handleMouseDown, {
		passive: false,
	});
	document.addEventListener("mousemove", handleMouseMove, {
		passive: false,
	});
	document.addEventListener("mouseup", handleMouseUp);

	// Return cleanup function
	return () => {
		el.removeEventListener("mousedown", handleMouseDown);
		document.removeEventListener("mousemove", handleMouseMove);
		document.removeEventListener("mouseup", handleMouseUp);

		// Reset state
		element = null;
		isDragging = false;
	};
}
