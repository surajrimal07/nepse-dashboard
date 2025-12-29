export function NoCompaniesFound() {
	return (
		<div className="flex flex-col items-center justify-center p-4 text-center">
			<p className="text-sm text-muted-foreground">
				No companies were found, please refine your search or try reloading the
				data.
			</p>
		</div>
	);
}
