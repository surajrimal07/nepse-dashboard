import { useCallback, useEffect, useRef, useState } from "react";
import { track } from "@/lib/analytics";
import { Env, EventName } from "@/types/analytics-types";
import { useNewsState } from "../store";

interface UseWebSpeechOptions {
	text: string;
	language: "en" | "np";
}

interface UseWebSpeechReturn {
	isSpeaking: boolean;
	isAvailable: boolean;
	speak: () => void;
	stop: () => void;
}

export function useWebSpeech({
	text,
	language,
}: UseWebSpeechOptions): UseWebSpeechReturn {
	const selectedVoiceName = useNewsState((state) => state.ttsVoice[language]);
	const [isSpeaking, setIsSpeaking] = useState(false);
	const [isAvailable, setIsAvailable] = useState<boolean | null>(null);
	const textRef = useRef(text);
	const cancelingRef = useRef(false);

	// Update text ref whenever text changes
	useEffect(() => {
		textRef.current = text;
	}, [text]);

	// Check if the required voice is available
	useEffect(() => {
		if (!window.speechSynthesis) {
			setIsAvailable(false);
			return;
		}

		const checkVoiceAvailability = () => {
			const voices = window.speechSynthesis.getVoices();

			// Don't update availability if voices haven't loaded yet
			if (voices.length === 0) return;

			let hasVoice = false;

			if (language === "en") {
				hasVoice = voices.some(
					(voice) => voice.lang === "en-US" || voice.lang.startsWith("en"),
				);
			} else {
				// For Nepali, try native Nepali first, fallback to Hindi
				hasVoice = voices.some(
					(voice) =>
						voice.lang === "ne-NP" ||
						voice.lang === "ne" ||
						voice.lang.startsWith("ne") ||
						voice.lang === "hi-IN" ||
						voice.lang.startsWith("hi"),
				);
			}

			setIsAvailable(hasVoice);
		};

		// Voices might load asynchronously
		checkVoiceAvailability();

		const handleVoicesChanged = () => checkVoiceAvailability();

		if (speechSynthesis.onvoiceschanged !== undefined) {
			speechSynthesis.onvoiceschanged = handleVoicesChanged;
		}

		return () => {
			if (speechSynthesis.onvoiceschanged !== undefined) {
				speechSynthesis.onvoiceschanged = null;
			}
		};
	}, [language]);

	const speak = useCallback(() => {
		if (!window.speechSynthesis || isAvailable === false) {
			return;
		}

		// Reset cancel flag and stop any ongoing speech
		cancelingRef.current = false;
		window.speechSynthesis.cancel();

		const utterance = new SpeechSynthesisUtterance(textRef.current);

		// Get available voices
		const voices = window.speechSynthesis.getVoices();

		let selectedVoice: SpeechSynthesisVoice | undefined;

		if (selectedVoiceName) {
			selectedVoice = voices.find((voice) => voice.name === selectedVoiceName);
		}

		// If no saved voice or saved voice not found, use default selection
		if (!selectedVoice) {
			if (language === "en") {
				// Prioritize Google voices with "Google" in name, prefer en-GB (UK English Female)
				selectedVoice =
					voices.find(
						(voice) =>
							voice.lang === "en-GB" &&
							voice.name.toLowerCase().includes("google") &&
							voice.name.toLowerCase().includes("female"),
					) ||
					voices.find(
						(voice) =>
							voice.lang === "en-GB" &&
							voice.name.toLowerCase().includes("google"),
					) ||
					voices.find((voice) => voice.lang === "en-GB") ||
					voices.find(
						(voice) =>
							voice.name.toLowerCase().includes("google") &&
							voice.lang.startsWith("en"),
					) ||
					voices.find((voice) => voice.lang === "en-US") ||
					voices.find((voice) => voice.lang.startsWith("en"));
			} else {
				// For Nepali: try native Nepali first, fallback to Hindi
				selectedVoice =
					voices.find((voice) => voice.lang === "ne-NP") ||
					voices.find((voice) => voice.lang === "ne") ||
					voices.find((voice) => voice.lang.startsWith("ne")) ||
					voices.find((voice) => voice.lang === "hi-IN") ||
					voices.find((voice) => voice.lang.startsWith("hi"));
			}
		}

		if (selectedVoice) {
			utterance.voice = selectedVoice;
			utterance.lang = selectedVoice.lang;
		} else {
			utterance.lang = language === "en" ? "en-US" : "ne-NP";
		}

		// Event handlers
		utterance.onstart = () => {
			cancelingRef.current = false;
			setIsSpeaking(true);
		};

		utterance.onend = () => {
			cancelingRef.current = false;
			setIsSpeaking(false);

			track({
				context: Env.CONTENT,
				eventName: EventName.NEWS_VOICE_PLAYED,
				params: { language, selectedVoiceName },
			});
		};

		utterance.onerror = (event) => {
			if (cancelingRef.current && event.error === "interrupted") {
				cancelingRef.current = false;
				setIsSpeaking(false);
				return;
			}

			track({
				context: Env.CONTENT,
				eventName: EventName.NEWS_VOICE_ERROR,
				params: {
					error: `SpeechSynthesis error: ${event.error}`,
					function: "useWebSpeech.speak",
				},
			});

			setIsSpeaking(false);
		};

		window.speechSynthesis.speak(utterance);
	}, [language, isAvailable, selectedVoiceName]);

	const stop = useCallback(() => {
		if (window.speechSynthesis) {
			cancelingRef.current = true;
			window.speechSynthesis.cancel();
			setIsSpeaking(false);
		}
	}, []);

	// Cleanup on unmount
	useEffect(() => {
		return () => {
			if (window.speechSynthesis) {
				window.speechSynthesis.cancel();
			}
		};
	}, []);

	return {
		isSpeaking,
		isAvailable: isAvailable ?? true,
		speak,
		stop,
	};
}
