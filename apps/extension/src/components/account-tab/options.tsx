import { Button } from "@nepse-dashboard/ui/components/button";
import { Label } from "@nepse-dashboard/ui/components/label";
import { Switch } from "@nepse-dashboard/ui/components/switch";
import { X } from "lucide-react";
import { memo, useCallback } from "react";
import { handleActionResult } from "@/hooks/handle-action";
import useScreenView from "@/hooks/usePageView";

interface OptionsDialogProps {
	onOpenChange: () => void;
}

const OptionsDialog = memo(({ onOpenChange }: OptionsDialogProps) => {
	useScreenView("/account-options");
	const { useStateItem, callAction } = useAppState();

	const [autofills] = useStateItem("autofills");

	const [autoSaveNewAccount, setAutoSaveNewAccountState] =
		useStateItem("autoSaveNewAccount");
	const [portfolioSyncEnabled, setPortfolioSyncEnabledState] =
		useStateItem("syncPortfolio");

	const handleClose = useCallback(() => {
		onOpenChange();
	}, [onOpenChange]);

	const handleBackdropClick = useCallback(
		(e: React.MouseEvent<HTMLDivElement>) => {
			if (e.target === e.currentTarget) {
				handleClose();
			}
		},
		[handleClose],
	);

	return (
		// biome-ignore lint/a11y/useKeyWithClickEvents: <ignore>
		<div
			className="fixed inset-0  flex items-center justify-center bg-black bg-opacity-50 z-50"
			onClick={handleBackdropClick}
			role="dialog"
			aria-modal="true"
			tabIndex={-1}
		>
			<div className="relative bg-zinc-900 rounded-lg shadow-xl border border-zinc-700 w-full max-w-md mx-4">
				<div className="flex items-center justify-between p-4 border-b border-zinc-700">
					<h2 className="text-lg font-semibold text-white">Account Options</h2>
					<Button
						variant="ghost"
						size="icon"
						className="h-8 w-8 text-zinc-400 hover:text-white"
						onClick={handleClose}
					>
						<X className="h-4 w-4" />
					</Button>
				</div>

				<div className="p-4 space-y-6">
					<div className="flex items-center justify-between">
						<Label
							htmlFor="tms-autofill"
							className="text-sm font-medium text-white"
						>
							TMS Autofill
						</Label>
						<Switch
							id="tms-autofill"
							checked={autofills?.tms ?? true}
							onCheckedChange={(value) =>
								callAction("setAutofill", "tms", value).then(handleActionResult)
							}
						/>
					</div>{" "}
					<div className="flex items-center justify-between">
						<Label
							htmlFor="naasax-autofill"
							className="text-sm font-medium text-white"
						>
							NaasaX Autofill
						</Label>
						<Switch
							id="naasax-autofill"
							checked={autofills?.naasax ?? true}
							onCheckedChange={(value) =>
								callAction("setAutofill", "naasax", value).then(
									handleActionResult,
								)
							}
						/>
					</div>{" "}
					<div className="flex items-center justify-between">
						<Label
							htmlFor="mero-autofill"
							className="text-sm font-medium text-white"
						>
							Meroshare Autofill
						</Label>
						<Switch
							id="mero-autofill"
							checked={autofills?.meroshare ?? true}
							onCheckedChange={(value) =>
								callAction("setAutofill", "meroshare", value).then(
									handleActionResult,
								)
							}
						/>
					</div>{" "}
					<div className="flex items-center justify-between">
						<Label
							htmlFor="auto-save"
							className="text-sm font-medium text-white"
						>
							Auto Save New Account
						</Label>
						<Switch
							id="auto-save"
							checked={autoSaveNewAccount}
							onCheckedChange={setAutoSaveNewAccountState}
						/>
					</div>
					<div className="flex items-center justify-between">
						<Label
							htmlFor="portfolio-sync"
							className="text-sm font-medium text-white"
						>
							Portfolio Sync
						</Label>
						<Switch
							id="portfolio-sync"
							checked={portfolioSyncEnabled}
							onCheckedChange={setPortfolioSyncEnabledState}
						/>
					</div>
				</div>
			</div>
		</div>
	);
});

export default OptionsDialog;
