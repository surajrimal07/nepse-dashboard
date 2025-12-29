import { autoRetry } from "@grammyjs/auto-retry";
import { Menu } from "@grammyjs/menu";
import { run, sequentialize } from "@grammyjs/runner";
import * as Sentry from "@sentry/bun";
import { Bot, GrammyError, HttpError, InlineKeyboard, session } from "grammy";
import { type IndexKey, nepseIndexes } from "@/types/indexes";
import {
	generateAllIndicesSummary,
	generateIndexSummary,
} from "../../data/index-summary";
import { generateMarketSummary } from "../../data/market-summary";
import {
	generateAllTopsSummary,
	generateTopSummary,
} from "../../data/top-summary";
import { spamProtectionMiddleware } from "./spam";
import type { BotContext, SessionData } from "./types";
import { welcomeMiddleware } from "./welcome";

import env from "env";

/**
 * Utility class for Telegram bot functionality
 */
class TelegramBot {
	private static instance: TelegramBot;
	private bot: Bot<BotContext> | null = null;
	private runner: ReturnType<typeof run> | null = null;
	private isInitialized = false;

	private config = {
		botToken: env.TELEGRAM_BOT_TOKEN || "",
		channelId: env.TELEGRAM_CHANNEL_ID || env.TELEGRAM_CHAT_ID || "",
		enabled: env.TELEGRAM_ENABLED || false,
	};

	private constructor() {
		// Validate configuration
		if (this.config.enabled) {
			if (!this.config.botToken || this.config.botToken === "YOUR_BOT_TOKEN") {
				console.warn(
					"Telegram bot token not configured. Telegram notifications will be disabled.",
				);
				this.config.enabled = false;
			}

			if (
				!this.config.channelId ||
				this.config.channelId === "YOUR_CHANNEL_ID"
			) {
				console.warn(
					"Telegram channel ID not configured. Telegram notifications will be disabled.",
				);
				this.config.enabled = false;
			}
		}
	}

	/**
	 * Get the singleton instance of TelegramBot
	 */
	static getInstance(): TelegramBot {
		if (!TelegramBot.instance) {
			TelegramBot.instance = new TelegramBot();
		}
		return TelegramBot.instance;
	}

	/**
	 * Initialize the bot and start polling
	 */
	initialize(): void {
		if (!this.config.enabled || this.isInitialized) {
			return;
		}

		try {
			// Create bot instance
			this.bot = new Bot<BotContext>(this.config.botToken);

			// Set up session storage
			this.bot.use(
				session({
					initial(): SessionData {
						return {
							preferences: {
								notifications: true,
								favoriteStocks: [],
							},
							spamProtection: {
								messageCount: 0,
								lastMessageTime: Date.now(),
								warningLevel: 0,
							},
						};
					},
				}),
			);

			// Set up sequentialize middleware to prevent race conditions
			this.bot.use(
				sequentialize((ctx) => {
					const chatId = ctx.chat?.id.toString();
					return chatId ? `${chatId}` : undefined;
				}),
			);

			this.bot.use(welcomeMiddleware);

			// Set up spam protection
			this.bot.use(spamProtectionMiddleware);

			this.bot.api.config.use(autoRetry());

			// this.bot.use(
			//   limit({
			//     timeFrame: 2000,
			//     limit: 2,
			//     storageClient: redis.getClient(),

			//     onLimitExceeded: (ctx) => {
			//       ctx?.reply('Please refrain from sending too many requests!');
			//     },
			//     keyGenerator: (ctx) => {
			//       return ctx.from?.id.toString();
			//     },
			//   })
			// );

			// Set up commands and handlers
			this.setupCommands();
			this.setupMenus();
			this.setupErrorHandling();

			// Start the bot
			console.log("Starting Telegram bot...");
			this.runner = run(this.bot);
			this.isInitialized = true;
			console.log("Telegram bot started successfully");
		} catch (error) {
			Sentry.captureException(error);
			console.error("Failed to initialize Telegram bot:", error);
		}
	}

