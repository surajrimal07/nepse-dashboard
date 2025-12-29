import { internalMutation } from "./_generated/server";
import { listedBrokers } from "./data/brokers";
import { ListedDPs } from "./data/dp";
import { Model } from "./data/model";

// // export const seedSubscriptionPlans = internalMutation({
// // 	args: {},
// // 	handler: async (ctx) => {
// // 		// Make sure no data exists in the subscriptionPlans table
// // 		const existingPlans = await ctx.db.query("subscriptionPlans").collect();
// // 		if (
// // 			existingPlans === undefined ||
// // 			existingPlans === null ||
// // 			!existingPlans.length
// // 		) {
// // 			const now = Date.now();
// // 			const plans = [
// // 				{
// // 					tier: "free" as const,
// // 					api_rpm: 30,
// // 					news_rpd: 15,
// // 					ai_chat_rpd: 20,
// // 					api_rpd: 250,
// // 					tokens_granted: 25000,
// // 					created_at: now,
// // 					updated_at: now,
// // 					active: true,
// // 				},
// // 				// {
// // 				// 	tier: "pro" as const,
// // 				// 	api_rpm: 100,
// // 				// 	news_rpd: 50,
// // 				// 	ai_chat_rpd: 250,
// // 				// 	api_rpd: 400,
// // 				// 	tokens_granted: 200000,
// // 				// 	created_at: now,
// // 				// 	updated_at: now,
// // 				// 	active: true,
// // 				// },
// // 				// {
// // 				// 	tier: "elite" as const,
// // 				// 	api_rpm: 150,
// // 				// 	news_rpd: 100,
// // 				// 	ai_chat_rpd: 500,
// // 				// 	api_rpd: 600,
// // 				// 	tokens_granted: 400000,
// // 				// 	created_at: now,
// // 				// 	updated_at: now,
// // 				// 	active: true,
// // 				// },
// // 			];

// // 			await Promise.all(
// // 				plans.map(
// // 					async (plan) => await ctx.db.insert("subscriptionPlans", plan),
// // 				),
// // 			);
// // 			console.log(`✅ Seeded ${plans.length} subscription plans`);
// // 		} else {
// // 			console.log("📋 Subscription plans already exist, skipping seed");
// // 		}
// // 	},
// // });

// export const seedIndexNames = internalMutation({
// 	args: {},
// 	handler: async (ctx) => {
// 		const existingIndexes = await ctx.db.query("indexNames").collect();
// 		if (
// 			existingIndexes === undefined ||
// 			existingIndexes === null ||
// 			!existingIndexes.length
// 		) {
// 			const now = Date.now();
// 			const indexes = [
// 				{
// 					index: "Banking SubIndex" as const,
// 					created_at: now,
// 					updated_at: now,
// 				},
// 				{
// 					index: "Development Bank Ind." as const,
// 					created_at: now,
// 					updated_at: now,
// 				},
// 				{ index: "Finance Index" as const, created_at: now, updated_at: now },
// 				{
// 					index: "Hotels And Tourism" as const,
// 					created_at: now,
// 					updated_at: now,
// 				},
// 				{
// 					index: "HydroPower Index" as const,
// 					created_at: now,
// 					updated_at: now,
// 				},
// 				{ index: "Investment" as const, created_at: now, updated_at: now },
// 				{ index: "Life Insurance" as const, created_at: now, updated_at: now },
// 				{
// 					index: "Manufacturing And Pr." as const,
// 					created_at: now,
// 					updated_at: now,
// 				},
// 				{
// 					index: "Microfinance Index" as const,
// 					created_at: now,
// 					updated_at: now,
// 				},
// 				{ index: "Mutual Fund" as const, created_at: now, updated_at: now },
// 				{ index: "NEPSE Index" as const, created_at: now, updated_at: now },
// 				{
// 					index: "Non Life Insurance" as const,
// 					created_at: now,
// 					updated_at: now,
// 				},
// 				{ index: "Others Index" as const, created_at: now, updated_at: now },
// 				{ index: "Trading Index" as const, created_at: now, updated_at: now },
// 			];

// 			await Promise.all(
// 				indexes.map(
// 					async (indexName) => await ctx.db.insert("indexNames", indexName),
// 				),
// 			);
// 			console.log(`✅ Seeded ${indexes.length} index names`);
// 		} else {
// 			console.log("📋 Index names already exist, skipping seed");
// 		}
// 	},
// });

// // export const seedPricingOptions = internalMutation({
// // 	args: {},
// // 	handler: async (ctx) => {
// // 		const existingPricingOptions = await ctx.db
// // 			.query("pricingOptions")
// // 			.collect();

