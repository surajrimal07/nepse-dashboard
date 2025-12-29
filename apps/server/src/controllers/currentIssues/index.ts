import { api } from "@nepse-dashboard/convex/convex/_generated/api";
import { logger } from "@nepse-dashboard/logger";
import { load } from "cheerio";
import { convex } from "@/convex-client";
import {
	type AllIssues,
	allIssuesArraySchema,
	type CDSTableRow,
	CDSTableRowSchema,
} from "./schema";

export async function currentIssues(): Promise<void> {
	// 1. Fetch the HTML
	const response = await fetch("https://cdsc.com.np/ipolist");
	const html = await response.text();

	// 2. Load HTML with Cheerio
	const $ = load(html);

	// 3. Select table rows
	const rows: CDSTableRow[] = [];

	$("#book-closure tbody tr").each((_, tr) => {
		const tds = $(tr).find("td");

		const rowData = {
			sn: Number($(tds[0]).text().trim()),
			companyName: $(tds[1]).text().trim(),
			issueManager: $(tds[2]).text().trim(),
			issuedUnit: $(tds[3]).text().trim(),
			numberOfApplication: $(tds[4]).text().trim(),
			appliedUnit: $(tds[5]).text().trim(),
			amount: $(tds[6]).text().trim(),
			openDate: $(tds[7]).text().trim(),
			closeDate: $(tds[8]).text().trim(),
			lastUpdate: $(tds[9]).text().trim(),
		};

		// 4. Validate with Zod
		const parsed = CDSTableRowSchema.safeParse(rowData);
		if (parsed.success) {
			rows.push(parsed.data);
		} else {
			logger.warn("Invalid row skipped:", parsed.error);
		}
	});

	if (rows.length === 0) {
		logger.info("No valid IPO rows found to add.");
		return;
	}

	await convex.mutation(api.ipo.addCurrentIPOs, {
		data: rows,
	});
}

export async function fetchIPOs(): Promise<void> {
	try {
		const nowInEpoch = Date.now();

		const response = await fetch(
			`https://www.nepalipaisa.com/api/GetIpos?stockSymbol=&pageNo=1&itemsPerPage=50&pagePerDisplay=5&_=${nowInEpoch}`,
		);
		const data = await response.json();

		// Validate data existence
		if (!data?.result?.data || data.result.data.length === 0) {
			logger.warn("No IPO data available");
			return;
		}

		// Map raw data to match schema shape
		const mappedData = data.result.data.map((raw: any) => ({
			companyName: raw.companyName,
			shareType: raw.shareType,
			pricePerUnit: raw.pricePerUnit,
			units: raw.units,
			openingDateAD: raw.openingDateAD,
			openingDateBS: raw.openingDateBS,
			closingDateAD: raw.closingDateAD,
			closingDateBS: raw.closingDateBS,
			closingDateClosingTime: raw.closingDateClosingTime,
			status: raw.status,
			shareRegistrar: raw.shareRegistrar,
			stockSymbol: raw.stockSymbol,
		}));

		// Validate the entire array at once
		const ipoList: AllIssues[] = allIssuesArraySchema.parse(mappedData);

		if (ipoList.length === 0) {
			logger.info("No valid IPOs found after validation");
			return;
		}

		await convex.mutation(api.ipo.addAllIPOs, {
			data: ipoList,
		});
	} catch (err) {
		console.error("Failed to fetch IPOs:", err);
	}
}
