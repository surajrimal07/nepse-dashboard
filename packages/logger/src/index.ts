export const logger = {
	info(message: string, meta?: unknown) {
		meta
			? console.log("[INFO]", message, meta)
			: console.log("[INFO]", message);
	},

	warn(message: string, meta?: unknown) {
		meta
			? console.warn("[WARN]", message, meta)
			: console.warn("[WARN]", message);
	},

	error(message: string, meta?: unknown) {
		meta
			? console.error("[ERROR]", message, meta)
			: console.error("[ERROR]", message);
	},
};
