import { Button } from "@nepse-dashboard/ui/components/button";
import { Switch } from "@nepse-dashboard/ui/components/switch";
import { ChevronDown } from "lucide-react";
import type { FC } from "react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { AccountType } from "@/types/account-types";

export const SettingsPanel: FC = () => {
	const { useStateItem, callAction } = useAppState();
	const [autofills] = useStateItem("autofills");
	const [autoSaveNewAccount] = useStateItem("autoSaveNewAccount");

	const [syncPortfolio] = useStateItem("syncPortfolio");
	const [isExpanded, setIsExpanded] = useState(false);

	const tmsAutofill = autofills?.[AccountType.TMS] ?? true;
	const naasaxAutofill = autofills?.[AccountType.NAASAX] ?? true;
	const meroAutofill = autofills?.[AccountType.MEROSHARE] ?? true;

	const settings = [
		{
			id: "tms",
			label: "TMS Autofill",
			checked: tmsAutofill,
			onChange: async (value: boolean) => {
				await callAction("setTmsAutofill", value);
			},
		},
		{
			id: "naasax",
			label: "NaasaX Autofill",
			checked: naasaxAutofill,
			onChange: async (value: boolean) => {
				await callAction("setNaasaxAutofill", value);
			},
		},
		{
			id: "mero",
			label: "Meroshare Autofill",
			checked: meroAutofill,
			onChange: async (value: boolean) => {
				await callAction("setMeroAutofill", value);
			},
		},
		{
			id: "autosave",
			label: "Auto-save accounts",
			checked: autoSaveNewAccount,
			onChange: async (value: boolean) => {
				await callAction("setAutoSaveNewAccount", value);
			},
		},
		{
			id: "sync",
			label: "Sync Portfolio",
			checked: syncPortfolio,
			onChange: async (value: boolean) => {
				await callAction("setSyncPortfolio", value);
			},
		},
	];

	return (
		<div className="mb-1 bg-gray-50 border border-gray-200 rounded-md overflow-hidden">
			<Button
				variant="ghost"
				onClick={() => setIsExpanded(!isExpanded)}
				className="w-full justify-between p-3 h-auto hover:bg-gray-100 font-semibold text-sm"
			>
				<div className="flex items-center gap-2">
					<span>⚙️ Settings</span>
				</div>
				<ChevronDown
					className={cn(
						"h-4 w-4 transition-transform duration-200",
						isExpanded && "transform rotate-180",
					)}
				/>
			</Button>

			{isExpanded && (
				<div className="p-3 pt-0 space-y-3 border-t border-gray-200">
					{settings.map((setting) => (
						<div key={setting.id} className="flex items-center justify-between">
							<label
								htmlFor={setting.id}
								className="text-sm font-medium text-gray-700 cursor-pointer"
							>
								{setting.label}
							</label>
							<Switch
								id={setting.id}
								checked={setting.checked}
								onCheckedChange={setting.onChange}
							/>
						</div>
					))}
				</div>
			)}
		</div>
	);
};
