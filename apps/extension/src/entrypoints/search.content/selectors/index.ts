import type { SearchState } from "../store";

export function selectMessages(state: SearchState) {
	return state.messages;
}

export function selectChatId(state: SearchState) {
	return state.chatId;
}

export function selectSetChatId(state: SearchState) {
	return state.setChatId;
}

export function selectAddUser(state: SearchState) {
	return state.addUser;
}

export function selectAddAI(state: SearchState) {
	return state.addAI;
}

export function selectSettings(state: SearchState) {
	return state.showSettings;
}

export function selectClear(state: SearchState) {
	return state.clear;
}

export function selectIsGenerating(state: SearchState) {
	return state.isGenerating;
}

export function selectSetIsGenerating(state: SearchState) {
	return state.setIsGenerating;
}

export function selectQ(state: SearchState) {
	return state.q;
}

export function selectSetQ(state: SearchState) {
	return state.setQ;
}

export function selectSetCompanies(state: SearchState) {
	return state.setCompanies;
}

export function selectMode(state: SearchState) {
	return state.mode;
}

export function selectSetMode(state: SearchState) {
	return state.setMode;
}

export function selectContent(state: SearchState) {
	return state.content;
}

export function selectLocation(state: SearchState) {
	return state.location;
}

export function selectToggleNextMode(state: SearchState) {
	return state.toggleNextMode;
}

export function selectResults(state: SearchState) {
	return state.result;
}

export function selectSetError(state: SearchState) {
	return state.setError;
}

export function selectIsVisible(state: SearchState) {
	return state.isVisible;
}

export function selectIsDark(state: SearchState) {
	return state.isDark;
}

export function selectToggleShowSettings(state: SearchState) {
	return state.toggleSettings;
}

export function sendToWebsiteSelector(state: SearchState) {
	return state.sendParsedContent;
}
