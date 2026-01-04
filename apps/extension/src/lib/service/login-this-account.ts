import { AccountType, type accountType } from "@/types/account-types";

type LoginConfig = {
	tabUrlPattern: (broker?: number) => string;
	loginUrl: (broker?: number) => string;
	logoutMessage: string;
	requiresBroker: boolean;
};

export const LOGIN_CONFIG: Record<accountType, LoginConfig> = {
	[AccountType.TMS]: {
		tabUrlPattern: (broker) =>
			`https://tms${String(broker).padStart(2, "0")}.nepsetms.com.np/*`,
		loginUrl: (broker) =>
			`https://tms${String(broker).padStart(2, "0")}.nepsetms.com.np/login`,
		logoutMessage: "handleTMSAccountLogout",
		requiresBroker: true,
	},

	[AccountType.MEROSHARE]: {
		tabUrlPattern: () => `https://meroshare.cdsc.com.np/*`,
		loginUrl: () => `https://meroshare.cdsc.com.np/#/login`,
		logoutMessage: "handleMeroshareAccountLogout",
		requiresBroker: false,
	},

	[AccountType.NAASAX]: {
		tabUrlPattern: () => `https://auth.naasasecurities.com.np/*`,
		loginUrl: () => `https://auth.naasasecurities.com.np`,
		logoutMessage: "handleNaasaxAccountLogout",
		requiresBroker: false,
	},
};
