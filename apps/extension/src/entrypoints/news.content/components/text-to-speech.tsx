import { Button } from "@nepse-dashboard/ui/components/button";
import { AlertTriangle, Volume2, VolumeX } from "lucide-react";
import { useVoiceSelection } from "../hooks/useVoiceSelection";
import { useWebSpeech } from "../hooks/useWebSpeech";
import { VoiceSettingsDialog } from "./voice-settings-dialog";

interface TextToSpeechProps {
	text: string;
	language: "en" | "np";
	notifyNotAvailable: () => void;
}

export function TextToSpeech({
	text,
	language,
	notifyNotAvailable,
}: TextToSpeechProps) {
	const { isSpeaking, isAvailable, speak, stop } = useWebSpeech({
		text,
		language,
	});
	const { voices, selectedVoice, setVoiceName } = useVoiceSelection(language);

	const handleSpeak = () => {
		if (isSpeaking) {
			stop();
		} else {
			speak();
		}
	};

	// If voice is not available, show warning icon
	if (!isAvailable) {
		return (
			<div className="flex items-center gap-1">
				<Button
					size="sm"
					variant="ghost"
					className="h-7 w-7 p-0 cursor-help"
					onClick={notifyNotAvailable}
				>
					<AlertTriangle className="h-3.5 w-3.5 text-red-600" />
				</Button>
			</div>
		);
	}

	return (
		<div className="flex items-center gap-1">
			<Button
				size="sm"
				variant="ghost"
				onClick={handleSpeak}
				className="h-7 w-7 p-0"
				title={isSpeaking ? "Stop reading" : "Read aloud"}
			>
				{isSpeaking ? (
					<VolumeX className="h-3.5 w-3.5" />
				) : (
					<Volume2 className="h-3.5 w-3.5" />
				)}
			</Button>
			<VoiceSettingsDialog
				voices={voices}
				selectedVoice={selectedVoice}
				onSelectVoice={setVoiceName}
			/>
		</div>
	);
}
