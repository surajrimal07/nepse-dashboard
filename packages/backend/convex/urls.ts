// import { v } from "convex/values";
// import { mutation, query } from "./_generated/server";

// export const get = query({
// 	handler: async (ctx) => {
// 		return await ctx.db.query("urls").first();
// 	},
// });

// export const seedUrls = mutation({
// 	handler: async (ctx) => {
// 		// Check if URLs already exist
// 		const existing = await ctx.db.query("urls").first();

// 		if (existing) {
// 			return { success: false, message: "URLs already seeded" };
// 		}

// 		// Insert default URLs
// 		await ctx.db.insert("urls", {
// 			// App URLs
// 			review_url: "https://link.nepsechatbot.com/review",
// 			privacy_url: "https://link.nepsechatbot.com/privacy",
// 			terms_url: "https://link.nepsechatbot.com/terms",
// 			changelog_url: "https://link.nepsechatbot.com/changelog",
// 			telegram_url: "https://link.nepsechatbot.com/telegram",
// 			welcome_url: "https://link.nepsechatbot.com/welcome",
// 			uninstall_url: "https://link.nepsechatbot.com/uninstall",
// 			github_url: "https://link.nepsechatbot.com/github",
// 			chart_url: "https://nepsealpha.com/nepse-chart?symbol=",
// 			chat_url: "http://localhost:3001/dashboard",
// 			community_chat_url: "http://localhost:3001/community-chat",
// 			geolocation_api_url:
// 				"https://api.ip2location.io/?key=3B2CB46C0C0491F35A3A7A08CEFF8B20&format=json",
// 			analytics_url: "https://analytics.nepsechatbot.com/api",

// 			// Content URLs
// 			tms_login_url_pattern: "https://tms(\\d+)\\.nepsetms\\.com\\.np/login",
// 			meroshare_login_url: "meroshare.cdsc.com.np",
// 			naasax_login_url: "auth.naasasecurities.com.np/",
// 			chrome_meroshare_url: "*://meroshare.cdsc.com.np/*",
// 			chrome_naasax_url: "*://auth.naasasecurities.com.np/*",
// 			tms_watch_url: "https://*.nepsetms.com.np/login",
// 			mero_watch_url: "*://meroshare.cdsc.com.np/*",
// 			naasa_watch_url: "https://auth.naasasecurities.com.np/*",
// 			naasa_dashboard_url: "https://x.naasasecurities.com.np/Home/Dashboard",
// 			merolagani_news: "https://merolagani.com/NewsDetail.aspx*",
// 			sharesansar_news: "https://www.sharesansar.com/newsdetail/*",
// 			merolagani_news_base: "merolagani.com/NewsDetail.aspx",
// 			sharesansar_news_base: "sharesansar.com/newsdetail/",
// 			meroshare_portfolio_url: "https://meroshare.cdsc.com.np/#/portfolio",
// 			meroshare_ipo_url: "https://meroshare.cdsc.com.np/#/asba",

// 			updatedAt: Date.now(),
// 		});

// 		return { success: true, message: "URLs seeded successfully" };
// 	},
// });

// export const updateUrl = mutation({
// 	args: {
// 		field: v.string(),
// 		value: v.string(),
// 	},
// 	handler: async (ctx, { field, value }) => {
// 		const existing = await ctx.db.query("urls").first();

// 		if (!existing) {
// 			throw new Error("URLs not seeded yet. Run seedUrls first.");
// 		}

// 		// Update specific field
// 		await ctx.db.patch(existing._id, {
// 			[field]: value,
// 			updatedAt: Date.now(),
// 		});

// 		return { success: true, message: `${field} updated successfully` };
// 	},
// });

// export const updateMultipleUrls = mutation({
// 	args: {
// 		updates: v.record(v.string(), v.string()),
// 	},
// 	handler: async (ctx, { updates }) => {
// 		const existing = await ctx.db.query("urls").first();

// 		if (!existing) {
// 			throw new Error("URLs not seeded yet. Run seedUrls first.");
// 		}

// 		// Update multiple fields at once
// 		await ctx.db.patch(existing._id, {
// 			...updates,
// 			updatedAt: Date.now(),
// 		});

// 		return {
// 			success: true,
// 			message: `Updated ${Object.keys(updates).length} URLs successfully`,
// 		};
// 	},
// });
