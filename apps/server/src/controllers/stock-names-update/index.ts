import { api } from "@nepse-dashboard/convex/convex/_generated/api";
import { logger } from "@nepse-dashboard/logger";
import { convex } from "@/convex-client";
import { getCompaniesList } from "@/lib/nepse/worker";
import { EventType } from "@/types/error-types";
import Track from "@/utils/analytics";
import { CompanyListSchema } from "./types";

export const refreshStockNames = async () => {
	try {
		const apiData = await getCompaniesList();

		if (!apiData) {
			const message = "No data received from getCompaniesList";

			logger.error(message);

			Track(EventType.NEPSE_API_ERROR, {
				function: "refreshStockNames",
				message,
			});

			return;
		}

		const validatedData = CompanyListSchema.safeParse(apiData);

		if (!validatedData.success) {
			const message = "Validation failed for company list data";

			logger.error(message);

			Track(EventType.NEPSE_API_ERROR, {
				function: "refreshStockNames",
				message,
			});

			return;
		}

		await convex.mutation(api.company.patchSymbolNames, {
			data: validatedData.data,
		});
	} catch (error) {
		const message = error instanceof Error ? error.message : "Unknown error";

		Track(EventType.EXCEPTION, {
			function: "refreshStockNames",
			message,
		});

		logger.error(message);
	}
};
