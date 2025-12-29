import { Hono } from "hono";
import { getStockDaily } from "@/controllers/companies-daily-chart";
import { getStockIntraday } from "@/controllers/companies-intraday-chart";
import { getIndexDaily } from "@/controllers/index-daily-chart";
import { indexIntradayChart } from "@/controllers/index-intraday-chart";
import type { IndexKey } from "@/types/indexes";
import type { Timeframe } from "@/types/timeframe";
import { isValidIndexKey } from "@/utils/is-index-valid";
import { isStockValid } from "@/utils/stock-mapper";
import { currentIssues, fetchIPOs } from "../controllers/currentIssues";
import { updateBrokers } from "./brokers";
import { getDisclosure } from "./disclosure";
import { UpdateDP } from "./dp";
import {
	fetchMissingOHLCData,
	fetchOhlcData,
} from "./fetchDataforNepseAlphaORSystemxlite";
import { fetchnpstocks } from "./fetchDataforNepseAlphaORSystemxlite/np-stocks";
import { highCaps } from "./high-caps";
import { marketDepth } from "./market-depth";
import { StockDetails } from "./stock-details";
import { refreshStockLogos } from "./stock-logo-update";
import { refreshStockNames } from "./stock-names-update";

export const apiv1Route = new Hono();

apiv1Route.get("/fetchChart", async (c) => {
	const timeframe = c.req.query("timeframe");
	const name = c.req.query("name");
	const type = c.req.query("type");

	if (!(timeframe && name && type)) {
		return c.json({
			success: false,
			message: "Missing timeframe, name or type",
		});
	}

	if (type === "index") {
		if (!isValidIndexKey(name as IndexKey)) {
			return c.json({
				success: false,
				message: "Invalid index name",
			});
		}

		if (timeframe === "1d") {
			const result = await getIndexDaily(name as IndexKey);
			return c.json(result);
		}

		if (timeframe === "1m") {
			const result = await indexIntradayChart(name as IndexKey);
			return c.json(result);
		}

		return c.json({ success: false, message: "Invalid timeframe" });
	}

	if (type === "stock") {
		if (!isStockValid(name.toUpperCase())) {
			return c.json({
				success: false,
				message: "Invalid stock name",
			});
		}

		if (timeframe === "1d") {
			const result = await getStockDaily(name.toUpperCase());
			return c.json(result);
		}

		if (timeframe === "1m") {
			const result = await getStockIntraday(name.toUpperCase());
			return c.json(result);
		}

		return c.json({ success: false, message: "Invalid timeframe" });
	}

	return c.json({ success: false, message: "Invalid type" });
});

apiv1Route.get("/fetchStock", async (c) => {
	const name = c.req.query("name");

	if (!name) {
		return c.json({
			success: false,
			message: "Missing stock name",
		});
	}

	const stockName = name.toUpperCase();

	if (!isStockValid(stockName)) {
		return c.json({
			success: false,
			message: "Invalid stock name",
		});
	}

	const result = await StockDetails(stockName);

	return c.json(result);
});

apiv1Route.get("/fetchStockList", async (c) => {
	await refreshStockNames();

	await refreshStockLogos();
	return c.json({ success: true });
});

apiv1Route.get("/stock-ohlc", async (c) => {
	const symbol = c.req.query("symbol")?.toUpperCase();
	const timeframe = c.req.query("timeframe") as Timeframe;
	if (!symbol || !timeframe) {
		return c.json({ success: false, message: "Missing symbol or timeframe" });
	}

	if (timeframe !== "1D" && timeframe !== "60") {
		return c.json({ success: false, message: "Invalid timeframe" });
	}

	if (!isStockValid(symbol)) {
		return c.json({ success: false, message: "Invalid stock symbol" });
	}

	const result = await fetchnpstocks(symbol, timeframe, false);

	return c.json(result);
});

apiv1Route.get("/patch-missing-ohlc", async (c) => {
	const timeframe = c.req.query("timeframe") as Timeframe;
	const type = (c.req.query("type") as "index" | "stock") || "stock";
	if (!timeframe) {
		return c.json({ success: false, message: "Missing timeframe" });
	}

	fetchMissingOHLCData(timeframe, type);

	return c.json({
		success: true,
		message: "Kickstarted fetching missing OHLC data",
	});
});

apiv1Route.get("/update-ohlc", async (c) => {
	const timeframe = c.req.query("timeframe") as Timeframe;
	const symbol = c.req.query("symbol") as string;
	const type = (c.req.query("type") as "index" | "stock") || "stock";

	if (!timeframe || !symbol || !type) {
		return c.json({
			success: false,
			message: "Missing timeframe, symbol or type ",
		});
	}

	const response = await fetchOhlcData(symbol, timeframe, type);

	return c.json(response);
});

apiv1Route.get("/disclosure", async (c) => {
	const result = await getDisclosure();

	return c.json(result);
});

apiv1Route.get("/update-brokers", async (c) => {
	await UpdateDP();

	await updateBrokers();

	return c.json({ success: true });
});

apiv1Route.get("/high-caps", async (c) => {
	await highCaps();
	return c.json({ success: true });
});

apiv1Route.get("/market-depth", async (c) => {
	const symbol = c.req.query("symbol") as string;

	if (!symbol || !isStockValid(symbol)) {
		return c.json({ success: false, message: "Invalid or missing symbol" });
	}

	const response = await marketDepth(symbol);
	return c.json(response);
});

apiv1Route.get("/current-issues", async (c) => {
	const response = await currentIssues();

	return c.json(response);
});

apiv1Route.get("/fetch-ipos", async (c) => {
	await Promise.all([currentIssues(), fetchIPOs()]);

	return c.json({ success: true });
});
