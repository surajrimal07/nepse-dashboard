import type { FC } from "react";
import { memo, useMemo } from "react";
import { browser } from "#imports";
import { URLS } from "@/constants/app-urls";

export const BrowserInfo: FC = memo(() => {
	const defaultImage = browser.runtime.getURL("/icons/48.png");

	const browserType = useMemo(() => {
		if (import.meta.env.FIREFOX) return "firefox";
		if (import.meta.env.EDGE) return "edge";
		if (import.meta.env.CHROME) return "chrome";
		return "chrome"; // Default to Chrome if none of the flags are set
	}, []);

	const instructions = useMemo(
		() => ({
			chrome: (
				<div className="space-y-1">
					<div className="flex items-center gap-2">
						<span className="text-xs font-medium text-indigo-300 shrink-0">
							1.
						</span>
						<div className="flex flex-wrap items-center gap-1 text-xs">
							<span>Click the puzzle icon</span>
							<img
								src={`${URLS.cdn_url}/chrome1.png`}
								alt="puzzle icon"
								className="w-7 h-7 inline-block shrink-0"
							/>
							<span>in the toolbar</span>
						</div>
					</div>
					<div className="flex items-center gap-2">
						<span className="text-xs font-medium text-indigo-300 shrink-0">
							2.
						</span>
						<div className="flex flex-wrap items-center gap-1 text-xs">
							<span>Click the pin icon</span>
							<img
								src={`${URLS.cdn_url}/chrome2.png`}
								alt="pin icon"
								className="w-7 h-7 inline-block shrink-0"
							/>
							<span>next to</span>
							<img
								src={defaultImage}
								alt="extension icon"
								className="w-5 h-5 inline-block shrink-0"
							/>
						</div>
					</div>
				</div>
			),
			firefox: (
				<div className="space-y-2">
					<div className="flex items-center gap-2">
						<span className="text-xs font-medium text-indigo-300 shrink-0">
							1.
						</span>
						<div className="flex flex-wrap items-center gap-1 text-xs">
							<span>Click the extensions button</span>
							<span className="inline-block w-3 h-3 bg-gray-500 rounded shrink-0"></span>
							<span>in the toolbar</span>
						</div>
					</div>
					<div className="flex items-center gap-2">
						<span className="text-xs font-medium text-indigo-300 shrink-0">
							2.
						</span>
						<div className="flex flex-wrap items-center gap-1 text-xs">
							<span>
								Click the settings icon and select &quot;Pin to Toolbar&quot;
								for
							</span>
							<img
								src={defaultImage}
								alt="extension icon"
								className="w-5 h-5 inline-block shrink-0"
							/>
						</div>
					</div>
				</div>
			),
			edge: (
				<div className="space-y-2">
					<div className="flex items-center gap-2">
						<span className="text-xs font-medium text-indigo-300 shrink-0">
							1.
						</span>
						<div className="flex flex-wrap items-center gap-1 text-xs">
							<span>Click on Edge menu</span>
							<img
								src={`${URLS.cdn_url}/edge1.png`}
								alt="edge menu icon"
								className="w-5 h-5 inline-block shrink-0"
							/>
						</div>
					</div>
					<div className="flex items-center gap-2">
						<span className="text-xs font-medium text-indigo-300 shrink-0">
							2.
						</span>
						<div className="flex flex-wrap items-center gap-1 text-xs">
							<span>Click on Extensions</span>
							<img
								src={`${URLS.cdn_url}/edge2.png`}
								alt="extensions menu icon"
								className="w-5 h-5 inline-block shrink-0"
							/>
							<span>in the dropdown</span>
						</div>
					</div>
					<div className="flex items-center gap-2">
						<span className="text-xs font-medium text-indigo-300 shrink-0">
							3.
						</span>
						<div className="flex flex-wrap items-center gap-1 text-xs">
							<span>Click the pin icon</span>
							<img
								src={`${URLS.cdn_url}/edge3.png`}
								alt="pin icon"
								className="w-5 h-5 inline-block shrink-0"
							/>
							<span>next to</span>
							<img
								src={defaultImage}
								alt="extension icon"
								className="w-5 h-5 inline-block shrink-0"
							/>
						</div>
					</div>
				</div>
			),
		}),
		[],
	);

	const currentInstructions = useMemo(
		() => instructions[browserType as keyof typeof instructions],
		[instructions, browserType],
	);

	return (
		<div className="flex gap-2">
			<div className="flex-1">{currentInstructions}</div>
		</div>
	);
});

BrowserInfo.displayName = "BrowserInfo";
