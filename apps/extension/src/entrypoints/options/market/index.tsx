import { CardContent } from "@nepse-dashboard/ui/components/card";
import { Label } from "@nepse-dashboard/ui/components/label";
import { Separator } from "@nepse-dashboard/ui/components/separator";
import { Switch } from "@nepse-dashboard/ui/components/switch";

export default function NepseSettings() {
	const { useStateItem } = useAppState();

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
