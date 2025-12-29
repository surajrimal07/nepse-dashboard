"use node";
import { R2 } from "@convex-dev/r2";
import { ConvexError, v } from "convex/values";
import sharp from "sharp";
import { components, internal } from "./_generated/api";
import type { Id } from "./_generated/dataModel";
import { action } from "./_generated/server";

const r2 = new R2(components.r2);

export const get = action({
	args: {
		blob: v.string(),
		randId: v.optional(v.string()),
	},
	handler: async (ctx, args) => {
		if (!args.randId) {
			throw new ConvexError("randId is required.");
		}

		const screenshot = args.blob;
		const timestamp = Date.now();
		const randomChar = Math.random().toString(36).substring(2, 3);
		const filename = `${timestamp}_${randomChar}.jpg`;

		const brandingImagePath = "kg2b1ycavfggjsf95qsktymz8h7xfhha";

		const brandingImageFile = await ctx.storage.getUrl(
			brandingImagePath as Id<"_storage">,
		);

		if (!brandingImageFile) {
			return { error: "Branding image not found." };
		}

		const response = await fetch(brandingImageFile);
		const imageBuffer = await response.arrayBuffer();
		const brandingBuffer = Buffer.from(imageBuffer);

		const base64Data = screenshot.split(";base64,")[1];

		if (!base64Data) {
			throw new ConvexError("Invalid Base64 screenshot data received.");
		}

		const screenshotBuffer = Buffer.from(base64Data, "base64");

		// --- Start Sharp Processing ---
		const screenshotMeta = await sharp(screenshotBuffer).metadata();
		if (!(screenshotMeta.width && screenshotMeta.height)) {
			throw new Error("Could not read screenshot metadata.");
		}

		// Resize branding to match screenshot width
		const resizedBranding = await sharp(brandingBuffer)
			.resize({ width: screenshotMeta.width })
			.toBuffer(); // Assuming branding is JPG or doesn't need transparency preserved here

		const resizedBrandingMeta = await sharp(resizedBranding).metadata();
		if (!resizedBrandingMeta.height) {
			throw new Error("Could not read resized branding metadata.");
		}

		// Create the base composite image instance
		const compositeInstance = sharp(screenshotBuffer)
			.extend({
				bottom: resizedBrandingMeta.height, // Use definite height
				background: { r: 255, g: 255, b: 255, alpha: 1 },
			})
			.composite([
				{
					input: resizedBranding,
					top: screenshotMeta.height, // Use definite height
					left: 0,
				},
			]);

		// Generate PNG buffer
		const finalImageBufferPNG = await compositeInstance
			.clone()
			.png()
			.toBuffer();

		// Generate JPEG buffer
		const finalImageBufferJPEG = await compositeInstance.jpeg().toBuffer();

		// --- Upload JPEG to S3 ---
		const key = await r2.store(ctx, finalImageBufferJPEG, {
			key: filename,
			type: "image/jpeg",
		});

		const cdnUrl = `https://screenshots.nepsechatbot.com/${key}`;

		await ctx.runMutation(internal.internal.addScreenshot, {
			url: cdnUrl,
			randId: args.randId,
		});

		return {
			image: `data:image/png;base64,${Buffer.from(finalImageBufferPNG).toString(
				"base64",
			)}`,
			url: cdnUrl,
		};
	},
});
