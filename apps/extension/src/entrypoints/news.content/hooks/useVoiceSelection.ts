import { useCallback, useEffect, useState } from "react";
import { useNewsState } from "../store";

type LanguageCode = "en" | "np";

function filterVoices(
	allVoices: SpeechSynthesisVoice[],
	language: LanguageCode,
) {
	if (language === "en") {
		return allVoices.filter((voice) => voice.lang.startsWith("en"));
	}

	return allVoices.filter(
		(voice) =>
			voice.lang.startsWith("ne") ||
			voice.lang.startsWith("hi") ||
			voice.lang === "ne-NP" ||
			voice.lang === "hi-IN",
	);
}

export function useVoiceSelection(language: LanguageCode) {
	const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
	const selectedVoice = useNewsState((state) => state.ttsVoice[language] || "");
	const setTtsVoice = useNewsState((state) => state.setTtsVoice);

	useEffect(() => {
		if (!window.speechSynthesis) return;

		const loadVoices = () => {
			const allVoices = window.speechSynthesis.getVoices();
			setVoices(filterVoices(allVoices, language));
		};

		loadVoices();

		if (speechSynthesis.onvoiceschanged !== undefined) {
			speechSynthesis.onvoiceschanged = loadVoices;
		}

		return () => {
			if (speechSynthesis.onvoiceschanged !== undefined) {
				speechSynthesis.onvoiceschanged = null;
			}
		};
	}, [language]);

	useEffect(() => {
		if (voices.length === 0) return;
		// If zustand has a saved voice for this language and it's valid, do nothing
		if (selectedVoice && voices.some((voice) => voice.name === selectedVoice)) {
			return;
		}
		// Otherwise, set to first available
		setTtsVoice(language, voices[0].name);
	}, [voices, language, selectedVoice, setTtsVoice]);

	const setVoiceName = useCallback(
		(voiceName: string) => {
			setTtsVoice(language, voiceName);
		},
		[language, setTtsVoice],
	);

	return {
		voices,
		selectedVoice,
		setVoiceName,
	};
}