	/**
	 * Stop the bot
	 */
	stop(): void {
		if (this.runner) {
			this.runner.stop();
			this.runner = null;
			this.isInitialized = false;
			console.log("Telegram bot stopped");
		}
	}

	/**
	 * Set up bot commands
	 */
	private setupCommands(): void {
		if (!this.bot) {
			return;
		}

		// Register commands with Telegram
		this.bot.api.setMyCommands([
			{ command: "start", description: "Start the bot" },
			{ command: "market", description: "Get current market status" },
			{ command: "stockinfo", description: "Get information about a stock" },
			{ command: "index", description: "Get information about market indices" },
			{ command: "top", description: "Get top market performers" },
			{ command: "askai", description: "Ask AI about stock market questions" },
			{ command: "settings", description: "Configure your preferences" },
		]);

		// Start command
		this.bot.command("start", async (ctx) => {
			await ctx.reply(
				"👋 Welcome to the NEPSE Stock Market Bot!\n\nThis bot provides real-time information about the Nepal Stock Exchange (NEPSE).\n\nType /help to see available commands.\n\n<b>Brought to you by Nepse Dashboard</b>\nPlease install our Chrome extension: https://chromewebstore.google.com/detail/nepse-dashboard/efglamoipanaajcmhfeblhdbhciggojd?hl=en",
				{
					parse_mode: "HTML",
				},
			);
		});

		// Market command
		this.bot.command("market", async (ctx) => {
			try {
				const message = await generateMarketSummary();
				await ctx.reply(message, { parse_mode: "HTML" });
			} catch (error) {
				Sentry.captureException(error);
				await ctx.reply("An error occurred while fetching market data.");
			}
		});

		// Stock info command
		this.bot.command("stockinfo", async (ctx) => {
			const symbol = ctx.message?.text.split(" ")[1]?.toUpperCase();

			if (!symbol) {
				await ctx.reply(
					"Please provide a stock symbol. Example: /stockinfo KKHC",
				);
				return;
			}

			try {
				// const message = await generateCompanySummary(symbol, "html");
				// 				await ctx.reply(message, { parse_mode: "HTML" });

				await ctx.reply("Currently in development, please try again");
				return;
			} catch (error) {
				Sentry.captureException(error);
				await ctx.reply(
					`Error fetching data for ${symbol}. Please check the symbol and try again.`,
				);
			}
		});

		// Modify the index command to include an "All Indices" option
		this.bot.command("index", async (ctx) => {
			try {
				const text = ctx.message?.text.trim();
				const parts = text?.split(" ");

				// If no specific index is requested, show a list of available indices
				if (parts?.length === 1) {
					// Create keyboard with all indices except "NEPSE Index"
					const keyboard = [
						[{ text: "All Indices", callback_data: "index_all" }],
						...nepseIndexes
							.filter((index) => index !== "NEPSE Index") // Exclude NEPSE Index
							.map((index) => [
								{
									text: index,
									callback_data: `index_${index}`,
								},
							]),
					];

					await ctx.reply("Please select an index to view details:", {
						reply_markup: {
							inline_keyboard: keyboard,
						},
					});
					return;
				}

				// If a specific index is requested
				const requestedIndex = parts?.slice(1).join(" ") ?? "";

				if (requestedIndex.toLowerCase() === "all") {
					const message = await generateAllIndicesSummary("html");
					await ctx.reply(message, { parse_mode: "HTML" });
					return;
				}

				const matchedIndex = nepseIndexes.find(
					(index) => index.toLowerCase() === requestedIndex.toLowerCase(),
				);

				if (!matchedIndex) {
					await ctx.reply(
						`Index "${requestedIndex}" not found. Available indices:\n\n${nepseIndexes.join("\n")}`,
						{ parse_mode: "HTML" },
					);
					return;
				}

				await this.sendIndexInfo(ctx, matchedIndex);
			} catch (error) {
				console.error("Error handling index command:", error);
				await ctx.reply("An error occurred while fetching index data.");
			}
		});

		this.bot.command("top", async (ctx) => {
			try {
				const text = ctx.message?.text.trim();
				const parts = text?.split(" ");

				// If no specific category is requested, show options
				if (parts?.length === 1) {
					const keyboard = [
						[{ text: "All Top Performers", callback_data: "top_all" }],
						[{ text: "Top Gainers", callback_data: "top_gainers" }],
						[{ text: "Top Losers", callback_data: "top_losers" }],
						[{ text: "Top Turnover", callback_data: "top_turnover" }],
						[{ text: "Most Traded", callback_data: "top_traded" }],
						[{ text: "Most Transactions", callback_data: "top_transactions" }],
					];

					await ctx.reply("Please select a category to view top performers:", {
						reply_markup: {
							inline_keyboard: keyboard,
						},
					});
					return;
				}

				// If a specific category is requested
				const category = parts?.[1]?.toLowerCase();

				switch (category) {
					case "all": {
						const message = await generateAllTopsSummary("html");
						await ctx.reply(message, { parse_mode: "HTML" });
						break;
					}
					case "gainers":
						await this.sendTopGainers(ctx);
						break;
					case "losers":
						await this.sendTopLosers(ctx);
						break;
					case "turnover":
						await this.sendTopTurnover(ctx);
						break;
					case "traded":
						await this.sendTopTraded(ctx);
						break;
					case "transactions":
						await this.sendTopTransactions(ctx);
						break;
					default:
						await ctx.reply(
							"Invalid category. Available categories: all, gainers, losers, turnover, traded, transactions",
						);
				}
			} catch (error) {
				console.error("Error handling top command:", error);
				await ctx.reply(
					"An error occurred while fetching top performers data.",
				);
			}
		});

		// Settings command
		this.bot.command("settings", async (ctx) => {
			const keyboard = new InlineKeyboard()
				.text(
					ctx.session.preferences?.notifications
						? "🔔 Notifications ON"
						: "🔕 Notifications OFF",
					"toggle_notifications",
				)
				.row()
				.text("Add Favorite Stock", "add_favorite")
				.row()
				.text("View Favorites", "view_favorites");

			await ctx.reply("Settings:", { reply_markup: keyboard });
		});

		// Handle callback queries from inline keyboards
		this.bot.on("callback_query:data", async (ctx) => {
			const data = ctx.callbackQuery.data;

			// Acknowledge the callback query
			await ctx.answerCallbackQuery();

			// Use switch statement for better performance with multiple conditions
			switch (true) {
				// Index related callbacks
				case data?.startsWith("index_"):
					if (data === "index_all") {
						const message = await generateAllIndicesSummary("html");
						await ctx.reply(message, { parse_mode: "HTML" });
					} else {
						const indexName = data.substring(6);
						await this.sendIndexInfo(ctx, indexName as IndexKey);
					}
					break;

				// Settings related callbacks
				case data === "toggle_notifications": {
					// Toggle notifications setting
					if (!ctx.session.preferences) {
						ctx.session.preferences = {
							notifications: true,
							favoriteStocks: [],
						};
					}

					ctx.session.preferences.notifications =
						!ctx.session.preferences.notifications;

					const keyboard = new InlineKeyboard()
						.text(
							ctx.session.preferences.notifications
								? "🔔 Notifications ON"
								: "🔕 Notifications OFF",
							"toggle_notifications",
						)
						.row()
						.text("Add Favorite Stock", "add_favorite")
						.row()
						.text("View Favorites", "view_favorites");

					await ctx.editMessageText(
						`Settings updated. Notifications are now ${ctx.session.preferences.notifications ? "enabled" : "disabled"}.`,
						{ reply_markup: keyboard },
					);
					break;
				}

				case data === "add_favorite": {
					ctx.session.lastCommand = "add_favorite";
					await ctx.reply("Please enter a stock symbol to add to favorites:");
					break;
				}

				case data === "view_favorites": {
					const favorites = ctx.session.preferences?.favoriteStocks || [];

					if (favorites.length === 0) {
						await ctx.reply(
							'You have no favorite stocks. Use "Add Favorite Stock" to add some.',
						);
					} else {
						await ctx.reply(
							`<b>Your Favorite Stocks:</b>\n\n${favorites.join("\n")}`,
							{ parse_mode: "HTML" },
						);
					}
					break;
				}
				case data === "top_all": {
					const message = await generateAllTopsSummary("html");
					await ctx.reply(message, { parse_mode: "HTML" });
					break;
				}

				case data === "top_gainers":
					await this.sendTopGainers(ctx);
					break;

				case data === "top_losers":
					await this.sendTopLosers(ctx);
					break;

				case data === "top_turnover":
					await this.sendTopTurnover(ctx);
					break;

				case data === "top_traded":
					await this.sendTopTraded(ctx);
					break;

				case data === "top_transactions":
					await this.sendTopTransactions(ctx);
					break;

				default:
					await ctx.reply(
						`I'm not sure what you mean. Type /help to see available commands.`,
					);
			}
		});

		// Handle text messages (for commands that need additional input)
		this.bot.on("message:text", async (ctx) => {
			// Skip if it's a command
			if (ctx.message.text.startsWith("/")) {
				return;
			}

			// Handle adding favorite stock
			if (ctx.session.lastCommand === "add_favorite") {
				const symbol = ctx.message.text.trim().toUpperCase();

				if (!ctx.session.preferences) {
					ctx.session.preferences = { notifications: true, favoriteStocks: [] };
				}

				if (!ctx.session.preferences.favoriteStocks) {
					ctx.session.preferences.favoriteStocks = [];
				}

				// Add to favorites if not already there
				if (ctx.session.preferences.favoriteStocks.includes(symbol)) {
					await ctx.reply(`${symbol} is already in your favorites.`);
				} else {
					ctx.session.preferences.favoriteStocks.push(symbol);
					await ctx.reply(`Added ${symbol} to your favorites!`);
				}

				// Clear the last command
				ctx.session.lastCommand = undefined;
			}
		});
	}

