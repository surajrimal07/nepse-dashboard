import fs from "node:fs";
import path from "node:path";
import { api } from "@nepse-dashboard/convex/convex/_generated/api";
import { logger } from "@nepse-dashboard/logger";
import { convex } from "@/convex-client";
import { EventType } from "@/types/error-types";
import Track from "@/utils/analytics";
import { logosBucket } from "@/utils/storage";
import type { ApiResponse } from "./types";

const baseIconUrl = "https://cdn.arthakendra.com/";
const url = "https://sharehubnepal.com/live/api/v2/nepselive/live-nepse";

function fileExists(filePath: string): boolean {
	return fs.existsSync(filePath);
}

function getFileExtension(url: string): string {
	const match = url.match(/\.[0-9a-z]+$/i);
	return match ? match[0] : ".png"; // default to .png if no extension found
}

async function uploadToR2(
	buffer: Buffer,
	fileName: string,
	contentType: string = "image/png",
): Promise<boolean> {
	try {
		console.log(`Uploading to R2: ${fileName}`);
		await logosBucket.write(fileName, buffer, {
			type: contentType,
		});
		console.log(`✓ Uploaded to R2: ${fileName}`);
		return true;
	} catch (error) {
		console.error(`Error uploading to R2 ${fileName}:`, error);
		return false;
	}
}

async function downloadImage(
	imageUrl: string,
	filePath: string,
	fileName: string,
): Promise<boolean> {
	try {
		console.log(`Downloading: ${imageUrl}`);
		const response = await fetch(imageUrl);

		if (!response.ok) {
			const message = `Failed to download image: ${response.status} ${response.statusText}`;

			logger.error(message);

			Track(EventType.SERVER_ERROR, {
				function: "downloadImage",
				imageUrl,
				message,
			});

			return false;
		}

		const buffer = await response.arrayBuffer();
		const bufferData = Buffer.from(buffer);

		// Save to local filesystem
		fs.writeFileSync(filePath, bufferData);
		console.log(`✓ Saved locally: ${filePath}`);

		// Upload to R2
		const contentType = response.headers.get("content-type") || "image/png";
		const r2Success = await uploadToR2(bufferData, fileName, contentType);

		if (r2Success) {
			console.log(`✓ Saved to R2: ${fileName}`);
		} else {
			console.warn(`⚠ Failed to upload to R2: ${fileName}`);

			Track(EventType.SERVER_ERROR, {
				function: "downloadImage_uploadToR2",
				imageUrl,
				message: "Failed to upload to R2",
			});
		}

		return true;
	} catch (error) {
		const message = error instanceof Error ? error.message : "Unknown error";

		logger.error(message);

		Track(EventType.EXCEPTION, {
			function: "downloadImage",
			imageUrl,
			message,
			error,
		});

		return false;
	}
}

export const refreshStockLogos = async () => {
	try {
		const companiesNames = await convex.query(
			api.companyNames.getAllStockNames,
			{},
		);

		if (!companiesNames) {
			return;
		}

		console.log(`Found ${companiesNames.length} items to process`);

		const publicDir = path.join(process.cwd(), "public", "stockslogo");
		if (!fs.existsSync(publicDir)) {
			fs.mkdirSync(publicDir, { recursive: true });
		}

		const response = await fetch(url);

		if (!response.ok) {
			const message = `API request failed: ${response.status} ${response.statusText}`;
			Track(EventType.SERVER_ERROR, {
				function: "refreshStockLogos",
				message,
			});

			logger.error(message);

			throw new Error(message);
		}

		const data = (await response.json()) as ApiResponse;

		if (!data.success || !data.data) {
			Track(EventType.SERVER_ERROR, {
				function: "refreshStockLogos",
				message: "API response indicates failure or no data",
			});

			throw new Error("API response indicates failure or no data");
		}

		// Create a set of symbols from companiesNames for efficient lookup
		const companySymbols = new Set(
			companiesNames.map((company) => company.symbol),
		);

		// Filter API data to only include companies that exist in our companiesNames
		const filteredData = data.data.filter((item) =>
			companySymbols.has(item.symbol),
		);

		console.log(`Found ${data.data.length} total companies from API`);
		console.log(
			`Filtered to ${filteredData.length} companies that exist in our database`,
		);

		let downloaded = 0;
		let skipped = 0;
		let failed = 0;

		for (const item of filteredData) {
			if (!item.iconUrl || !item.symbol) {
				console.warn(`Skipping item with missing iconUrl or symbol:`, item);
				failed++;
				continue;
			}

			// Complete the icon URL
			const fullIconUrl = baseIconUrl + item.iconUrl;

			// Get file extension and create filename
			const fileExtension = getFileExtension(item.iconUrl);
			// Clean the symbol to remove invalid filename characters
			const cleanSymbol = item.symbol.replace(/[/\\:*?"<>|]/g, "_");
			const fileName = `${cleanSymbol}${fileExtension}`;
			const filePath = path.join(publicDir, fileName);

			// Check if file already exists
			if (fileExists(filePath)) {
				skipped++;
				continue;
			}

			// Download and save the image
			const success = await downloadImage(fullIconUrl, filePath, fileName);
			if (success) {
				downloaded++;
			} else {
				failed++;
			}

			// Add a small delay to be respectful to the server
			await new Promise((resolve) => setTimeout(resolve, 100));
		}

		console.log("\n📊 Summary:");
		console.log(`✓ Downloaded: ${downloaded}`);
		console.log(`⏭ Skipped (already exists): ${skipped}`);
		console.log(`❌ Failed: ${failed}`);
		console.log(`📁 Total processed: ${filteredData.length}`);
	} catch (error) {
		const message = error instanceof Error ? error.message : "Unknown error";
		logger.error(message);

		Track(EventType.EXCEPTION, {
			function: "refreshStockLogos",
			message,
			error,
		});

		return false;
	}
};
