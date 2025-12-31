/** biome-ignore-all lint/a11y/noStaticElementInteractions: <iknow> */
/** biome-ignore-all lint/a11y/useKeyWithClickEvents: <iknow> */

import { ScrollArea } from "@nepse-dashboard/ui/components/scroll-area";
import { Skeleton } from "@nepse-dashboard/ui/components/skeleton";
import type { FC } from "react";
import { useId } from "react";
import { createPortal } from "react-dom";
import { useIndexNames } from "@/hooks/convex/useIndexNames";
import type { IndexKeys } from "@/types/indexes-type";

interface IndexSelectionDialogProps {
	isOpen: boolean;
	onClose: () => void;
	onIndexSelect?: (index: IndexKeys) => void;
}

function NotFound() {
	return (
		<div className="flex items-center justify-center h-full">
			<p className="text-sm text-gray-500 text-center">
				No indexes found or all added.
			</p>
		</div>
	);
}

function IndexSkeleton() {
	return (
		<div className="px-4 py-2 text-sm cursor-pointer rounded">
			<Skeleton className="h-6 w-full" />
		</div>
	);
}

const IndexSelectionDialog: FC<IndexSelectionDialogProps> = ({
	isOpen,
	onClose,
	onIndexSelect,
}) => {
	const descId = useId();

	const { data, isPending } = useIndexNames();

	if (!isOpen) return null;

	return createPortal(
		<div
			className="fixed inset-0 z-50 flex items-center justify-center animate-in fade-in zoom-in"
			onClick={onClose}
		>
			<div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />

			<div
				className="relative w-[300px] bg-background rounded-lg shadow-xl overflow-hidden"
				onClick={(e) => e.stopPropagation()}
			>
				<div className="px-4 py-2 border-b">
					<h2 className="text-lg font-semibold">Nepse Sub-Index</h2>
					<p className="text-sm text-muted-foreground">
						Select an index to add.
					</p>
				</div>
				<ScrollArea className="h-[300px] w-full">
					<div className="p-1">
						{isPending ? (
							<IndexSkeleton />
						) : data?.length === 0 ? (
							<NotFound />
						) : (
							data?.map((item) => (
								<div
									key={item.index}
									className="px-4 py-2 text-sm cursor-pointer rounded hover:bg-accent transition-colors"
									onClick={() => {
										onIndexSelect?.(item.index);
										onClose();
									}}
								>
									{item.index}
								</div>
							))
						)}
					</div>
				</ScrollArea>

				<div id={descId} className="sr-only">
					Select an index to add.
				</div>
			</div>
		</div>,
		document.body,
	);
};

export default IndexSelectionDialog;
