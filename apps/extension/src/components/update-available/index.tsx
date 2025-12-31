import { api } from "@nepse-dashboard/convex/convex/_generated/api";
import { useQuery } from "convex/react";
import type { FC } from "react";
import { memo, useCallback, useMemo } from "react";
import { useGetVersion } from "@/hooks/convex/useGetVersion";
import { useAppState } from "@/hooks/use-app";
import { getVersion } from "@/utils/version";

export const UpdateAvailable: FC = memo(() => {
	const { callAction } = useAppState();

	const currentVersion = useMemo(() => getVersion(), []);

	const version = useQuery(api.version.getLastVersion);

	const { data: latestVersion, isPending, error } = useGetVersion();

	const handleUpdate = useCallback(() => {
		callAction("handleInstallUpdate");
	}, [callAction]);

	if (isPending || error) {
		return null;
	}

	if (latestVersion?.version === currentVersion) {
		return null;
	}

	return (
		<div className="fixed inset-0 bg-black/20 flex items-center justify-center z-1000">
			<div className="bg-white border border-gray-300 rounded-lg p-4 w-[320px] max-w-[90vw] shadow-xl text-sm mx-4">
				<div className="mb-3 font-semibold text-gray-900">Update Available</div>

				<div className="mb-3 text-xs space-y-1">
					<div className="text-gray-600">Current: v{currentVersion}</div>
					<div className="text-blue-600 font-medium">
						New: v{version?.version}
					</div>
				</div>

				{version?.changelogs && (
					<div className="mb-4 p-2 bg-gray-50 rounded text-xs text-gray-600 max-h-20 overflow-y-auto border">
						<div className="font-medium mb-1 text-gray-800">
							What&apos;s new:
						</div>
						<div className="whitespace-pre-wrap leading-relaxed">
							{version.changelogs}
						</div>
					</div>
				)}

				<div className="mb-4 text-gray-600 leading-relaxed text-xs">
					Update now to get the latest features and improvements.
				</div>

				<div className="flex gap-2 justify-end">
					{/** biome-ignore lint/a11y/useButtonType: <i know> */}
					<button
						onClick={handleUpdate}
						className="px-4 py-2 rounded bg-blue-600 text-white text-xs hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-200"
					>
						Update
					</button>
				</div>
			</div>
		</div>
	);
});

UpdateAvailable.displayName = "UpdateAvailable";
