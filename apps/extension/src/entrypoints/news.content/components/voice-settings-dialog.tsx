import { Button } from "@nepse-dashboard/ui/components/button";
import { Settings, X } from "lucide-react";
import { useCallback, useRef, useState } from "react";

interface VoiceSettingsDialogProps {
	voices: SpeechSynthesisVoice[];
	selectedVoice: string;
	onSelectVoice: (voiceName: string) => void;
}

export function VoiceSettingsDialog({
	voices,
	selectedVoice,
	onSelectVoice,
}: VoiceSettingsDialogProps) {
	const [open, setOpen] = useState(false);
	const dialogRef = useRef<HTMLDivElement>(null);

	const handleClose = useCallback(() => setOpen(false), []);
	const handleToggle = useCallback(() => setOpen((prev) => !prev), []);

	return (
		<div className="relative">
			<Button
				size="sm"
				variant="ghost"
				className="h-7 w-7 p-0"
				title="Voice settings"
				onClick={handleToggle}
			>
				<Settings className="h-3.5 w-3.5" />
			</Button>

			{open && (
				<div
					ref={dialogRef}
					className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg shadow-xl w-72 max-h-96 flex flex-col"
					style={{ zIndex: 2147483647 }}
				>
					<div className="px-2 py-1 border-b border-gray-200 flex justify-between items-center">
						<h3 className="text-sm font-semibold text-gray-900">
							Voice Settings
						</h3>
						<button
							onClick={handleClose}
							className="p-1 hover:bg-gray-100 rounded transition-colors"
							type="button"
						>
							<X className="w-4 h-4 text-gray-600" />
						</button>
					</div>

					<div className="p-1 flex-1 overflow-hidden">
						<div className="text-xs font-medium mb-2 text-gray-900">
							Selected Voice: {selectedVoice}
						</div>
						<div className="max-h-52 overflow-y-auto border border-gray-200 rounded p-1 space-y-0.5">
							{voices.length === 0 ? (
								<p className="text-xs text-gray-400 p-2">No voices available</p>
							) : (
								voices.map((voice) => (
									<Button
										key={voice.name}
										className="flex items-center justify-between gap-2 p-1.5 rounded hover:bg-gray-100 cursor-pointer transition-colors w-full text-left border-0 bg-transparent"
										onClick={() => {
											onSelectVoice(voice.name);
											setOpen(false);
										}}
									>
										<div className="flex items-center gap-2">
											<span className="text-xs text-gray-900">
												{voice.name}
											</span>
										</div>
									</Button>
								))
							)}
						</div>
					</div>
				</div>
			)}

			{open && (
				<button
					type="button"
					className="fixed inset-0 bg-black/50 border-0 p-0 cursor-default"
					style={{ zIndex: 2147483646 }}
					onClick={handleClose}
					aria-label="Close dialog"
				/>
			)}
		</div>
	);
}
