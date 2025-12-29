import { api } from "@nepse-dashboard/convex/convex/_generated/api";
import { logger } from "@nepse-dashboard/logger";
import { getTopDashboardData } from "@/controllers/nepse-dashboard/categories";
import { convex } from "@/convex-client";
import { EventType } from "@/types/error-types";
import Track from "@/utils/analytics";
import { CalculateVersion } from "@/utils/version";

export const getNepseDashboard = async () => {
	logger.info("[Cron] Starting getNepseDashboard");

	try {
		const [cachedData, dashboardData] = await Promise.all([
			convex.query(api.marketStatus.get, {}),
			getTopDashboardData(15),
		]);

		if (!dashboardData) {
			Track(EventType.NEPSE_API_ERROR, {
				function: "getNepseDashboard",
				message: "No data received from Nepse API",
				data: dashboardData,
			});

			logger.error("Failed to fetch dashboard data");
			return;
		}

		const version = CalculateVersion(dashboardData);

		if (cachedData?.version === version) {
			logger.info("[getNepseDashboard] No update needed.");
			return;
		}

		logger.info("[getNepseDashboard] New dashboard data saved");

		await convex.mutation(api.dashboard.update, {
			...dashboardData,
			version,
		});
	} catch (error: unknown) {
		const message =
			error instanceof Error ? error.message : "Unknown error occurred";

		Track(EventType.EXCEPTION, {
			function: "getNepseDashboard",
			message,
		});

		logger.error(message);
	}
};
