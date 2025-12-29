import type { Company } from "@/types/company-types";

export function getShuffledCompany(companies: Company[]): Company[] {
	const result = [...companies];

	// Fisher-Yates shuffle algorithm
	for (let i = result.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		[result[i], result[j]] = [result[j], result[i]];
	}

	return result;
}
