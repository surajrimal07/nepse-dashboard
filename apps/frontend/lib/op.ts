import { OpenPanel } from "@openpanel/nextjs";

const isProduction = process.env.NODE_ENV === "production";

export const op = new OpenPanel({
	apiUrl: process.env.OPENPANEL_URL,
	clientId: isProduction
		? process.env.NEXT_OPENPANEL_ID
		: process.env.NEXT_OPENPANEL_ID_DEV,
	clientSecret: isProduction
		? process.env.NEXT_OPENPANEL_SECRET
		: process.env.NEXT_OPENPANEL_SECRET_DEV,
});
