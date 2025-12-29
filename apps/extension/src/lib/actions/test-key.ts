import type { aiProvidersType } from "@nepse-dashboard/ai/types";
import { URLS } from "@/constants/app-urls";

export async function checkConfig(
	model: string,
	provider: aiProvidersType,
	key: string,
): Promise<{ success: boolean; message?: string }> {
	if (!model || !provider || !key) {
		return { success: false, message: "Missing parameters" };
	}

	try {
		const res = await fetch(`${URLS.inference_url}/api/check`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({ model, provider, key }),
		});

		const data = await res.json().catch(() => null);

		if (res.status !== 200 || !data?.success) {
			return {
				success: false,
				message: data?.message ?? "API check failed",
			};
		}

		return {
			success: true,
			message: data.message,
		};
	} catch (error) {
		return {
			success: false,
			message: error instanceof Error ? error.message : "Network error",
		};
	}
}
