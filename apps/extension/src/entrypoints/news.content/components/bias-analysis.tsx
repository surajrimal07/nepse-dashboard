import { Progress } from "@nepse-dashboard/ui/components/progress";

interface BiasAnalysisProps {
	score: number;
}

export function BiasAnalysis({ score }: BiasAnalysisProps) {
	return (
		<div className="space-y-2">
			<Progress value={score} className="h-2" />
		</div>
	);
}
