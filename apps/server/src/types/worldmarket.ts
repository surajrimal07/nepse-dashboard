export type CryptoCurrency = {
  symbol: string;
  currency: string;
  rate: string;
  change: string;
  marketCap: string | undefined;
  volume24h: string | undefined;
};

export type MarketIndex = {
  index: string;
  quote: number;
  change: number;
  changepercentage: number;
};

export type CurrencyExchange = {
  currency: string;
  rate: number;
  change: number;
  changepercentage: number;
};

export interface MarketData {
  cryptocurrency: CryptoCurrency[];
  currencyExchangeRates: CurrencyExchange[];
  asianMarketIndices: MarketIndex[];
  europeanMarketIndices: MarketIndex[];
  americanMarketIndices: MarketIndex[];
}