// // 		if (
// // 			existingPricingOptions === undefined ||
// // 			existingPricingOptions === null ||
// // 			!existingPricingOptions.length
// // 		) {
// // 			const now = Date.now();

// // 			// Get tier IDs from subscriptionPlans
// // 			const tiers = await ctx.db.query("subscriptionPlans").collect();
// // 			const getTierId = (tierName: string) => {
// // 				const tier = tiers.find((t) => t.tier === tierName);
// // 				if (!tier) throw new ConvexError(`Tier "${tierName}" not found.`);
// // 				return tier._id;
// // 			};

// // 			const pricingOptions = [
// // 				{
// // 					price: 1000,
// // 					created_at: now,
// // 					updated_at: now,
// // 					tier: getTierId("elite"),
// // 					duration: 31536000, // 1 year
// // 				},
// // 				{
// // 					price: 750,
// // 					created_at: now,
// // 					updated_at: now,
// // 					tier: getTierId("pro"),
// // 					duration: 31536000, // 1 year
// // 				},
// // 				{
// // 					price: 200,
// // 					created_at: now,
// // 					updated_at: now,
// // 					tier: getTierId("pro"),
// // 					duration: 7776000, // 3 months
// // 				},
// // 				{
// // 					price: 350,
// // 					created_at: now,
// // 					updated_at: now,
// // 					tier: getTierId("elite"),
// // 					duration: 7776000, // 3 months
// // 				},
// // 				{
// // 					price: 380,
// // 					created_at: now,
// // 					updated_at: now,
// // 					tier: getTierId("pro"),
// // 					duration: 15552000, // 6 months
// // 				},
// // 				{
// // 					price: 650,
// // 					created_at: now,
// // 					updated_at: now,
// // 					tier: getTierId("elite"),
// // 					duration: 15552000, // 6 months
// // 				},
// // 			];

// // 			await Promise.all(
// // 				pricingOptions.map((plan) => ctx.db.insert("pricingOptions", plan)),
// // 			);
// // 			console.log(`✅ Seeded ${pricingOptions.length} pricing options`);
// // 		} else {
// // 			console.log("📋 Pricing options already exist, skipping seed");
// // 		}
// // 	},
// // });

// // export const seedTokenPricingOptions = internalMutation({
// // 	args: {},
// // 	handler: async (ctx) => {
// // 		const existing = await ctx.db.query("tokenPricingOptions").collect();

// // 		if (existing === undefined || existing === null || !existing.length) {
// // 			const now = Date.now();

// // 			const tokenPricingOptions = [
// // 				{
// // 					name: "Package 1",
// // 					price: 100,
// // 					token_amount: 150000,
// // 					created_at: now,
// // 					updated_at: now,
// // 				},
// // 				{
// // 					name: "Package 2",
// // 					price: 300,
// // 					token_amount: 500000,
// // 					created_at: now,
// // 					updated_at: now,
// // 				},
// // 				{
// // 					name: "Package 3",
// // 					price: 600,
// // 					token_amount: 1100000,
// // 					created_at: now,
// // 					updated_at: now,
// // 				},
// // 			];

// // 			await Promise.all(
// // 				tokenPricingOptions.map((option) =>
// // 					ctx.db.insert("tokenPricingOptions", option),
// // 				),
// // 			);
// // 			console.log(
// // 				`✅ Seeded ${tokenPricingOptions.length} token pricing options`,
// // 			);
// // 		} else {
// // 			console.log("📋 Token pricing options already exist, skipping seed");
// // 		}
// // 	},
// // });

export const seedModels = internalMutation({
	args: {},
	handler: async (ctx) => {
		const existing = await ctx.db.query("models").collect();

		if (existing === undefined || existing === null || !existing.length) {
			await Promise.all(Model.map((option) => ctx.db.insert("models", option)));
			console.log(`✅ Seeded ${Model.length} models`);
		} else {
			console.log("📋 Models already exist, skipping seed");
		}
	},
});

// // export const seedURLs = internalMutation({
// // 	args: {},
// // 	handler: async (ctx) => {
// // 		const data = await ctx.db.query("urls").unique();

// // 		if (data === undefined || data === null) {
// // 			await ctx.db.insert("urls", {
// // 				chart_url: "https://nepsealpha.com/nepse-chart?symbol=",
// // 				login_url: "http://localhost:3001/signin?from=extension",
// // 				login_anonymous_url: "http://localhost:3001/login-anonymous",
// // 				chat_url: "http://localhost:3001/dashboard",
// // 				analytics_url: "https://analytics.nepsechatbot.com/api",
// // 				review_url: "https://link.nepsechatbot.com/review",
// // 				privacy_url: "https://link.nepsechatbot.com/privacy",
// // 				terms_url: "https://link.nepsechatbot.com/terms",
// // 				changelog_url: "https://link.nepsechatbot.com/changelog",
// // 				telegram_url: "https://link.nepsechatbot.com/telegram",
// // 				welcome_url: "https://link.nepsechatbot.com/telegram",
// // 				uninstall_url: "https://link.nepsechatbot.com/uninstall",
// // 				github_url: "https://link.nepsechatbot.com/github",
// // 			});
// // 			console.log("✅ Seeded URLs");
// // 		} else {
// // 			console.log("📋 URLs already exist, skipping seed");
// // 		}
// // 	},
// // });

