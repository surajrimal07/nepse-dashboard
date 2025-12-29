export interface NepseItem {
	iconUrl: string;
	symbol: string;
	securityName: string;
}

export interface ApiResponse {
	success: boolean;
	data: NepseItem[];
}
