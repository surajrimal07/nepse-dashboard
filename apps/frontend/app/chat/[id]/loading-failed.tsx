export default function FailedToLoad() {
	return (
		<div className="flex flex-col items-center justify-center h-full p-6 text-center">
			<div className="text-2xl font-semibold">Failed to load chat</div>

			<p className="mt-2 text-sm text-neutral-500">
				We couldn’t load this chat. It may have been deleted or you may have
				lost connection.
			</p>
		</div>
	);
}
