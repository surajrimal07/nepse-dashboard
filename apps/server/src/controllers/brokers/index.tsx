import { api } from "@nepse-dashboard/convex/convex/_generated/api";
import { parse } from "csv-parse/sync";
import { convex } from "@/convex-client";

type BrokerRow = {
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

type BrokerData = {
	broker_name: string;
	broker_number: number;
	broker_address: string;
	broker_phone?: string;
	broker_email?: string;
	broker_website?: string;
	tms_link?: string;
};

const clean = (v?: string) => (v?.trim().length ? v.trim() : undefined);

const extractBrokerNumber = (name: string, fallback: number) => {
	const match = name.match(/\b\d+\b/);
	return match ? Number(match[0]) : fallback;
};

export async function updateBrokers() {
	const res = await fetch(
		"https://sebon.gov.np/intermediaries/stock-brokers?skey=&e=1",
	);

	if (!res.ok) {
		throw new Error("Failed to fetch broker CSV");
	}

	const csvText = await res.text();

	const records = parse(csvText, {
		columns: true,
		skip_empty_lines: true,
		trim: true,
	}) as BrokerRow[];

	const brokers: BrokerData[] = records
		.filter((r) => r.Name)
		.map((r, i) => {
			const broker_number = extractBrokerNumber(r.Name, i + 1);
			return {
				broker_name: clean(r.Name)!,
				broker_number,
				broker_address: clean(r.Address) ?? "Nepal",
				broker_phone: clean(r.Phone),
				broker_email: clean(r.Email),
				broker_website: clean(r.Website),
				tms_link: r.Website?.includes("tms") ? r.Website : undefined,
			};
		});

	await convex.mutation(api.brokers.insertBrokers, { brokers });
}
