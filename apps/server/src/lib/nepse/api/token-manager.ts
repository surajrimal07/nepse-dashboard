/** biome-ignore-all lint/suspicious/noConsole: <iknow> */
import API_ENDPOINTS from "./API_ENDPOINTS.json" with { type: "json" };
import { BASE_URL } from "./constants";
import { createNepseError } from "./error";
import { createNepseHeaders } from "./headers";
import type { MarketStatus } from "./marketStatus";
import type { Prove } from "./prove";
import type { SecurityBrief } from "./securityBrief";

export class TokenManager {
	private static instance: TokenManager;
	private static wasm_instantiated = false;
	private accessToken: string | null = null;
	private refreshToken: string | null = null;
	private tokenTimestamp: number | null = null;
	private proveObject: Prove | null = null;
	private marketStatus: MarketStatus | null = null;
	private readonly MAX_TOKEN_AGE = 45_000; // 45 seconds in milliseconds
	private isUpdating = false;
	private updatePromise: Promise<void> | null = null;
	private security_brief_cache: SecurityBrief[] = [];
	private security_symbol_id_keymap: Record<string, number> | null = null;

	// WASM related properties
	private static cdx: CallableFunction | null = null;
	private static rdx: CallableFunction | null = null;
	private static bdx: CallableFunction | null = null;
	private static ndx: CallableFunction | null = null;
	private static mdx: CallableFunction | null = null;

	private constructor() {}

	//call this method before using the token manager
	static async initializeWasm(): Promise<void> {
		if (TokenManager.wasm_instantiated) {
			return; // WASM is already instantiated
		}

		const response = await fetch(`${BASE_URL}${API_ENDPOINTS.wasm_url}`, {
			tls: { rejectUnauthorized: false },
		});

		if (!response.ok) {
			throw createNepseError("Failed to fetch WASM file");
		}

		const wasm = await response.arrayBuffer().then((buffer) => {
			return WebAssembly.instantiate(buffer);
		});

		TokenManager.cdx = wasm.instance.exports.cdx as CallableFunction;
		TokenManager.rdx = wasm.instance.exports.rdx as CallableFunction;
		TokenManager.bdx = wasm.instance.exports.bdx as CallableFunction;
		TokenManager.ndx = wasm.instance.exports.ndx as CallableFunction;
		TokenManager.mdx = wasm.instance.exports.mdx as CallableFunction;
		TokenManager.wasm_instantiated = true;
	}

	static async getInstance(): Promise<TokenManager> {
		if (!TokenManager.wasm_instantiated) {
			await TokenManager.initializeWasm();
		}

		if (!TokenManager.instance) {
			TokenManager.instance = new TokenManager();
		}
		return TokenManager.instance;
	}

	private async updateToken(): Promise<void> {
		try {
			if (this.refreshToken && !this.isTokenValid()) {
				await this.refreshAccessToken();
			} else {
				this.proveObject = await this.get_raw_access_object();
				if (!this.proveObject) {
					throw createNepseError("Prove object is null or undefined");
				}

				this.accessToken = this.get_valid_token();
				this.tokenTimestamp = Date.now();

				this.marketStatus = await this.fetchMarketStatus();
			}
		} catch (error) {
			this.accessToken = null;
			this.tokenTimestamp = null;
			this.marketStatus = null;
			throw error;
		} finally {
			this.isUpdating = false;
			this.updatePromise = null;
		}
	}

	private async refreshAccessToken(): Promise<void> {
		const response = await fetch(`${BASE_URL}${API_ENDPOINTS.refresh_url}`, {
			method: "POST",
			// biome-ignore lint/style/noNonNullAssertion: <ikmow>
			headers: createNepseHeaders(this.accessToken!),
			body: JSON.stringify({ refreshToken: this.refreshToken }),
		});

		if (!response.ok) {
			throw createNepseError("Failed to refresh access token");
		}

		const data = await response.json();
		this.accessToken = data.accessToken;
		this.refreshToken = data.refreshToken;
		this.tokenTimestamp = Date.now();
	}

	get_valid_token(): string {
		if (!TokenManager.wasm_instantiated) {
			throw createNepseError(
				"please call instantiate method before doing anything",
			);
		}

		if (!this.proveObject) {
			throw createNepseError("Prove object is not initialized");
		}

		const { accessToken, salt1, salt2, salt3, salt4, salt5 } = this.proveObject;
		const cdx = TokenManager.cdx?.(salt1, salt2, salt3, salt4, salt5);
		const rdx = TokenManager.rdx?.(salt1, salt2, salt4, salt3, salt5);
		const bdx = TokenManager.bdx?.(salt1, salt2, salt4, salt3, salt5);
		const ndx = TokenManager.ndx?.(salt1, salt2, salt4, salt3, salt5);
		const mdx = TokenManager.mdx?.(salt1, salt2, salt4, salt3, salt5);

		return (
			accessToken.slice(0, cdx) +
			accessToken.slice(cdx + 1, rdx) +
			accessToken.slice(rdx + 1, bdx) +
			accessToken.slice(bdx + 1, ndx) +
			accessToken.slice(ndx + 1, mdx) +
			accessToken.slice(mdx + 1)
		).trim();
	}

