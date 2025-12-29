import { api } from "@nepse-dashboard/convex/convex/_generated/api";
import { parse } from "csv-parse/sync";
import { convex } from "@/convex-client";

type DpRow = {
	Name: string;
	Services?: string;
	Phone?: string;
	Email?: string;
	Address?: string;
	Website?: string;
	"Contact Person Name"?: string;
	"Contact Person Phone"?: string;
	"Contact Person Email"?: string;
	"Licence End Date"?: string;
};

type DpData = {
	dpid: number;
	name: string;
	address: string;
	phone: string | string[];
	email?: string | string[];
};

// Helpers
const clean = (v?: string) => (v?.trim() ? v.trim() : undefined);

// Parse phone/email string into array or single value
const parseMulti = (v?: string) => {
	if (!v) return undefined;
	const parts = v
		.split(/[;,/]+/) // split on common separators
		.map((p) => p.trim())
		.filter(Boolean);
	return parts.length === 1 ? parts[0] : parts;
};

// Extract DPID (use first number in name if exists, fallback to index+1)
const extractDpid = (name: string, fallback: number) => {
	const match = name.match(/\b\d+\b/);
	return match ? Number(match[0]) : fallback;
};

export async function UpdateDP(): Promise<void> {
	const res = await fetch(
		"https://sebon.gov.np/intermediaries/depository-participants?skey=&e=1",
	);
	if (!res.ok) throw new Error("Failed to fetch CSV");

	const csvText = await res.text();

	const records = parse(csvText, {
		columns: true,
		skip_empty_lines: true,
		trim: true,
	}) as DpRow[];

	const dps: DpData[] = records
		.filter((r) => r.Name) // skip empty
		.map((r, i) => {
			const dpid = extractDpid(r.Name, i + 1);
			return {
				dpid,
				name: clean(r.Name)!,
				address: clean(r.Address) ?? "Nepal",
				phone: parseMulti(r.Phone),
				email: parseMulti(r.Email),
			};
		});

	await convex.mutation(api.brokers.insertDP, { dps });
}
