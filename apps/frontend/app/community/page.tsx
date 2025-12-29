const CommunityChat = () => {
	return (
		<div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-900 to-black flex items-center justify-center p-2 sm:p-4">
			<div className="max-w-sm w-full bg-gray-800 rounded-xl shadow-2xl border border-gray-700 overflow-hidden">
				<div className="bg-gradient-to-r from-blue-500 to-purple-500 h-1.5"></div>

				<div className="p-6 text-center">
					<div className="mx-auto w-12 h-12 bg-gradient-to-r from-blue-900/50 to-purple-900/50 rounded-full flex items-center justify-center mb-4">
						{/** biome-ignore lint/a11y/noSvgWithoutTitle: <explanation> */}
						<svg
							className="w-6 h-6 text-blue-400"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth={2}
								d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a2 2 0 01-2-2v-1M15 8V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l4-4h2a2 2 0 002-2V8z"
							/>
						</svg>
					</div>

					<h1 className="text-xl font-bold text-white mb-3">Community Chat</h1>

					<p className="text-gray-300 mb-6 leading-relaxed text-sm">
						We&apos;re building something amazing! Our community chat feature is
						currently in development and will be available soon.
					</p>

					<div className="inline-flex items-center px-3 py-1.5 bg-amber-900/30 text-amber-300 rounded-full text-xs font-medium border border-amber-800/50">
						<div className="w-1.5 h-1.5 bg-amber-400 rounded-full mr-2 animate-pulse"></div>
						In Development
					</div>
				</div>
			</div>
		</div>
	);
};

export default CommunityChat;
