import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogTrigger,
} from "@nepse-dashboard/ui/components/alert-dialog";
import { Button } from "@nepse-dashboard/ui/components/button";
import { Trash } from "lucide-react";

export function DeleteChatButton({
	chatId,
	onConfirm,
}: {
	chatId: string;
	onConfirm: (id: string) => void;
}) {
	return (
		<AlertDialog>
			<AlertDialogTrigger asChild>
				<Button
					variant="ghost"
					className="
            opacity-0 group-hover:opacity-100 transition-opacity h-7 w-7 p-0
            rounded-md text-red-400 hover:text-red-300 hover:bg-red-950/30
          "
					title="Delete chat"
					aria-label="Delete chat"
				>
					<Trash className="h-3.5 w-3.5" />
				</Button>
			</AlertDialogTrigger>
			<AlertDialogContent>
				<AlertDialogHeader>
					<AlertDialogTitle>Delete this chat?</AlertDialogTitle>
					<AlertDialogDescription>
						This action cannot be undone. Your chat will be permanently deleted.
					</AlertDialogDescription>
				</AlertDialogHeader>

				<AlertDialogFooter>
					<AlertDialogCancel>Cancel</AlertDialogCancel>

					<AlertDialogAction onClick={() => onConfirm(chatId)}>
						Continue
					</AlertDialogAction>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	);
}
