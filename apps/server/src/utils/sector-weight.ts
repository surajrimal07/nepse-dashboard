/** biome-ignore-all lint/suspicious/noConsole: <known> */
import { writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { type Company, companies } from './companies';
import { weights } from './sectorWeight';
import { SectorMapper } from './stock-mapper';

// Get current directory for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface CompanyData {
  symbol: string;
  company: string;
  ltp: number;
  shareOutstanding: number;
  floatedShares: number;
  marketCap: number;
  floatedMarketCap: number;
  impactInNepse: number;
  avgVolume: number;
}

const percentSpaceRegex = / %/;

function parseCompanyData(): CompanyData[] {
  return companies.map((company: Company) => ({
    symbol: company.Symbol,
    company: company.Company,
    ltp: company.LTP,
    shareOutstanding: company['Share Outstanding'],
    floatedShares: company['Floated Shares'],
    marketCap: company['Market Cap (NPR)'],
    floatedMarketCap: company['Floated Market Cap'],
    impactInNepse:
      typeof company['Impact In NEPSE'] === 'string'
        ? Number.parseFloat(
            company['Impact In NEPSE'].replace(percentSpaceRegex, '')
          )
        : company['Impact In NEPSE'],
    avgVolume: company['50D Avg Volume'],
  }));
}

function calculateSectorWeights(): Record<string, number> {
  const companiesData = parseCompanyData();
  const sectorWeights: Record<string, number> = {};

  for (const company of companiesData) {
    const sector = SectorMapper[
      company.symbol as keyof typeof SectorMapper
    ] as string;
    if (sector && sector !== 'Unknown') {
      if (!sectorWeights[sector]) {
        sectorWeights[sector] = 0;
      }
      sectorWeights[sector] += company.impactInNepse;
    }
  }

  // Round to 2 decimal places
  for (const sector of Object.keys(sectorWeights)) {
    sectorWeights[sector] = Number(sectorWeights[sector].toFixed(2));
  }

  return sectorWeights;
}

/**
 * Updates the sectorWeight.ts file with freshly calculated sector weights
 * This function calculates new weights from the companies data and overwrites the sectorWeight.ts file
 */
function updateSectorWeightsFile(): void {
  const calculatedWeights = calculateSectorWeights();
  const weightsWithMetadata = {
    ...calculatedWeights,
    lastUpdated: new Date().toISOString(),
  };

  console.log('Sector weights updated:', weightsWithMetadata);

  // Generate the new TypeScript file content
  const fileContent = `export const weights = ${JSON.stringify(weightsWithMetadata, null, 2)} as const;
`;

  // Write to the sectorWeight.ts file
  const filePath = path.resolve(__dirname, 'sectorWeight.ts');
  writeFileSync(filePath, fileContent, 'utf-8');

  console.log('✅ Updated sectorWeight.ts file with new weights');
}

export function loadSectorWeights(): Record<string, number> {
  // Return the imported weights object directly, filtering out non-numeric values
  return Object.fromEntries(
    Object.entries(weights).filter(
      ([key, value]) => key !== 'lastUpdated' && typeof value === 'number'
    )
  ) as Record<string, number>;
}

// Export function to update weights when needed
export const updateWeights = updateSectorWeightsFile;

// Export function to get fresh calculation without saving
export const getCalculatedWeights = calculateSectorWeights;

// updateWeights();
