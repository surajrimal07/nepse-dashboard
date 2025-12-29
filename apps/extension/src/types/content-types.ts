export enum ResultTypes {
	Success = 0,
	LowConfidence = 1,
	InvalidLength = 2,
}

export interface SolveResult {
	type: ResultTypes;
	value?: string;
}

export interface KindEntry {
	write_name: string;
	data_path: string;
}

// meroshare enums
export enum FormSelectors {
	FORM = 'form[name="loginForm"]',
	USERNAME = 'input[name="username"]',
	PASSWORD = 'input[name="password"]',
	DP_SELECT = 'select[name="dp"]',
	DP_OPTIONS = 'select[name="dp"] option',
	LOGIN_BUTTON = 'button[type="submit"]',
	SELECT2_CONTAINER = ".select2-container",
	SELECT2_DROPDOWN = ".select2-dropdown",
	SELECT2_SELECTION = ".select2-selection",
	SELECT2_RESULTS = ".select2-results__options",
}

export interface Config {
	readonly MAX_RETRIES: number;
	readonly RETRY_DELAY: number;
	readonly INITIAL_DELAY: number;
	readonly SELECTORS: typeof FormSelectors;
}

export interface AngularComponent {
	writeValue: (value: unknown) => void;
	onChange: (value: unknown) => void;
}

export const CONFIG: Readonly<Config> = {
	MAX_RETRIES: 5,
	RETRY_DELAY: 100,
	INITIAL_DELAY: 300,
	SELECTORS: FormSelectors,
};

export const MEROSHAREDASHBOARD_PATTERN = /#\/dashboard/;
export const MEROSHARE_LOGIN_URL = "meroshare.cdsc.com.np/#/login" as const;
export const TMS_DASHBOARD_PATTERN = /\/tms\//;

export interface WindowWithLibraries extends Window {
	jQuery?: (selector: string | HTMLElement) => {
		data: (key: string) => Select2Instance | undefined;
		on: (event: string, handler: (e: Select2Event) => void) => void;
		off: (event: string, handler: (e: Select2Event) => void) => void;
		length: number;
	};
	ng?: {
		probe: (element: Element) => {
			componentInstance?: {
				writeValue: (value: string) => void;
				onChange: (value: string) => void;
			};
		} | null;
	};
}

export interface Select2Event {
	params?: {
		data?: {
			text?: string;
			id?: string;
		};
	};
}

export interface Select2Instance {
	trigger: (
		event: string,
		data: { data: { id: string; text: string } },
	) => void;
}
