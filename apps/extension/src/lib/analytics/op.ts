import { OpenPanel } from "@openpanel/sdk";
import { currentEnvironment, isProduction } from "@/utils/is-production";
import { getVersion } from "@/utils/version";

export const OP = new OpenPanel({
	apiUrl: import.meta.env.VITE_OPENPANEL_URL,
	clientId: isProduction
		? import.meta.env.VITE_OPENPANEL_ID
		: import.meta.env.VITE_OPENPANEL_ID_DEV,
	clientSecret: isProduction
		? import.meta.env.VITE_OPENPANEL_SECRET
		: import.meta.env.VITE_OPENPANEL_SECRET_DEV,
});

OP.setGlobalProperties({
	app_version: getVersion(),
	environment: currentEnvironment,
});
