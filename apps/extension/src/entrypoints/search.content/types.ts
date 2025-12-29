import type { Doc } from "@nepse-dashboard/convex/convex/_generated/dataModel";

export interface SecurityData {
	_creationTime: number;
	_id: string;
	created_at: number;
	instrumentType: string;
	securityName: string;
	status: string;
	symbol: string;
	updated_at: number;
}

export interface CompaniesResponse {
	success: boolean;
	message?: string;
	data?: Doc<"company">[];
	error?: string;
}

export interface PreferencesResponse {
	success: boolean;
	data?: {
		chartSite?: string;
		customUrl?: string;
	};
	error?: string;
}