	get_valid_body_id() {
		const dummyData = [
			147, 117, 239, 143, 157, 312, 161, 612, 512, 804, 411, 527, 170, 511, 421,
			667, 764, 621, 301, 106, 133, 793, 411, 511, 312, 423, 344, 346, 653, 758,
			342, 222, 236, 811, 711, 611, 122, 447, 128, 199, 183, 135, 489, 703, 800,
			745, 152, 863, 134, 211, 142, 564, 375, 793, 212, 153, 138, 153, 648, 611,
			151, 649, 318, 143, 117, 756, 119, 141, 717, 113, 112, 146, 162, 660, 693,
			261, 362, 354, 251, 641, 157, 178, 631, 192, 734, 445, 192, 883, 187, 122,
			591, 731, 852, 384, 565, 596, 451, 772, 624, 691,
		];
		const currentDate = new Date();
		const datePart = currentDate.getDate();

		if (!this.marketStatus) {
			throw createNepseError("Market id is not set");
		}

		const id =
			dummyData[this.marketStatus.id] + this.marketStatus.id + 2 * datePart;
		return id;
	}

	getPOSTPayloadID(): number {
		if (!this.proveObject) {
			throw createNepseError("Prove object or market status not available");
		}
		const e = this.get_valid_body_id();
		const currentDay = new Date().getDate();
		const saltIndex = e % 10 < 5 ? 3 : 1;

		const salts = [
			this.proveObject.salt1,
			this.proveObject.salt2,
			this.proveObject.salt3,
			this.proveObject.salt4,
			this.proveObject.salt5,
		];

		const finalId = e + salts[saltIndex] * currentDay - salts[saltIndex - 1];
		return finalId;
	}

	getPOSTPayloadIDForFloorSheet(): number {
		if (!this.proveObject) {
			throw createNepseError("Prove object or market status not available");
		}
		const e = this.get_valid_body_id();
		const currentDay = new Date().getDate();
		const saltIndex = e % 10 < 4 ? 1 : 3;

		const salts = [
			this.proveObject.salt1,
			this.proveObject.salt2,
			this.proveObject.salt3,
			this.proveObject.salt4,
			this.proveObject.salt5,
		];

		const finalId = e + salts[saltIndex] * currentDay - salts[saltIndex - 1];
		return finalId;
	}

	private async get_raw_access_object(): Promise<Prove | null> {
		const proveResponse: Prove | null = await fetch(
			`${BASE_URL}${API_ENDPOINTS.prove_url}`,
			{
				headers: {
					"User-Agent": "Mozilla/5.0",
					Referer: `${BASE_URL}`,
				},
				method: "GET",
			},
		)
			.then((response) => {
				return response.json() as Promise<Prove>;
			})
			.then((data: Prove) => data)
			.catch(() => {
				return null;
			});
		return proveResponse;
	}

	private async fetchMarketStatus(): Promise<MarketStatus> {
		const response = await fetch(`${BASE_URL}${API_ENDPOINTS.nepse_open_url}`, {
			// biome-ignore lint/style/noNonNullAssertion: <iknow>
			headers: createNepseHeaders(this.accessToken!),
			method: "GET",
		});

		if (!response.ok) {
			throw createNepseError("Failed to fetch market status");
		}

		return response.json() as Promise<MarketStatus>;
	}

	private isTokenValid(): boolean {
		if (!(this.tokenTimestamp && this.accessToken)) {
			return false;
		}
		return Date.now() - this.tokenTimestamp < this.MAX_TOKEN_AGE;
	}

	async getAccessToken(): Promise<string> {
		if (this.isTokenValid()) {
			// biome-ignore lint/style/noNonNullAssertion: <iknow>
			return this.accessToken!;
		}

		if (!this.isUpdating) {
			this.isUpdating = true;
			this.updatePromise = this.updateToken();
		}

		await this.updatePromise;

		if (!this.accessToken) {
			throw createNepseError("Failed to get access token");
		}

		return this.accessToken;
	}

	getProveObject(): Prove | null {
		return this.proveObject;
	}

	async get_security_briefs(): Promise<SecurityBrief[]> {
		const token = await this.getAccessToken();
		const securityBriefDetails = await fetch(
			`${BASE_URL}${API_ENDPOINTS.security_list_url}`,
			{
				headers: {
					"User-Agent": "Mozilla/5.0",
					Referer: `${BASE_URL}`,
					Authorization: `Salter ${token}`,
				},
				method: "GET",
			},
		)
			.then((response) => response.json() as Promise<SecurityBrief[]>)
			.then((data: SecurityBrief[]) => data)
			.catch((err) => {
				console.error(err);
				return [] as SecurityBrief[];
			});
		return securityBriefDetails;
	}

	getSalts(): number[] | null {
		if (!this.proveObject) {
			return null;
		}
		return [
			this.proveObject.salt1,
			this.proveObject.salt2,
			this.proveObject.salt3,
			this.proveObject.salt4,
			this.proveObject.salt5,
		];
	}

	getMarketId(): number | null {
		return this.marketStatus?.id ?? null;
	}

	async getSecurityBrief(): Promise<SecurityBrief[]> {
		if (this.security_brief_cache.length === 0) {
			this.security_brief_cache = await this.get_security_briefs();
		}

		return this.security_brief_cache;
	}

	async getSecuritySymbolIdMap(): Promise<Record<string, number>> {
		if (this.security_symbol_id_keymap === null) {
			const securities = await this.getSecurityBrief();
			this.security_symbol_id_keymap = securities.reduce(
				(map, security) => {
					map[security.symbol] = security.id;
					return map;
				},
				{} as Record<string, number>,
			);
		}

		return this.security_symbol_id_keymap;
	}

	getMarketStatus(): MarketStatus | null {
		return this.marketStatus;
	}
}

export const tokenManager = TokenManager.getInstance();
