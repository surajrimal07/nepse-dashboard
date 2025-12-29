import type { IndexKeys } from "./indexes-type";

export interface Config {
	indexCharts: IndexKeys[];
	stockCharts: string[];
	marketDepth: string[];
}

export interface User {
	readonly randomId: string;
	email: string | null;
	image: string | null;
}

export type UserFields = Omit<User, "randomId">;
