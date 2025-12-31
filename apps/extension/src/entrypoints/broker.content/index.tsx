import type { Root } from "react-dom/client";
import { createRoot } from "react-dom/client";
import {
	type ContentScriptContext,
	createShadowRootUi,
	defineContentScript,
} from "#imports";

import {
	chrome_meroshare_url,
	chrome_naasax_url,
	tms_watch_url,
} from "@/constants/content-url.ts";
import App from "@/entrypoints/broker.content/app";
import { registerGlobalErrorListeners } from "@/lib/listners/rejection-listner";

import { meroPattern, naasaPattern, tmsPattern } from "@/utils/match-pattern";
import "../../../../../packages/ui/src/styles/globals.css";
import "sonner/dist/styles.css";
import { ContentErrorBoundary } from "@/components/content-error-boundary";
import { ContentSuspense } from "@/components/content-suspense";

let mountedUi: Awaited<ReturnType<typeof createShadowRootUi>> | null = null;
let mountedElements: { root: Root; wrapper: HTMLElement } | null = null;

const ANIMATION_DURATION = 100;
const MAX_Z_INDEX = "2147483647";

const animationStyles = `
	@keyframes slideIn {
		from {
			opacity: 0;
			transform: translateY(-20px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	@keyframes slideOut {
		from {
			opacity: 1;
			transform: translateY(0);
		}
		to {
			opacity: 0;
			transform: translateY(-20px);
		}
	}
`;

function shouldMountUI(url: URL): boolean {
	return (
		tmsPattern.includes(url) ||
		(meroPattern.includes(url) && url.hash === "#/login") ||
		naasaPattern.includes(url)
	);
}

async function mountUI(ctx: ContentScriptContext) {
	mountedUi = await createShadowRootUi(ctx, {
		name: "nepse-dashboard-ui",
		position: "overlay",
		isolateEvents: ["keydown", "keyup", "keypress", "wheel"],
		inheritStyles: false,
		append: "last",
		onMount: (container) => {
			// Inject animation styles into shadow root
			const style = document.createElement("style");
			style.textContent = animationStyles;
			container.appendChild(style);

			// Create wrapper with animations and z-index
			const wrapper = document.createElement("div");
			wrapper.className = "nepse-dashboard-content";
			Object.assign(wrapper.style, {
				animation: `slideIn ${ANIMATION_DURATION}ms ease-out forwards`,
				zIndex: MAX_Z_INDEX,
				position: "fixed",
				top: "0",
				right: "0",
				left: "0",
			});
			container.append(wrapper);

			const root = createRoot(wrapper);
			root.render(
				<ContentErrorBoundary>
					<ContentSuspense>
						<App />
					</ContentSuspense>
				</ContentErrorBoundary>,
			);

			// Store elements for later access
			mountedElements = { root, wrapper };

			return { root, wrapper };
		},
		onRemove: (elements) => {
			// This will only be called if we don't manually clean up first
			elements?.root.unmount();
			elements?.wrapper.remove();
		},
	});

	mountedUi.mount();
}

async function unmountUI() {
	if (!mountedUi || !mountedElements) return;

	const { wrapper, root } = mountedElements;

	// Trigger exit animation
	wrapper.style.animation = `slideOut ${ANIMATION_DURATION}ms ease-in forwards`;

	// Wait for animation to complete
	await new Promise<void>((resolve) => {
		const onAnimationEnd = () => resolve();
		wrapper.addEventListener("animationend", onAnimationEnd, { once: true });
		// Fallback timeout
		setTimeout(resolve, ANIMATION_DURATION + 50);
	});

	// Clean up manually to prevent onRemove from interfering
	root.unmount();
	wrapper.remove();

	// Remove the UI container
	mountedUi.remove();
	mountedUi = null;
	mountedElements = null;
}

export default defineContentScript({
	matches: [tms_watch_url, chrome_meroshare_url, chrome_naasax_url],
	cssInjectionMode: "ui",
	registration: "manifest",
	runAt: "document_end",

	async main(ctx: ContentScriptContext) {
		const url = new URL(window.location.href);

		if (shouldMountUI(url)) {
			await mountUI(ctx);
		}

		ctx.addEventListener(window, "wxt:locationchange", async ({ newUrl }) => {
			if (shouldMountUI(newUrl)) {
				if (!mountedUi) {
					await mountUI(ctx);
				}
			} else {
				await unmountUI();
			}
		});

		registerGlobalErrorListeners("popup");
	},
});
