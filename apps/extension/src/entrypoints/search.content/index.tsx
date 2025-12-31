import { createRoot } from "react-dom/client";
import {
	type ContentScriptContext,
	createShadowRootUi,
	defineContentScript,
} from "#imports";
import { ContentErrorBoundary } from "@/components/content-error-boundary";
import { ContentSuspense } from "@/components/content-suspense";
import { analyzeDocument } from "@/utils/content/analyze";
import { onMessage } from "../../lib/messaging/extension-messaging";
import { injectNotification, showNotification } from "./notification";
import Search from "./search";
import { searchState } from "./store";
import "../../../../../packages/ui/src/styles/globals.css";

export default defineContentScript({
	matches: ["*://*/*"],
	cssInjectionMode: "ui",
	registration: "manifest",

	async main(ctx: ContentScriptContext) {
		let wrapper: HTMLDivElement | null = null;

		const classList = document.documentElement.classList;
		searchState.setState({
			isDark: classList.contains("dark") || classList.contains("theme-dark"),
		});

		const ui = await createShadowRootUi(ctx, {
			name: "nepse-dashbboard-search-ui",
			position: "overlay",
			inheritStyles: false,
			append: "last",
			onMount: (container) => {
				wrapper = document.createElement("div");
				wrapper.className = "nepse-dashboard-search-content";
				wrapper.style.display = "none";
				container.appendChild(wrapper);

				const root = createRoot(wrapper);
				root.render(
					<ContentErrorBoundary>
						<ContentSuspense>
							<Search onClose={TriggerVisibility} onEsc={hideVisibility} />
						</ContentSuspense>
					</ContentErrorBoundary>,
				);

				return { root, wrapper };
			},
			onRemove: (elements) => {
				elements?.root.unmount();
				elements?.wrapper.remove();
			},
		});

		injectNotification();

		function setWrapperVisible(visible: boolean) {
			if (!wrapper) return;
			wrapper.style.display = visible ? "block" : "none";
			searchState.setState({ isVisible: visible });
			if (!visible) searchState.getState().closeSettings();
		}

		function TriggerVisibility() {
			const isVisible = !searchState.getState().isVisible;
			setWrapperVisible(isVisible);
		}

		// Hide overlay
		function hideVisibility() {
			setWrapperVisible(false);
		}

		onMessage("showNotification", ({ data }) => {
			const body = data.body;
			const title = data.title;
			const variant = data.variant || "info";
			const icon = data.icon;

			if (!data.title || !data.body) return;
			showNotification(title, body, variant, icon);
		});

		onMessage("getWebsiteContent", () => {
			searchState.getState().sendParsedContent();
		});

		window.addEventListener("keydown", (e) => {
			const target = e.target as HTMLElement;

			if (
				target &&
				(target.tagName === "INPUT" ||
					target.tagName === "TEXTAREA" ||
					target.isContentEditable)
			) {
				return;
			}

			if (e.altKey && !e.ctrlKey && e.key.toLowerCase() === "x") {
				e.preventDefault();
				TriggerVisibility();
			}
		});

		ctx.addEventListener(window, "wxt:locationchange", async () => {
			updateAnalyzedContent();
		});

		function updateAnalyzedContent() {
			const parsedContent = analyzeDocument();
			searchState.setState({ content: parsedContent });
		}

		function initializeContent() {
			const state = searchState.getState();
			state.initialize();
			updateAnalyzedContent();
		}

		ctx.addEventListener(window, "wxt:locationchange", ({ newUrl }) => {
			searchState.setState({ location: newUrl });
			initializeContent();
		});

		// Initial setup
		initializeContent();

		ui.mount();
	},
});
