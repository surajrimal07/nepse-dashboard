import { X } from "lucide-react";
import { useCallback, useState } from "react";
import { DEFAULT_CHART_SITES } from "@/constants/app-config";
import { useAppState } from "@/hooks/use-app";
import { cn } from "@/lib/utils";
import {
	CUSTOM_URL_HELP_TEXT,
	ERROR_INVALID_URL,
	isValidUrl,
	PLACEHOLDER_CUSTOM_URL,
} from "../utils";

interface SettingsDropdownProps {
	onClose: () => void;
}

export default function SettingsDropdown({ onClose }: SettingsDropdownProps) {
	const [showCustomUrlInput, setShowCustomUrlInput] = useState(false);
	const [tempCustomUrl, setTempCustomUrl] = useState<string>("");
	const [error, setError] = useState<string | null>(null);

	const { useStateItem } = useAppState();
	const [chartPrefs, setChartPrefs] = useStateItem("chartConfig");
	const [aiMode, setAiMode] = useStateItem("aiMode");

	const handleChartSiteChange = useCallback(
		(siteId: string) => {
			setShowCustomUrlInput(false);
			setError(null);
			setChartPrefs({ chartSite: siteId, customUrl: undefined });
		},
		[setChartPrefs],
	);

	const handleShowCustomInput = useCallback(() => {
		setShowCustomUrlInput(true);
		setTempCustomUrl(chartPrefs.customUrl || "");
		setError(null);
	}, [chartPrefs.customUrl]);

	const handleChartCustomUrlChange = useCallback(
		(customUrl: string) => {
			const urlToUse = customUrl?.trim();

			if (!urlToUse) {
				setError("Please provide a custom URL before saving custom option");
				return;
			}

			if (!isValidUrl(urlToUse)) {
				setError(ERROR_INVALID_URL);
				return;
			}

			setChartPrefs({ chartSite: "custom", customUrl: urlToUse });
			setError(null);
			setShowCustomUrlInput(false);
		},
		[setChartPrefs],
	);

	const handleAiModeToggle = useCallback(() => {
		setAiMode(!aiMode);
	}, [aiMode, setAiMode]);

	return (
		<div className="h-full flex flex-col rounded-xl border text-sm bg-slate-900 border-slate-800 text-slate-100">
			<div className="flex items-center justify-between px-3 py-2 border-b border-slate-800">
				<h3 className="text-sm font-semibold">Settings</h3>
				<button
					type="button"
					onClick={onClose}
					className="p-1 rounded-md transition-colors hover:bg-accent text-slate-400"
					aria-label="Close settings"
				>
					<X size={16} />
				</button>
			</div>

			<div className="flex-1 overflow-y-auto p-3 space-y-4">
				<div>
					<h4 className="text-xs font-semibold mb-2">Default Chart Site</h4>
					<div className="space-y-1">
						{DEFAULT_CHART_SITES.map((site) => (
							<button
								key={site.id}
								type="button"
								onClick={() => handleChartSiteChange(site.id)}
								className={cn(
									"w-full text-left px-3 py-2 rounded-md transition-colors",
									chartPrefs.chartSite === site.id
										? "bg-slate-700 text-slate-100"
										: "text-slate-300 hover:bg-slate-800",
								)}
							>
								{site.name}
							</button>
						))}

						<button
							type="button"
							onClick={handleShowCustomInput}
							className={cn(
								"w-full text-left px-3 py-2 rounded-md transition-colors flex flex-col items-start",
								chartPrefs.chartSite === "custom"
									? "bg-slate-700 text-slate-100"
									: "text-slate-300 hover:bg-slate-800",
							)}
						>
							<span>Custom</span>
							{chartPrefs.customUrl && (
								<span className="text-xs mt-0.5 truncate w-full text-slate-400">
									{chartPrefs.customUrl}
								</span>
							)}
						</button>
					</div>
				</div>

				{showCustomUrlInput && (
					<div className="p-3 rounded-lg border border-slate-700 bg-slate-800/50">
						<label
							htmlFor="custom-chart-url"
							className="text-xs font-semibold block mb-2"
						>
							Custom Chart URL
						</label>
						<input
							id="custom-chart-url"
							type="text"
							value={tempCustomUrl}
							onChange={(e) => setTempCustomUrl(e.target.value)}
							placeholder={PLACEHOLDER_CUSTOM_URL}
							className="w-full px-3 py-2 text-sm rounded-md border focus:outline-none focus:ring-1 transition-all bg-slate-900 border-slate-700 text-slate-100 placeholder-slate-500 focus:ring-slate-600"
						/>
						{error && (
							<span className="text-xs mt-1.5 block text-red-400">
								{error}
							</span>
						)}
						<span className="text-xs mt-1.5 block text-slate-400">
							{CUSTOM_URL_HELP_TEXT}
						</span>
						<button
							type="button"
							onClick={() => handleChartCustomUrlChange(tempCustomUrl)}
							disabled={!tempCustomUrl?.trim()}
							className={cn(
								"w-full mt-3 px-3 py-2 text-sm font-medium rounded-md transition-colors",
								"bg-slate-700 text-slate-100 hover:bg-slate-600",
								!tempCustomUrl?.trim() && "opacity-50 cursor-not-allowed",
							)}
						>
							Save Custom URL
						</button>
					</div>
				)}

				<div>
					<h4 className="text-xs font-semibold mb-2">AI Mode</h4>
					<div className="flex items-center justify-between">
						<span className="text-xs">
							Enable or disable AI-powered features.
						</span>
						<button
							type="button"
							role="switch"
							aria-checked={aiMode}
							aria-label="Toggle AI Mode"
							onClick={handleAiModeToggle}
							className={cn(
								"relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none",
								aiMode ? "bg-blue-600" : "bg-slate-700",
							)}
						>
							<span
								className={cn(
									"inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform",
									aiMode ? "translate-x-5" : "translate-x-1",
								)}
							/>
						</button>
					</div>
				</div>
			</div>
		</div>
	);
}
