// /** biome-ignore-all lint/style/noNonNullAssertion: <iknow> */
// import { toast } from "sonner";
// import { sendMessageToBackground } from "@/hooks/messageBackground";
// import type { Account, accountType } from "@/types/account-types";

// export async function getAutofills(): Promise<Record<accountType, boolean>> {
// 	const res = await sendMessageToBackground<Record<accountType, boolean>>(
// 		{ type: "autofills" },
// 		"autofill_fetch_error",
// 	);
// 	return res.data!;
// }

// export async function getUiVisibility(): Promise<Record<accountType, boolean>> {
// 	const res = await sendMessageToBackground<Record<accountType, boolean>>(
// 		{ type: "uiVisibility" },
// 		"uiVisibility_fetch_error",
// 	);
// 	return res.data!;
// }

// export async function getAutosavenewaccounts(): Promise<boolean> {
// 	const res = await sendMessageToBackground<boolean>(
// 		{ type: "autosavenewaccounts" },
// 		"autosavenewaccounts_fetch_error",
// 	);
// 	return res.data!;
// }

// export async function getSyncportfolio(): Promise<boolean> {
// 	const res = await sendMessageToBackground<boolean>(
// 		{ type: "syncportfolio" },
// 		"syncportfolio_fetch_error",
// 	);
// 	return res.data!;
// }

// export async function getAccounts(): Promise<Account[]> {
// 	const res = await sendMessageToBackground<Account[]>(
// 		{ type: "accounts" },
// 		"accounts_fetch_error",
// 	);
// 	return res.data!;
// }

// export async function useSetAutofill(
// 	value: boolean,
// 	brokertype: accountType = "tms",
// ): Promise<{
// 	success: boolean;
// 	message: string;
// }> {
// 	const result = await sendMessageToBackground<{
// 		success: boolean;
// 		message: string;
// 	}>({ type: "setAutofill", data: { value, brokertype } }, "setAutofill_error");
// 	toast[result.success ? "success" : "error"](result.message);
// 	return result;
// }

// export async function loadInitialData() {
// 	const [autofills, accounts, autosavenewaccounts, syncportfolio] =
// 		await Promise.all([
// 			getAutofills(),
// 			getAccounts(),
// 			getAutosavenewaccounts(),
// 			getSyncportfolio(),
// 		]);

// 	return {
// 		autofills,
// 		accounts,
// 		autosavenewaccounts,
// 		syncportfolio,
// 	};
// }
