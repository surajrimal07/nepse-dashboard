export function NoWidget() {
	return (
		<div className="flex flex-col items-center justify-center h-32 border border-dashed rounded-lg">
			<p className="text-muted-foreground text-sm">No widgets yet</p>
			<p className="text-muted-foreground text-xs">Click + to add a widget</p>
		</div>
	);
}

export default NoWidget;
