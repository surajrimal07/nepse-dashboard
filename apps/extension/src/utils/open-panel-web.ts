// import { OpenPanel } from "@openpanel/web";
// import { currentEnvironment, isProduction } from "@/utils/is-production";
// import { getVersion } from "@/utils/version";

// export const OpenPanelWeb = new OpenPanel({
// 	apiUrl: import.meta.env.VITE_OPENPANEL_URL,
// 	clientId: isProduction
// 		? import.meta.env.VITE_OPENPANEL_ID
// 		: import.meta.env.VITE_OPENPANEL_ID_DEV,
// 	clientSecret: isProduction
// 		? import.meta.env.VITE_OPENPANEL_SECRET
// 		: import.meta.env.VITE_OPENPANEL_SECRET_DEV,
// 	trackScreenViews: false,
// 	trackOutgoingLinks: true,
// 	trackAttributes: true,
// });

// OpenPanelWeb.setGlobalProperties({
// 	app_version: getVersion(),
// 	environment: currentEnvironment,
// });

// OpenPanelWeb.screenView();