import {
	Tabs,
	TabsList,
	TabsTrigger,
} from "@nepse-dashboard/ui/components/tabs";
import { useRouter } from "@tanstack/react-router";
import { useCallback } from "react";
import {
	OPTION_TABS,
	type OptionTabsType,
} from "@/entrypoints/options/interface";
import { useGeneralState } from "@/state/general-state";

const OPTIONS_TABS = [
	{ label: "General", value: OPTION_TABS.GENERAL },
	{ label: "Market", value: OPTION_TABS.MARKET },
];

export function OptionsNavTabs() {
	const router = useRouter();

	const activeTabsOptions = useGeneralState((s) => s.activeTabsOptions);
	const setActiveTabsOptions = useGeneralState((s) => s.setActiveTabsOptions);

	const handleTabChange = useCallback(
		(value: string) => {
			const next = value as OptionTabsType;
			if (next === activeTabsOptions) return;

			setActiveTabsOptions(next);
			router.navigate({ to: `/options/${next}` });
		},
		[activeTabsOptions, router, setActiveTabsOptions],
	);
	return (
		<Tabs
			value={activeTabsOptions}
			defaultValue={OPTION_TABS.GENERAL}
			onValueChange={handleTabChange}
			className="w-full mb-4"
		>
			<TabsList className="w-full grid grid-cols-2 gap-1 px-1">
				{OPTIONS_TABS.map((tab) => (
					<TabsTrigger
						key={tab.value}
						value={tab.value}
						className={TAB_TRIGGER_STYLES}
					>
						{tab.label}
					</TabsTrigger>
				))}
			</TabsList>
		</Tabs>
	);
}
