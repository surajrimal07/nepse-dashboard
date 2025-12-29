import { Button } from "@nepse-dashboard/ui/components/button";
import { FileQuestion, X } from "lucide-react";
import { useState } from "react";

export function RequestNews() {
	const { callAction } = useAppState();

	const [state, setState] = useState({
		open: false,
		siteName: "",
		isSubmitting: false,
		response: null as { success: boolean; message: string } | null,
	});

	const handleClose = () =>
		setState({
			open: false,
			siteName: "",
			isSubmitting: false,
			response: null,
		});

	const handleSubmit = async () => {
		if (!state.siteName.trim() || state.isSubmitting) return;

		setState((prev) => ({ ...prev, isSubmitting: true, response: null }));

		try {
			const input = state.siteName.trim();
			let siteToSubmit = input;

			if (input.includes(".") || input.includes("/")) {
				const url = new URL(
					input.startsWith("http") ? input : `https://${input}`,
				);
				siteToSubmit = url.hostname;
			}

			const result = await callAction("requestNewsSite", siteToSubmit);

			setState((prev) => ({
				...prev,
				siteName: "",
				isSubmitting: false,
				response: result,
			}));
		} catch {
			setState((prev) => ({
				...prev,
				isSubmitting: false,
				response: {
					success: false,
					message: "Failed to submit request. Please try again.",
				},
			}));
		}
	};

	if (!state.open) {
		return (
			<Button
				size="sm"
				variant="ghost"
				className="h-7 w-7 p-0"
				title="Request news site"
				onClick={() => setState((prev) => ({ ...prev, open: true }))}
			>
				<FileQuestion className="h-3.5 w-3.5" />
			</Button>
		);
	}

	return (
		<>
			<Button
				size="sm"
				variant="ghost"
				className="h-7 w-7 p-0"
				title="Request news site"
				onClick={handleClose}
			>
				<FileQuestion className="h-3.5 w-3.5" />
			</Button>

			<div
				className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg shadow-xl w-80 flex flex-col"
				style={{ zIndex: 2147483647 }}
			>
				<div className="px-3 py-2 border-b border-gray-200 flex justify-between items-center">
					<h3 className="text-sm font-semibold text-gray-900">
						Request News Site
					</h3>
					<button
						onClick={handleClose}
						className="p-1 hover:bg-gray-100 rounded transition-colors"
						type="button"
					>
						<X className="w-4 h-4 text-gray-600" />
					</button>
				</div>

				<div className="p-3 space-y-3">
					<div>
						<label
							htmlFor="site-name"
							className="text-xs font-medium text-gray-700 block mb-1.5"
						>
							Site Name or URL
						</label>
						<input
							id="site-name"
							type="text"
							value={state.siteName}
							onChange={(e) =>
								setState((prev) => ({ ...prev, siteName: e.target.value }))
							}
							onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
							placeholder="e.g., example.com or Example News"
							className="w-full px-2.5 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
							disabled={state.isSubmitting}
						/>
					</div>

					{state.response && (
						<div
							className={`text-xs p-2 rounded ${
								state.response.success
									? "bg-green-50 text-green-800"
									: "bg-red-50 text-red-800"
							}`}
						>
							{state.response.message}
						</div>
					)}

					<div className="flex gap-2 justify-end">
						<Button
							size="sm"
							variant="outline"
							onClick={handleClose}
							disabled={state.isSubmitting}
							className="h-8 px-3 text-xs"
						>
							Cancel
						</Button>
						<Button
							size="sm"
							onClick={handleSubmit}
							disabled={state.isSubmitting || !state.siteName.trim()}
							className="h-8 px-3 text-xs"
						>
							{state.isSubmitting ? "Submitting..." : "Submit"}
						</Button>
					</div>
				</div>
			</div>

			<button
				type="button"
				className="fixed inset-0 bg-black/50 border-0 p-0 cursor-default"
				style={{ zIndex: 2147483646 }}
				onClick={handleClose}
				aria-label="Close dialog"
			/>
		</>
	);
}
