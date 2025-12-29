import { cronJobs } from "convex/server";
import { components, internal } from "./_generated/api";
import { internalMutation } from "./_generated/server";

const crons = cronJobs();

const ONE_WEEK_MS = 7 * 24 * 60 * 60 * 1000;

export const cleanupResend = internalMutation({
	args: {},
	handler: async (ctx) => {
		await ctx.scheduler.runAfter(0, components.resend.lib.cleanupOldEmails, {
			olderThan: ONE_WEEK_MS,
		});
		await ctx.scheduler.runAfter(
			0,
			components.resend.lib.cleanupAbandonedEmails,
			// These generally indicate a bug, so keep them around for longer.
			{ olderThan: 4 * ONE_WEEK_MS },
		);
	},
});

crons.daily(
	"clear old notifications",
	{ hourUTC: 23, minuteUTC: 59 },
	internal.notification.clearOld,
	{ days: 10 },
);

crons.interval(
	"clear expired notifications",
	{ minutes: 10 }, // every 10 minutes
	internal.notification.clearExpiredAtNotifications,
);

crons.daily(
	"clear rooms at midnight",
	{ hourUTC: 0, minuteUTC: 0 },
	internal.rooms.clearRoom,
);

crons.daily(
	"check for missing stock ohlc data at 9:30 UTC",
	{ hourUTC: 9, minuteUTC: 30 },
	internal.ohlc.fetchMissingOHLCData,
	{ timeframe: "1D", type: "stock" },
);

crons.daily(
	"check for missing index ohlc data at 9:30 UTC",
	{ hourUTC: 9, minuteUTC: 30 },
	internal.ohlc.fetchMissingOHLCData,
	{ timeframe: "1D", type: "index" },
);

crons.daily(
	"check for missing stock ohlc data at 9:50 UTC",
	{ hourUTC: 9, minuteUTC: 50 },
	internal.ohlc.fetchMissingOHLCData,
	{ timeframe: "60", type: "stock" },
);

//bugged, dp and brokers list is incomplete
// crons.weekly(
// 	"update brokers and dp list every week",
// 	{ dayOfWeek: "sunday", hourUTC: 12, minuteUTC: 0 },
// 	internal.brokers.updateBrokersAndDP,
// 	{},
// );

crons.daily(
	"check for missing index ohlc data at 9:50 UTC",
	{ hourUTC: 9, minuteUTC: 50 },
	internal.ohlc.fetchMissingOHLCData,
	{ timeframe: "60", type: "index" },
);

crons.daily(
	"check new companies at midnight",
	{ hourUTC: 0, minuteUTC: 0 },
	internal.companyNames.fetchCompanyList,
);

crons.interval(
	"update data sender",
	{ minutes: 1 }, //per minute
	internal.users.updateDataSender,
);

crons.daily(
	"fetch missing companies details at midnight if required",
	{ hourUTC: 0, minuteUTC: 0 },
	internal.company.getCompaniesDetailsIfRequired,
);

crons.daily(
	"clear old ipo at midnight",
	{ hourUTC: 0, minuteUTC: 0 },
	internal.ipo.clearOldIPOs,
);

crons.daily(
	"clear old chat messages",
	{ hourUTC: 1, minuteUTC: 0 },
	internal.chat.clearEmptyChats,
);

crons.interval("fetch new ipos", { minutes: 15 }, internal.ipo.fetchIPOs);

crons.daily(
	"clear market depth at midnight",
	{ hourUTC: 0, minuteUTC: 0 },
	internal.marketDepth.clearMarketDepth,
);

crons.daily(
	"clear old top data",
	{ hourUTC: 6, minuteUTC: 5 },
	internal.dashboard.cleanup,
);

crons.interval(
	"Remove old emails from the resend component",
	{ hours: 1 },
	internal.crons.cleanupResend,
);

crons.interval(
	"fetch disclosure every 1 hours",
	{ hours: 1 },
	internal.exchangeMessages.fetchDisclosure,
);

// //daily before market opens fetch if new stock is listed
// crons.daily(
// 	"fetch new stock names",
// 	{ hourUTC: 6, minuteUTC: 5 },
// 	internal.companyNames.fetchCompanyList,
// );

export default crons;
