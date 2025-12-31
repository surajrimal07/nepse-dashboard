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
	isDark: boolean;
	onClose: () => void;
}

export default function SettingsDropdown({
	isDark,
	onClose,
}: SettingsDropdownProps) {
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
		<div
			className={cn(
				"h-full flex flex-col rounded-xl border text-sm",
				isDark
					? "bg-slate-900 border-slate-800 text-slate-100"
					: "bg-white border-slate-200 text-slate-900",
			)}
		>
			<div
				className={cn(
					"flex items-center justify-between px-3 py-2 border-b",
					isDark ? "border-slate-800" : "border-slate-200",
				)}
			>
				<h3 className="text-sm font-semibold">Settings</h3>
				<button
					type="button"
					onClick={onClose}
					className={cn(
						"p-1 rounded-md transition-colors hover:bg-accent",
						isDark ? "text-slate-400" : "text-slate-500",
					)}
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
										? isDark
											? "bg-slate-700 text-slate-100"
											: "bg-slate-100 text-slate-900"
										: isDark
											? "text-slate-300 hover:bg-slate-800"
											: "text-slate-700 hover:bg-slate-50",
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
									? isDark
										? "bg-slate-700 text-slate-100"
										: "bg-slate-100 text-slate-900"
									: isDark
										? "text-slate-300 hover:bg-slate-800"
										: "text-slate-700 hover:bg-slate-50",
							)}
						>
							<span>Custom</span>
							{chartPrefs.customUrl && (
								<span
									className={cn(
										"text-xs mt-0.5 truncate w-full",
										isDark ? "text-slate-400" : "text-slate-500",
									)}
								>
									{chartPrefs.customUrl}
								</span>
							)}
						</button>
					</div>
				</div>

				{showCustomUrlInput && (
					<div
						className={cn(
							"p-3 rounded-lg border",
							isDark
								? "border-slate-700 bg-slate-800/50"
								: "border-slate-200 bg-slate-50",
						)}
					>
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
							className={cn(
								"w-full px-3 py-2 text-sm rounded-md border focus:outline-none focus:ring-1 transition-all",
								isDark
									? "bg-slate-900 border-slate-700 text-slate-100 placeholder-slate-500 focus:ring-slate-600"
									: "bg-white border-slate-300 text-slate-900 placeholder-slate-400 focus:ring-slate-400",
							)}
						/>
						{error && (
							<span
								className={cn(
									"text-xs mt-1.5 block",
									isDark ? "text-red-400" : "text-red-600",
								)}
							>
								{error}
							</span>
						)}
						<span
							className={cn(
								"text-xs mt-1.5 block",
								isDark ? "text-slate-400" : "text-slate-500",
							)}
						>
							{CUSTOM_URL_HELP_TEXT}
						</span>
						<button
							type="button"
							onClick={() => handleChartCustomUrlChange(tempCustomUrl)}
							disabled={!tempCustomUrl?.trim()}
							className={cn(
								"w-full mt-3 px-3 py-2 text-sm font-medium rounded-md transition-colors",
								isDark
									? "bg-slate-700 text-slate-100 hover:bg-slate-600"
									: "bg-slate-900 text-white hover:bg-slate-800",
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
								aiMode
									? isDark
										? "bg-blue-600"
										: "bg-blue-500"
									: isDark
										? "bg-slate-700"
										: "bg-slate-300",
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