	/**
	 * Set up interactive menus
	 */
	private setupMenus(): void {
		if (!this.bot) {
			return;
		}

		// Create a menu for market data
		const marketMenu = new Menu<BotContext>("market-menu")
			.text("Market Summary", async (ctx) => {
				const message = await generateMarketSummary();
				await ctx.reply(message, { parse_mode: "HTML" });
			})
			.row()
			.text("Indices", async (ctx) => {
				const keyboard = [
					[{ text: "All Indices", callback_data: "index_all" }],
					...nepseIndexes.map((index) => [
						{
							text: index,
							callback_data: `index_${index}`,
						},
					]),
				];

				await ctx.reply("Please select an index to view details:", {
					reply_markup: {
						inline_keyboard: keyboard,
					},
				});
			})
			.row()
			.text("Top Gainers", async (ctx) => {
				await this.sendTopGainers(ctx);
			})
			.text("Top Losers", async (ctx) => {
				await this.sendTopLosers(ctx);
			})
			.row()
			.text("Top Turnover", async (ctx) => {
				await this.sendTopTurnover(ctx);
			})
			.text("Most Traded", async (ctx) => {
				await this.sendTopTraded(ctx);
			});

		// Register the menu with the bot
		this.bot.use(marketMenu);

		// Add a command to access the menu
		this.bot.command("menu", async (ctx) => {
			await ctx.reply("Market Data Menu:", {
				reply_markup: marketMenu,
			});
		});
	}

