import { Github, Send } from "lucide-react";
import { memo } from "react";
import { URLS } from "@/constants/app-urls";

const Footer = memo(() => {
	const { callAction } = useAppState();

	const handleJoinTelegram = useCallback(async () => {
		await callAction("handleJoinTelegram").then(handleActionResult);
	}, [callAction]);

	const handlePrivacyPolicy = useCallback(async () => {
		await callAction("handlePrivacyPolicy").then(handleActionResult);
	}, [callAction]);

	const handleTermsOfService = useCallback(async () => {
		await callAction("handleTermsOfService").then(handleActionResult);
	}, [callAction]);

	const handleReview = useCallback(async () => {
		await callAction("handleReview").then(handleActionResult);
	}, [callAction]);

	return (
		<footer className="border-t text-center text-sm text-muted-foreground space-y-2 mt-6 pt-4 pb-4">
			{/** biome-ignore lint/a11y/useKeyWithClickEvents: <iknow> */}
			<p
				onClick={handleReview}
				className="cursor-pointer hover:text-foreground transition-colors"
			>
				NEPSE Dashboard v{getVersion()} &#8212; Click to leave a review!
			</p>

			<div className="flex items-center justify-center gap-4">
				<button
					type="button"
					onClick={handlePrivacyPolicy}
					className="text-muted-foreground hover:text-foreground transition-colors"
				>
					Privacy Policy
				</button>

				<button
					type="button"
					onClick={handleTermsOfService}
					className="text-muted-foreground hover:text-foreground transition-colors"
				>
					Terms of Service
				</button>

				<a
					href={URLS.github_url}
					target="_blank"
					rel="noopener noreferrer"
					className="text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
				>
					<Github className="h-4 w-4" />
				</a>

				<button
					type="button"
					onClick={handleJoinTelegram}
					className="text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
				>
					<Send className="h-4 w-4" />
				</button>
			</div>
		</footer>
	);
});

Footer.displayName = "Footer";

export default Footer;
