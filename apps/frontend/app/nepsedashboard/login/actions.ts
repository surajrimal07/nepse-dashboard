"use server";

import { api } from "@nepse-dashboard/convex/convex/_generated/api";
import { fetchMutation } from "convex/nextjs";

interface VerifyMagicLinkResult {
	success: boolean;
	email: string;
	error?: string;
}

export async function verifyMagicLinkAction(
	otp: number,
): Promise<VerifyMagicLinkResult> {
	try {
		const key = process.env.NEXT_CONVEX_MUTATE_KEY;

		if (!key) {
			throw new Error("Mutation key is not set");
		}

		const result = await fetchMutation(api.email.handleMagicLink, { otp, key });
		return result as VerifyMagicLinkResult;
	} catch (error) {
		return {
			success: false,
			email: "",
			error: error instanceof Error ? error.message : "Verification failed",
		};
	}
}