	/**
	 * Set up error handling
	 */
	private setupErrorHandling(): void {
		if (!this.bot) {
			return;
		}

		this.bot.catch((err) => {
			const ctx = err.ctx;
			console.error(`Error while handling update ${ctx.update.update_id}:`);

			if (err instanceof GrammyError) {
				console.error("Error in request:", err.description);
				Sentry.captureException(err);
			} else if (err instanceof HttpError) {
				console.error("Could not contact Telegram:", err);
				Sentry.captureException(err);
			} else {
				console.error("Unknown error:", err);
				Sentry.captureException(err);
			}
		});
	}

	private async sendIndexInfo(ctx: BotContext, indexName: IndexKey) {
		try {
			const message = await generateIndexSummary(indexName, "html");
			await ctx.reply(message, { parse_mode: "HTML" });
		} catch (error) {
			console.error(`Error sending index info for ${indexName}:`, error);
			await ctx.reply(`Unable to fetch data for ${indexName} at this time.`);
		}
	}

	async sendTopGainers(ctx: BotContext): Promise<void> {
		try {
			const message = await generateTopSummary("gainers", "html");
			await ctx.reply(message, { parse_mode: "HTML" });
		} catch (error) {
			console.error("Error sending top gainers:", error);
			await ctx.reply("Unable to fetch top gainers at this time.");
		}
	}

