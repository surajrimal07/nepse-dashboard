export function LoadingUI() {
	return (
		<div className="p-4 bg-white rounded-b-xl">
			<div className="text-center space-y-6">
				<div className="relative">
					<div className="w-12 h-12 mx-auto relative">
						<div className="absolute inset-0 border-4 border-gray-200 rounded-full"></div>
						<div className="absolute inset-0 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
						<div
							className="absolute inset-2 border-2 border-blue-300 border-t-transparent rounded-full animate-spin animate-reverse"
							style={{ animationDuration: "1.5s" }}
						></div>
					</div>
				</div>

				<div>
					<h3 className="text-lg font-semibold mb-3 text-gray-800">Loading</h3>
					<p className="text-sm leading-relaxed text-gray-600 mb-4">
						Initializing dashboard...
					</p>
				</div>

				<div className="flex justify-center gap-2">
					{[0, 1, 2].map((index) => (
						<div
							key={index}
							className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"
							style={{
								animationDelay: `${index * 0.2}s`,
								animationDuration: "1.4s",
							}}
						/>
					))}
				</div>
			</div>
		</div>
	);
}
