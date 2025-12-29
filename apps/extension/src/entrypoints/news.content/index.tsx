import { createRoot, type Root } from "react-dom/client";
import type { ContentScriptContext } from "#imports";
import "../../../../../packages/ui/src/styles/globals.css";

import {
	ARTHASANSAR_NEWS,
	ARTHASAROKAR_NEWS,
	MEROLAGANI_NEWS,
	SHARESANSAR_NEWS,
} from "@/constants/content-url";
import { analyzeDocument } from "@/utils/content/analyze";
import App from "./app";
import { newsState } from "./store";

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

let mountedUi: Awaited<ReturnType<typeof createShadowRootUi>> | null = null;
let mountedElements: { root: Root; wrapper: HTMLDivElement } | null = null;

export default defineContentScript({
	matches: [
		MEROLAGANI_NEWS,
		SHARESANSAR_NEWS,
		ARTHASANSAR_NEWS,
		ARTHASAROKAR_NEWS,
	],
	cssInjectionMode: "ui",
	registration: "manifest",
	runAt: "document_end",

	async main(ctx: ContentScriptContext) {
		mountedUi = await createShadowRootUi(ctx, {
			name: "nepse-news-ui",
			position: "overlay",
			inheritStyles: false,
			append: "last",
			onMount: (container) => {
				// Inject animation styles into shadow root
				const style = document.createElement("style");
				style.textContent = animationStyles;
				container.appendChild(style);

				// Create wrapper with animations and z-index
				const wrapper = document.createElement("div");
				wrapper.className = "nepse-news-content";
				Object.assign(wrapper.style, {
					display: "block",
					animation: `slideIn ${ANIMATION_DURATION}ms ease-out forwards`,
					zIndex: MAX_Z_INDEX,
					position: "fixed",
					top: "0",
					right: "0",
					left: "0",
					// Adjust bottom or width as needed
				});
				container.appendChild(wrapper);

				const root = createRoot(wrapper);
				root.render(
					<ContentErrorBoundary>
						<ContentSuspense>
							<App onClose={TriggerVisiblity} />
						</ContentSuspense>
					</ContentErrorBoundary>,
				);

				// Store elements for later access
				mountedElements = { root, wrapper };

				return { root, wrapper };
			},
			onRemove: (elements) => {
				elements?.root.unmount();
				elements?.wrapper.remove();
			},
		});

		async function TriggerVisiblity() {
			if (!mountedElements?.wrapper) return;

			const { wrapper } = mountedElements;
			const isVisible = wrapper.style.display === "none";

			if (isVisible) {
				// Show with animation
				wrapper.style.display = "block";
				wrapper.style.animation = `slideIn ${ANIMATION_DURATION}ms ease-out forwards`;
			} else {
				// // Hide with animation
				wrapper.style.animation = `slideOut ${ANIMATION_DURATION}ms ease-in forwards`;

				// Wait for animation to complete before hiding
				await new Promise<void>((resolve) => {
					const onAnimationEnd = () => resolve();
					wrapper.addEventListener("animationend", onAnimationEnd, {
						once: true,
					});
					setTimeout(resolve, ANIMATION_DURATION + 50);
				});

				wrapper.style.display = "none";
			}
		}

		async function updateAnalyzedContent() {
			const url = window.location.href;
			const state = newsState.getState();

			if (await state.checkCache(url)) {
				await state.getFeedback();
				return;
			}

			const parsedContent = analyzeDocument();
			newsState.setState({
				content: {
					content: parsedContent.content,
					title: parsedContent.title,
					lang: parsedContent.lang,
				},
			});

			await state.generate(url);
			await state.getFeedback();
		}

		mountedUi.mount();

		await updateAnalyzedContent();
	},
});
