/** biome-ignore-all lint/suspicious/noConsole: <known> */
import { writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { allCompanies } from "./stockMap";

// Get current directory for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

type StockInfo = {
	name: string;
	sector: string;
	internalSector: string;
};

const internalSectorMap: Record<string, string> = {
	"Commercial Banks": "Banking SubIndex",
	"Development Banks": "Development Bank Ind.",
	Finance: "Finance Index",
	"Hotels And Tourism": "Hotels And Tourism",
	"Hydro Power": "HydroPower Index",
	Investment: "Investment",
	"Life Insurance": "Life Insurance",
	"Manufacturing And Processing": "Manufacturing And Pr.",
	Microfinance: "Microfinance Index",
	"Mutual Fund": "Mutual Fund",
	NEPSE: "NEPSE Index",
	"Non Life Insurance": "Non Life Insurance",
	Others: "Others Index",
	Tradings: "Trading Index",
	"Promoter Share": "Promoter Share",
};

/**
 * Generates fresh stock map data from the NEPSE API and updates the stockMap.ts file
 * This function fetches security and sector data from the API and overwrites the stockMap.ts file
 */
async function generateSymbolMap(): Promise<Record<string, StockInfo>> {
	try {
		// Fetch security names
		const securityResponse = await fetch(
			"https://nepseapi.surajrimal.dev/SecurityList",
		);
		if (!securityResponse.ok) {
			throw new Error(`Security API error: ${securityResponse.status}`);
		}

		const securityData = await securityResponse.json();
		console.log("Security data fetched:", securityData.length, "items");

		// Fetch sector data
		const sectorResponse = await fetch(
			"https://nepseapi.surajrimal.dev/SectorScrips",
		);
		if (!sectorResponse.ok) {
			throw new Error(`Sector API error: ${sectorResponse.status}`);
		}

		const sectorData = await sectorResponse.json();
		console.log(
			"Sector data fetched:",
			Object.keys(sectorData).length,
			"sectors",
		);

		// Create reverse lookup for sectors
		const symbolSectorMap: Record<string, string> = {};
		for (const [sector, symbols] of Object.entries(sectorData)) {
			if (Array.isArray(symbols)) {
				for (const symbol of symbols) {
					symbolSectorMap[symbol] = sector;
				}
			}
		}

		const stockMap = securityData.reduce(
			(acc: Record<string, StockInfo>, item: Record<string, unknown>) => {
				if (item?.activeStatus === "A" && item?.symbol) {
					const sector = symbolSectorMap[item.symbol as string] || "Unknown";
					acc[item.symbol as string] = {
						name: (item.securityName as string) || (item.symbol as string),
						sector,
						internalSector: internalSectorMap[sector] || "Others Index",
					};
				}
				return acc;
			},
			{},
		);

		console.log("Stock map generated successfully");

		// Generate the new TypeScript file content
		const fileContent = `export const allCompanies = ${JSON.stringify(stockMap, null, 2)} as const;

export type StockInfo = {
  name: string;
  sector: string;
  internalSector: string;
};

export type AllCompanies = typeof allCompanies;
`;

		// Write to the stockMap.ts file
		const filePath = path.resolve(__dirname, "stockMap.ts");
		writeFileSync(filePath, fileContent, "utf-8");

		console.log("✅ Updated stockMap.ts file with new stock data");

		return stockMap;
	} catch (error) {
		console.error("Failed to generate stock map:", error);
		if (error instanceof SyntaxError) {
			console.error("JSON parsing error. Response data might be invalid");
		}
		throw error;
	}
}

function readStockMap(): Record<string, StockInfo> {
	return allCompanies;
}

export function getSecurityName(symbol: string): string {
	const stockMap = readStockMap();
	return stockMap[symbol]?.name || symbol;
}

export function getSecuritySector(symbol: string): string {
	const stockMap = readStockMap();
	return stockMap[symbol]?.sector || "Unknown";
}

export function getSecurityInternalSector(symbol: string): string {
	const stockMap = readStockMap();
	return stockMap[symbol]?.internalSector || "Others Index";
}

export function isStockValid(symbol: string): boolean {
	if (!symbol || symbol.length === 0) {
		return false;
	}
	const stockMap = readStockMap();
	return !!stockMap[symbol];
}

export const SymbolMapper = new Proxy(
	{},
	{
		get: (_, symbol: string) => getSecurityName(symbol),
	},
);

export const SectorMapper = new Proxy(
	{},
	{
		get: (_, symbol: string) => getSecuritySector(symbol),
	},
);

export const InternalSectorMapper = new Proxy(
	{},
	{
		get: (_, symbol: string) => getSecurityInternalSector(symbol),
	},
);

// Export function to generate fresh stock map data
export const generateStockMap = generateSymbolMap;

// Run once to generate initial map
// generateSymbolMap();
