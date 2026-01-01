import { CardContent } from "@nepse-dashboard/ui/components/card";
import { Label } from "@nepse-dashboard/ui/components/label";
import { Separator } from "@nepse-dashboard/ui/components/separator";
import { Switch } from "@nepse-dashboard/ui/components/switch";
import { useAppState } from "@/hooks/use-app";

export default function NepseSettings() {
	const { useStateItem } = useAppState();

	const [showTime, setShowTime] = useStateItem("showTime");

	const [stockScrolling, setStockScrolling] = useStateItem(
		"stockScrollingPopup",
	);

	const [stockScrollingSidepane, setStockScrollingSidepane] = useStateItem(
		"stockScrollingInSidepanel",
	);

	return (
		<CardContent className="space-y-3 mt-2">
			<div className="flex items-center justify-between">
				<div className="space-y-0.5">
					<Label className="text-base">Show Time</Label>
					<p className="text-sm text-muted-foreground">
						Toggle and select time format
					</p>
				</div>
				<div className="flex items-center gap-2">
					<Switch
						checked={showTime.enabled}
						onCheckedChange={(checked) =>
							setShowTime({ ...showTime, enabled: checked })
						}
					/>
					<select
						className="border rounded px-2 py-1 text-sm bg-background"
						value={showTime.type}
						onChange={(e) =>
							setShowTime({
								...showTime,
								type: e.target.value as "currentTime" | "countdown",
							})
						}
						disabled={!showTime.enabled}
					>
						<option value="currentTime">Current Time</option>
						<option value="countdown">Countdown</option>
					</select>
				</div>
			</div>
			<Separator />
			<div className="flex items-center justify-between">
				<div className="space-y-0.5">
					<Label className="text-base">Stock Scrolling - popup</Label>
					<p className="text-sm text-muted-foreground">
						Enable scrolling stock ticker in popup
					</p>
				</div>
				<Switch
					checked={stockScrolling}
					onCheckedChange={(checked) => setStockScrolling(checked)}
				/>
			</div>
			<Separator />

			<div className="flex items-center justify-between">
				<div className="space-y-0.5">
					<Label className="text-base">Stock Scrolling - sidepanel</Label>
					<p className="text-sm text-muted-foreground">
						Enable scrolling stock ticker in sidepanel
					</p>
				</div>
				<Switch
					checked={stockScrollingSidepane}
					onCheckedChange={(checked) => setStockScrollingSidepane(checked)}
				/>
			</div>
			<Separator />
		</CardContent>
	);
}
