import { isProduction } from "@/utils/is-production";

const ansi = {
	reset: "\x1B[0m",
	gray: "\x1B[90m",
	blue: "\x1B[34m",
	yellow: "\x1B[33m",
	red: "\x1B[31m",
};

const css = {
	gray: "color:#aaa",
	blue: "color:#2196f3",
	yellow: "color:#ffb300",
	red: "color:#f44336",
};

type Level = "log" | "info" | "warn" | "error";

function format(level: Level, msgs: unknown[]) {
	const prefix = "[dev-log]";
	const useAnsi = typeof window === "undefined";

	const color = {
		log: useAnsi ? ansi.gray : css.gray,
		info: useAnsi ? ansi.blue : css.blue,
		warn: useAnsi ? ansi.yellow : css.yellow,
		error: useAnsi ? ansi.red : css.red,
	}[level];

	if (useAnsi) {
		return [`${color}${prefix}${ansi.reset}`, ...msgs];
	}
	return [`%c${prefix}`, color, ...msgs];
}

export const logger = {
	log: (...m: unknown[]) => !isProduction && console.log(...format("log", m)),
	info: (...m: unknown[]) =>
		!isProduction && console.info(...format("info", m)),
	warn: (...m: unknown[]) =>
		!isProduction && console.warn(...format("warn", m)),
	error: (...m: unknown[]) =>
		!isProduction && console.error(...format("error", m)),
};
