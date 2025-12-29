import { api } from "@nepse-dashboard/convex/convex/_generated/api";
import { logger } from "@nepse-dashboard/logger";
import { convex } from "@/convex-client";
import { getSupplyDemand } from "@/lib/nepse/worker";
import { EventType } from "@/types/error-types";
import Track from "@/utils/analytics";
import { CalculateVersion } from "@/utils/version";
import {
	type HighestOrderWithSupplyDemandData,
	type SupplyDemand,
	SupplyDemandResponseSchema,
} from "./types";
import { getNepaliDate, getNepaliTime } from "./utils";

const mergeBuySellData = (
	item: SupplyDemand,
	side: "Demand" | "Supply",
	matchingList: SupplyDemand[],
): HighestOrderWithSupplyDemandData => {
	const modifiedItem: HighestOrderWithSupplyDemandData = { ...item };

	if (side === "Demand") {
		modifiedItem.totalBuyOrder = item.totalOrder;
		modifiedItem.totalBuyQuantity = item.totalQuantity;

		const matchingSellData = matchingList.find(
			(sellItem) => sellItem.symbol === item.symbol,
		);
		if (matchingSellData) {
			modifiedItem.totalSellOrder = matchingSellData.totalOrder;
			modifiedItem.totalSellQuantity = matchingSellData.totalQuantity;
			modifiedItem.buyQuantityPerOrder = item.quantityPerOrder;
			modifiedItem.sellQuantityPerOrder = matchingSellData.quantityPerOrder;
		} else {
			modifiedItem.totalSellOrder = 0;
			modifiedItem.totalSellQuantity = 0;
		}
	} else if (side === "Supply") {
		modifiedItem.totalSellOrder = item.totalOrder;
		modifiedItem.totalSellQuantity = item.totalQuantity;

		const matchingBuyData = matchingList.find(
			(buyItem) => buyItem.symbol === item.symbol,
		);
		if (matchingBuyData) {
			modifiedItem.totalBuyOrder = matchingBuyData.totalOrder;
			modifiedItem.totalBuyQuantity = matchingBuyData.totalQuantity;
			modifiedItem.sellQuantityPerOrder = item.quantityPerOrder;
			modifiedItem.buyQuantityPerOrder = matchingBuyData.quantityPerOrder;
		} else {
			modifiedItem.totalBuyOrder = 0;
			modifiedItem.totalBuyQuantity = 0;
		}
	}

	modifiedItem.buyToSellOrderRatio = Number.parseFloat(
		(
			(modifiedItem.totalBuyOrder || 0) / (modifiedItem.totalSellOrder || 1)
		).toFixed(1),
	);
	modifiedItem.buyToSellQuantityRatio = Number.parseFloat(
		(
			(modifiedItem.totalBuyQuantity || 0) /
			(modifiedItem.totalSellQuantity || 1)
		).toFixed(1),
	);

	return modifiedItem;
};

export async function getSupplyDemandData() {
	logger.info("[Cron] Starting getSupplyDemandData");

	try {
		const [cachedVersion, data] = await Promise.all([
			convex.query(api.supplyDemand.get, {}),
			getSupplyDemand(),
		]);

		if (!data) {
			const message = "No data received from Nepse API";
			Track(EventType.NEPSE_API_ERROR, {
				function: "getSupplyDemandData",
				message,
			});

			logger.error(message);

			return;
		}

		const { supplyList, demandList } = data;

		const calculateQuantityPerOrder = (
			list: SupplyDemand[],
			side: "Demand" | "Supply",
		): SupplyDemand[] => {
			return list
				.filter((item) => item.totalQuantity != null)
				.map((item) => {
					if (item.totalOrder !== 0) {
						item.quantityPerOrder = Math.floor(
							item.totalQuantity / item.totalOrder,
						);
					} else {
						item.quantityPerOrder = 0;
					}
					item.orderSide = side;
					delete item.securityId;
					return item;
				});
		};

		const demandWithQuantityPerOrder = calculateQuantityPerOrder(
			demandList,
			"Demand",
		);
		const supplyWithQuantityPerOrder = calculateQuantityPerOrder(
			supplyList,
			"Supply",
		);

		const combineAndSortTopItems = async (
			highestDemand: SupplyDemand[],
			highestSupply: SupplyDemand[],
		): Promise<HighestOrderWithSupplyDemandData[]> => {
			const combinedList = [
				...(await Promise.all(
					highestDemand.map(async (item) =>
						mergeBuySellData(item, "Demand", supplyList),
					),
				)),
				...(await Promise.all(
					highestSupply.map(async (item) =>
						mergeBuySellData(item, "Supply", demandList),
					),
				)),
			];

			const sortedList = combinedList
				.sort((a, b) => (b.quantityPerOrder || 0) - (a.quantityPerOrder || 0))
				.slice(0, 10);

			return sortedList;
		};

		const highestDemand = demandWithQuantityPerOrder.slice(0, 10);
		const highestSupply = supplyWithQuantityPerOrder.slice(0, 10);

		if (highestDemand.length <= 2 || highestSupply.length <= 2) {
			return null;
		}

		const highestQuantityperOrder = await combineAndSortTopItems(
			highestDemand,
			highestSupply,
		);

		const supplyDemandData = {
			highestQuantityperOrder,
			highestSupply,
			highestDemand,
		};

		const version = CalculateVersion(supplyDemandData);

		const validatedData = SupplyDemandResponseSchema.safeParse({
			...supplyDemandData,
			version,
			time: getNepaliTime(),
			date: getNepaliDate(),
		});

		if (!validatedData.success) {
			const message =
				"[getSupplyDemandData] Validation failed for supply-demand data.";

			Track(EventType.SCHEMA_VALIDATION_FAILED, {
				function: "getSupplyDemandData",
				message,
			});

			logger.error(message);
			return;
		}

		if (cachedVersion?.version === version) {
			logger.info("[getSupplyDemandData] No update needed.");
			return;
		}

		await convex.mutation(api.supplyDemand.patch, validatedData.data);
	} catch (error) {
		const message = error instanceof Error ? error.message : "Unknown error";

		Track(EventType.EXCEPTION, {
			function: "getSupplyDemandData",
			message,
		});

		logger.error(message);

		return;
	}
}
