interface LoadingProps {
	size?: number;
}

export default function Loading({ size = 70 }: LoadingProps) {
	return (
		<div className="absolute inset-0 flex items-center justify-center">
			<div
				className="inline-block animate-spin rounded-full border-4 border-solid border-primary border-e-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite] will-change-transform text-primary"
				role="progressbar"
				aria-label="Loading..."
				style={{
					width: size,
					height: size,
				}}
			>
				<span className="sr-only">Loading...</span>
			</div>
		</div>
	);
}
