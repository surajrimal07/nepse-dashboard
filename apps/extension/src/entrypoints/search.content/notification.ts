import { track } from "@/lib/analytics";
import { Env, EventName } from "@/types/analytics-types";

const defaultImage = browser.runtime.getURL("/icons/48.png");

const CONTAINER_ID = "nepse-dashboard-notifications-container";

const COLORS = {
	success: "#16a34a",
	info: "#2563eb",
	error: "#dc2626",
	warning: "#f59e0b",
} as const;

export function injectNotification() {
	if (!document.getElementById(CONTAINER_ID)) {
		const container = document.createElement("div");
		container.id = CONTAINER_ID;
		container.style.cssText =
			"position:fixed;bottom:20px;right:20px;z-index:2147483647;pointer-events:none;display:flex;flex-direction:column;align-items:flex-end;gap:10px";
		document.body.appendChild(container);
	}
}

export function showNotification(
	title: string,
	body: string,
	variant: "success" | "info" | "error" | "warning" = "info",
	icon?: string | null,
) {
	const container = document.getElementById(CONTAINER_ID);
	if (!container) {
		track({
			context: Env.CONTENT,
			eventName: EventName.NOTIFICATION_ERROR,
			params: {
				error: "notification_container_not_found",
				function: "showNotification",
			},
		});
		return;
	}

	const notification = document.createElement("div");
	notification.style.cssText = `
    padding:12px 18px;
    border-radius:8px;
    color:white;
    min-width:250px;
    max-width:450px;
    pointer-events:auto;
    opacity:0;
    transform:translateX(100%);
    transition:opacity 0.2s ease-out,transform 0.2s ease-out;
    box-shadow:0 4px 12px rgba(0,0,0,0.15);
    display:flex;
    flex-direction:row;
    align-items:center;
    gap:10px;
    font-family:-apple-system,BlinkMacSystemFont,sans-serif;
    background-color:${COLORS[variant]};
  `;

	notification.innerHTML = `
    <img src="${icon || defaultImage}" style="width:32px;height:32px;border-radius:50%;object-fit:cover"/>
    <div style="display:flex;flex-direction:column;gap:2px">
      <div style="font-size:16px;font-weight:600">${title}</div>
      <div style="font-size:14px;line-height:1.4;white-space:pre-wrap">${body}</div>
    </div>
  `;

	container.appendChild(notification);

	requestAnimationFrame(() => {
		void notification.offsetHeight;
		notification.style.opacity = "1";
		notification.style.transform = "translateX(0)";
	});

	setTimeout(() => {
		notification.style.opacity = "0";
		notification.style.transform = "translateX(100%)";
		setTimeout(() => notification.remove(), 200);
	}, 3000);
}
