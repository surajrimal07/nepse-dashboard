/** biome-ignore-all lint/suspicious/noConsole: <known> */
import { readFileSync, writeFileSync } from 'node:fs';

//conpanies.csv comes from https://www.nepsealpha.com/traded-stocks

// 1. Read CSV
const csv = readFileSync('./companies.csv', 'utf8');

// 2. Parse CSV
const lines = csv.trim().split('\n');
const headers = lines[0].split('\t'); // tab-separated

// 3. Convert to array of objects
const rows = lines.slice(1).map((line) => {
  const cols = line.split('\t');
  const obj: Record<string, string | number> = {};
  headers.forEach((h, i) => {
    const num = Number(cols[i].replace(/,/g, ''));
    obj[h] = Number.isNaN(num) ? cols[i] : num;
  });
  return obj;
});

// 4. Save as TypeScript
const tsContent =
  `export const companies = ${JSON.stringify(rows, null, 2)} as const;\n\n` +
  'export type Company = typeof companies[number];\n';

writeFileSync('./companies.ts', tsContent);

console.log('✅ Converted companies.csv → companies.ts');