// export const seedMarketStatus = internalMutation({
// 	args: {},
// 	handler: async (ctx) => {
// 		const existing = await ctx.db.query("marketStatus").collect();

// 		if (existing === undefined || existing === null || !existing.length) {
// 			await ctx.db.insert("marketStatus", {
// 				state: "Close",
// 				isOpen: false,
// 				asOf: new Date().toISOString(), // Store current date as ISO string
// 				version: "0.0.1", // Initial version
// 			});
// 			console.log("✅ Seeded market status");
// 		} else {
// 			console.log("📋 Market status already exists, skipping seed");
// 		}
// 	},
// });

export const seedBrokersNames = internalMutation({
	handler: async (ctx) => {
		const existing = await ctx.db.query("brokers").collect();
		const data = listedBrokers;

		let insertedCount = 0;
		let updatedCount = 0;

		for (const broker of data) {
			// Check if broker with same broker_number already exists
			const existingBroker = existing.find(
				(e) => e.broker_number === broker.broker_number,
			);

			// Convert null values to undefined for schema compatibility
			const cleanBroker = {
				broker_name: broker.broker_name,
				broker_number: broker.broker_number,
				broker_address: broker.broker_address,
				broker_phone: broker.broker_phone || undefined,
				broker_email: broker.broker_email || undefined,
				broker_website: broker.broker_website || undefined,
				tms_link: broker.tms_link || undefined,
			};

			if (existingBroker) {
				// Patch existing broker
				await ctx.db.patch(existingBroker._id, {
					broker_name: cleanBroker.broker_name,
					broker_address: cleanBroker.broker_address,
					broker_phone: cleanBroker.broker_phone,
					broker_email: cleanBroker.broker_email,
					broker_website: cleanBroker.broker_website,
					tms_link: cleanBroker.tms_link,
				});
				updatedCount++;
			} else {
				// Insert new broker
				await ctx.db.insert("brokers", cleanBroker);
				insertedCount++;
			}
		}

		console.log(
			`✅ Seeded broker names: ${insertedCount} inserted, ${updatedCount} updated`,
		);
	},
});

export const seedDPNames = internalMutation({
	args: {},
	handler: async (ctx) => {
		const existing = await ctx.db.query("dp").collect();
		const data = ListedDPs;

		let insertedCount = 0;
		let updatedCount = 0;

		for (const dp of data) {
			// Check if DP with same dpid already exists
			const existingDP = existing.find((e) => e.dpid === dp.dpid);

			// Convert null values to undefined for schema compatibility and handle email
			const cleanDP = {
				dpid: dp.dpid,
				name: dp.name,
				address: dp.address,
				phone: dp.phone,
				email: dp.email || undefined,
			};

			if (existingDP) {
				// Patch existing DP
				await ctx.db.patch(existingDP._id, {
					name: cleanDP.name,
					address: cleanDP.address,
					phone: cleanDP.phone,
					email: cleanDP.email,
				});
				updatedCount++;
			} else {
				// Insert new DP
				await ctx.db.insert("dp", cleanDP);
				insertedCount++;
			}
		}

		console.log(
			`✅ Seeded DP names: ${insertedCount} inserted, ${updatedCount} updated`,
		);
	},
});

// // Main seed function that runs all seeds in the correct order
// export const seedAll = internalMutation({
// 	args: {},
// 	handler: async (ctx) => {
// 		// await ctx.runMutation(internal.seed.seedURLs, {});
// 		// await ctx.runMutation(internal.seed.seedSubscriptionPlans, {});
// 		// await ctx.runMutation(internal.seed.seedTokenPricingOptions, {});
// 		// await ctx.runMutation(internal.seed.seedModels, {});
// 		// await ctx.runMutation(internal.seed.seedPricingOptions, {});

// 		await ctx.runMutation(internal.seed.seedIndexNames, {});
// 		await ctx.runMutation(internal.seed.seedMarketStatus, {});
// 		await ctx.runMutation(internal.seed.seedBrokersNames, {});
// 		await ctx.runMutation(internal.seed.seedDPNames, {});
// 	},
// });
