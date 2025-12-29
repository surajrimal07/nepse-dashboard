// import type { stateResult } from "@/types/misc-types";
// import type { NotificationType } from "@/types/notification-types";

// // modification needed to support rich notifications

// export default function injectedNotification(
// 	title: string,
// 	body: string,
// 	icon?: string,
// 	variant: "success" | "info" | "error" | "warning" = "info",
// ): { success: boolean; message: string } {
// 	const CONTAINER_STYLES =
// 		"position:fixed;bottom:20px;right:20px;z-index:2147483647;pointer-events:none;display:flex;flex-direction:column;align-items:flex-end;gap:10px";
// 	const BASE_NOTIFICATION_STYLES =
// 		"padding:12px 18px;border-radius:8px;color:white;min-width:250px;max-width:450px;pointer-events:auto;opacity:0;transform:translateX(100%);transition:opacity 0.2s ease-out,transform 0.2s ease-out;box-shadow:0 4px 12px rgba(0,0,0,0.15);display:flex;flex-direction:column;gap:4px;font-family:-apple-system,BlinkMacSystemFont,sans-serif";
// 	const TITLE_STYLES = "font-size:16px;font-weight:600";
// 	const MESSAGE_STYLES = "font-size:14px;white-space:pre-wrap;line-height:1.4";

// 	// Pre-defined color variants for instant lookup
// 	const COLORS = {
// 		success: "#16a34a",
// 		info: "#2563eb",
// 		error: "#dc2626",
// 		warning: "#f59e0b",
// 	} as const;

// 	// Get or create container (no external references)
// 	let container = document.getElementById("nepse-dadhboard-notifications");
// 	if (!container) {
// 		container = document.createElement("div");
// 		container.id = "nepse-dadhboard-notifications";
// 		container.style.cssText = CONTAINER_STYLES;
// 		document.body?.appendChild(container);
// 		if (!container.parentNode)
// 			return {
// 				success: false,
// 				message: "Failed to append notification container",
// 			};
// 	}

// 	// Single element creation with pre-built styles
// 	const notification = document.createElement("div");
// 	const bgColor = COLORS[data.level as keyof typeof COLORS] || COLORS.info;
// 	notification.style.cssText = `${BASE_NOTIFICATION_STYLES};background-color:${bgColor}`;

// 	// Optimized innerHTML construction - single operation
// 	notification.innerHTML = `<div style="${TITLE_STYLES}">Nepse Dashboard</div><div style="${MESSAGE_STYLES}">${data.message.replace(/[<>&"']/g, (c) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", '"': "&quot;", "'": "&#39;" })[c] || c)}</div>`;

// 	container.appendChild(notification);

// 	// Fix entry animation - need to trigger reflow before animating
// 	requestAnimationFrame(() => {
// 		// Force reflow to ensure initial styles are applied
// 		void notification.offsetHeight;
// 		notification.style.opacity = "1";
// 		notification.style.transform = "translateX(0)";
// 	});

// 	// Pre-allocated removal function
// 	const removeNotification = () => {
// 		notification.style.opacity = "0";
// 		notification.style.transform = "translateX(100%)";

// 		setTimeout(() => {
// 			if (notification.parentNode) notification.remove();
// 			if (container && !container.hasChildNodes()) {
// 				container.remove();
// 			}
// 		}, 200);
// 	};

// 	// Fastest auto-removal
// 	setTimeout(removeNotification, 3000);

// 	return { success: true, message: "Notification shown successfully" };
// }
