import {
	disclosure,
	get_market_status,
	get_security_detail,
	getCompaniesList,
	getIndexPriceVolumeHistory,
	getMarket_depth,
	getNepseIndex,
	getNepseIndexIntraday,
	getPriceVolumeHistory,
	getSecurityList,
	getStockDailyPrice,
	getSummary,
	getSupplyDemand,
	getTopGainers,
	getTopLoosers,
	getTopTenTradeScrips,
	getTopTenTransactions,
	getTopTenTurnover,
	liveMarketData,
	stockIntraday,
} from "../lib/nepse/worker";

Bun.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

// const marketStatus = await getNepseIndexIntraday("NEPSE Index");

// const marketStatus = await get_security_detail("NABIL");

const marketStatus = await disclosure();

console.log(marketStatus);

// bun --env-file=.env nepse-lib-test.ts