	async sendTopLosers(ctx: BotContext): Promise<void> {
		try {
			const message = await generateTopSummary("losers", "html");
			await ctx.reply(message, { parse_mode: "HTML" });
		} catch (error) {
			console.error("Error sending top losers:", error);
			await ctx.reply("Unable to fetch top losers at this time.");
		}
	}

	async sendTopTurnover(ctx: BotContext): Promise<void> {
		try {
			const message = await generateTopSummary("turnovers", "html");
			await ctx.reply(message, { parse_mode: "HTML" });
		} catch (error) {
			console.error("Error sending top turnover:", error);
			await ctx.reply("Unable to fetch top turnover at this time.");
		}
	}

	async sendTopTraded(ctx: BotContext): Promise<void> {
		try {
			const message = await generateTopSummary("traded", "html");
			await ctx.reply(message, { parse_mode: "HTML" });
		} catch (error) {
			console.error("Error sending top traded:", error);
			await ctx.reply("Unable to fetch top traded at this time.");
		}
	}

	async sendTopTransactions(ctx: BotContext): Promise<void> {
		try {
			const message = await generateTopSummary("transactions", "html");
			await ctx.reply(message, { parse_mode: "HTML" });
		} catch (error) {
			console.error("Error sending top transactions:", error);
			await ctx.reply("Unable to fetch top transactions at this time.");
		}
	}

	/**
	 * Send a message to the configured Telegram channel
	 */
	async sendMessage(
		message: string,
		options: {
			disableNotification?: boolean;
			disableWebPagePreview?: boolean;
			parseMode?: "HTML" | "Markdown" | "MarkdownV2";
		} = {},
	): Promise<boolean> {
		if (!this.config.enabled || !this.bot) {
			return false;
		}

		try {
			const {
				disableNotification = false,
				disableWebPagePreview = false,
				parseMode,
			} = options;

			await this.bot.api.sendMessage(this.config.channelId, message, {
				disable_notification: disableNotification,
				parse_mode: parseMode,
				...(disableWebPagePreview ? { disable_web_page_preview: true } : {}),
			});

			return true;
		} catch (error) {
			Sentry.captureException(error);
			console.error("Error sending Telegram message:", error);
			return false;
		}
	}

	/**
	 * Check if the Telegram bot is enabled
	 */
	isEnabled(): boolean {
		return this.config.enabled && this.isInitialized;
	}

	/**
	 * Format a message for Telegram
	 */
	formatTelegramMessage(title: string, message: string, link?: string): string {
		let formattedMessage = `<b>${title}</b>\n\n${message}`;

		if (link) {
			formattedMessage += `\n\n<a href="${link}">View Details</a>`;
		}

		return formattedMessage;
	}
}

// Export singleton instance
export const telegramBot = TelegramBot.getInstance();
