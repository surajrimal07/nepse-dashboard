import type { TopCompany } from '../types/nepse';

const top20Companies = [
  {
    ticker: 'NRIC',
    name: 'Nepal Reinsurance Company Limited',
    impactPercentage: 3.79,
  },
  {
    ticker: 'NTC',
    name: 'Nepal Doorsanchar Comapany Limited',
    impactPercentage: 3.51,
  },
  { ticker: 'NABIL', name: 'Nabil Bank Limited', impactPercentage: 3.02 },
  { ticker: 'CIT', name: 'Citizen Investment Trust', impactPercentage: 2.76 },
  {
    ticker: 'HRL',
    name: 'Himalayan Reinsurance Limited',
    impactPercentage: 2.27,
  },
  { ticker: 'GBIME', name: 'Global IME Bank Limited', impactPercentage: 2.12 },
  { ticker: 'EBL', name: 'Everest Bank Limited', impactPercentage: 1.92 },
  {
    ticker: 'NIMB',
    name: 'Nepal Investment Mega Bank Limited',
    impactPercentage: 1.69,
  },
  {
    ticker: 'HIDCL',
    name: 'Hydroelectricity Investment and Development Company Ltd',
    impactPercentage: 1.62,
  },
  {
    ticker: 'NLIC',
    name: 'Nepal Life Insurance Co. Ltd.',
    impactPercentage: 1.53,
  },
  {
    ticker: 'SCB',
    name: 'Standard Chartered Bank Limited',
    impactPercentage: 1.41,
  },
  {
    ticker: 'NIFRA',
    name: 'Nepal Infrastructure Bank Limited',
    impactPercentage: 1.35,
  },
  { ticker: 'SHL', name: 'Soaltee Hotel Limited', impactPercentage: 1.3 },
  { ticker: 'KBL', name: 'Kumari Bank Limited', impactPercentage: 1.3 },
  { ticker: 'LSL', name: 'Laxmi Sunrise Bank Limited', impactPercentage: 1.26 },
  { ticker: 'NICA', name: 'NIC Asia Bank Ltd.', impactPercentage: 1.24 },
  { ticker: 'PRVU', name: 'Prabhu Bank Limited', impactPercentage: 1.15 },
  { ticker: 'HBL', name: 'Himalayan Bank Limited', impactPercentage: 1.14 },
  {
    ticker: 'PCBL',
    name: 'Prime Commercial Bank Ltd.',
    impactPercentage: 1.12,
  },
  { ticker: 'NMB', name: 'NMB Bank Limited', impactPercentage: 1.04 },
];

const totalImpactPercentage = top20Companies.reduce(
  (total, company) => total + company.impactPercentage,
  0
);

const topCompaniess: TopCompany[] = top20Companies.map((company) => ({
  ticker: company.ticker,
  name: company.name,
  impact: Number.parseFloat(
    ((company.impactPercentage / totalImpactPercentage) * 100).toFixed(2)
  ),
}));

export default function topCompanies(): TopCompany[] {
  return topCompaniess;
}
