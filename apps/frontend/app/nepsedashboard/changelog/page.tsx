"use client";

import {
	ArrowLeft,
	BarChart3,
	Bot,
	Bug,
	ChevronDown,
	Lock,
	MessageSquare,
	Rocket,
	Shield,
	Sparkles,
	TrendingUp,
	Users,
	Zap,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";

interface ChangelogEntry {
	version: string;
	date: string;
	isLatest?: boolean;
	sections: {
		title: string;
		icon: React.ComponentType<{ className?: string }>;
		color: string;
		items: string[];
	}[];
}

const changelog: ChangelogEntry[] = [
	{
		version: "0.8.0",
		date: "Dec 28, 2025",
		isLatest: true,
		sections: [
			{
				title: "New Platform Support",
				icon: Rocket,
				color: "text-purple-400",
				items: [
					"Full NaasaX trading platform auto-login support",
					"NaasaX auto-save credentials on successful manual login",
					"Smart retry with backoff for NaasaX login attempts",
					"Enhanced error handling for NaasaX authentication",
				],
			},
			{
				title: "AI Chat Assistant",
				icon: Bot,
				color: "text-blue-400",
				items: [
					"AI-powered chat assistant for market insights",
					"BYOK (Bring Your Own Key) support for OpenAI/Anthropic",
					"Screenshot capture and web content extraction for AI context",
					"Persistent chat sessions across extension usage",
				],
			},
			{
				title: "Enhanced Auto-Login",
				icon: Lock,
				color: "text-emerald-400",
				items: [
					"Improved TMS CAPTCHA solving with better accuracy",
					"Meroshare auto-login with robust error recovery",
					"Auto-save credentials on manual login across all platforms",
					"Account error detection and intelligent pause/resume",
					"Backoff timer for failed login attempts",
				],
			},
			{
				title: "Community Features",
				icon: Users,
				color: "text-pink-400",
				items: [
					"Community chat for NEPSE traders",
					"Real-time discussions and market talk",
				],
			},
		],
	},
	{
		version: "0.7.7",
		date: "Feb 20, 2025",
		sections: [
			{
				title: "Performance Optimizations",
				icon: Zap,
				color: "text-yellow-400",
				items: [
					"Improved overall speed and responsiveness",
					"Reduced memory usage for smoother operation",
					"Optimized state management with Zustand",
					"Better cleanup of observers and listeners",
				],
			},
			{
				title: "Enhanced User Interface",
				icon: Sparkles,
				color: "text-indigo-400",
				items: [
					"Improved sidepanel for easier navigation",
					"More fluid animations and transitions",
					"Better notifications for important market events",
					"Clearer display of market state information",
					"New navigation bar with quick access icons",
				],
			},
			{
				title: "Multi-View Market Data",
				icon: BarChart3,
				color: "text-cyan-400",
				items: [
					"Live multiple stocks charts in the same screen",
					"Live multiple market depths displayed simultaneously",
					"Improved chart rendering with Recharts",
				],
			},
		],
	},
	{
		version: "0.7.0",
		date: "Feb 11, 2025",
		sections: [
			{
				title: "Major Technical Upgrade",
				icon: Rocket,
				color: "text-purple-400",
				items: [
					"Completely rebuilt using React for smoother performance",
					"TanStack Router for seamless navigation",
					"TanStack Query for efficient data fetching and caching",
					"Faster loading times and better responsiveness",
					"More reliable data updates and connections",
				],
			},
			{
				title: "Enhanced Market Data",
				icon: TrendingUp,
				color: "text-green-400",
				items: [
					"Live market depth - see buy/sell orders in real-time",
					"Market sentiment indicators to understand trends",
					"Supply and demand analytics for better decision making",
					"Top gainers, losers, and most active stocks at a glance",
					"Real-time volume and turnover tracking",
					"All NEPSE sub-indices now available",
				],
			},
			{
				title: "Better User Experience",
				icon: Sparkles,
				color: "text-pink-400",
				items: [
					"Simplified account management interface",
					"Cleaner, more intuitive interface",
					"Smoother interactions and animations",
					"More responsive controls and buttons",
					"Keyboard shortcuts (Ctrl+Shift+P/S/O)",
				],
			},
			{
				title: "New Features",
				icon: MessageSquare,
				color: "text-blue-400",
				items: [
					"IPO tracker with current and upcoming issues",
					"Company details with full financials",
					"Disclosures and exchange messages",
					"High caps stock tracking",
					"Smart search overlay for quick stock lookup",
				],
			},
		],
	},
	{
		version: "0.6.5",
		date: "Dec 17, 2024",
		sections: [
			{
				title: "Live NEPSE Updates",
				icon: TrendingUp,
				color: "text-green-400",
				items: [
					"Live market graph with real-time updates",
					"Track live market index with OHLC data",
					"Monitor key market metrics (Open, High, Low, Close)",
					"See instant price changes and market movements",
					"Get market status indicators (Open/Closed)",
					"View total market turnover in real-time",
					"Dark Mode support throughout the extension",
				],
			},
		],
	},
	{
		version: "0.6.0",
		date: "Nov 28, 2024",
		sections: [
			{
				title: "Odd Lot Trading",
				icon: BarChart3,
				color: "text-orange-400",
				items: [
					"P2P odd lot order management",
					"Create buy and sell orders for odd lots",
					"View and manage your odd lot orders",
					"Bargain functionality for negotiations",
				],
			},
			{
				title: "Security Enhancements",
				icon: Shield,
				color: "text-emerald-400",
				items: [
					"Improved local storage encryption",
					"Better backup file security",
					"Enhanced Content Security Policy",
				],
			},
		],
	},
	{
		version: "0.5.0",
		date: "Oct 15, 2024",
		sections: [
			{
				title: "Core Features",
				icon: Lock,
				color: "text-blue-400",
				items: [
					"TMS auto-login with CAPTCHA solving",
					"Meroshare auto-login with DP selection",
					"Multiple account management",
					"Primary account per broker support",
					"Backup and restore functionality",
				],
			},
			{
				title: "Bug Fixes",
				icon: Bug,
				color: "text-red-400",
				items: [
					"Fixed CAPTCHA detection issues",
					"Improved form filling reliability",
					"Better error handling and notifications",
				],
			},
		],
	},
];

export default function ChangelogPage() {
	const [expandedVersions, setExpandedVersions] = useState<string[]>([
		changelog[0].version,
	]);

	const toggleVersion = (version: string) => {
		setExpandedVersions((prev) =>
			prev.includes(version)
				? prev.filter((v) => v !== version)
				: [...prev, version]
		);
	};

	return (
		<div className="min-h-screen bg-gradient-to-b from-[#0a0a0f] via-[#0f0f1a] to-[#1a1a2e] text-white">
			{/* Animated Background */}
			<div className="fixed inset-0 overflow-hidden pointer-events-none">
				<div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse" />
				<div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-1000" />
			</div>

			<main className="relative z-10 max-w-4xl mx-auto px-6 py-16">
				{/* Header */}
				<div className="text-center mb-16">
					<div className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 backdrop-blur-sm border border-white/10 rounded-full text-sm text-white/70 mb-6">
						<Rocket className="w-4 h-4" />
						Release History
					</div>
					<h1 className="text-4xl md:text-5xl font-extrabold mb-4 bg-gradient-to-r from-white via-purple-200 to-indigo-200 bg-clip-text text-transparent">
						Changelog
					</h1>
					<p className="text-xl text-white/60 max-w-2xl mx-auto">
						A detailed history of all changes, improvements, and new features
					</p>
				</div>

				{/* Timeline */}
				<div className="space-y-6">
					{changelog.map((entry, index) => (
						<div
							key={entry.version}
							className="relative"
						>
							{/* Timeline connector */}
							{index !== changelog.length - 1 && (
								<div className="absolute left-6 top-16 bottom-0 w-px bg-gradient-to-b from-white/20 to-transparent" />
							)}

							{/* Version Card */}
							<div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl overflow-hidden hover:bg-white/[0.07] transition-all duration-300">
								{/* Header */}
								<button
									onClick={() => toggleVersion(entry.version)}
									className="w-full px-6 py-5 flex items-center justify-between hover:bg-white/5 transition-colors"
								>
									<div className="flex items-center gap-4">
										<div
											className={`w-12 h-12 rounded-xl flex items-center justify-center ${
												entry.isLatest
													? "bg-gradient-to-br from-purple-500 to-pink-500"
													: "bg-white/10"
											}`}
										>
											<span className="text-lg font-bold">
												{entry.version.split(".")[1]}
											</span>
										</div>
										<div className="text-left">
											<div className="flex items-center gap-3">
												<h2 className="text-xl font-bold">
													Version {entry.version}
												</h2>
												{entry.isLatest && (
													<span className="px-2 py-0.5 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full text-xs font-medium">
														Latest
													</span>
												)}
											</div>
											<span className="text-white/50 text-sm">
												{entry.date}
											</span>
										</div>
									</div>
									<ChevronDown
										className={`w-5 h-5 text-white/50 transition-transform duration-300 ${
											expandedVersions.includes(entry.version)
												? "rotate-180"
												: ""
										}`}
									/>
								</button>

								{/* Content */}
								{expandedVersions.includes(entry.version) && (
									<div className="px-6 pb-6 space-y-6">
										{entry.sections.map((section, sIndex) => (
											<div key={sIndex}>
												<div className="flex items-center gap-3 mb-3">
													<section.icon
														className={`w-5 h-5 ${section.color}`}
													/>
													<h3
														className={`text-lg font-semibold ${section.color}`}
													>
														{section.title}
													</h3>
												</div>
												<ul className="space-y-2 ml-8">
													{section.items.map((item, iIndex) => (
														<li
															key={iIndex}
															className="flex items-start gap-3 text-white/70"
														>
															<span className="w-1.5 h-1.5 rounded-full bg-white/40 mt-2 flex-shrink-0" />
															<span>{item}</span>
														</li>
													))}
												</ul>
											</div>
										))}
									</div>
								)}
							</div>
						</div>
					))}
				</div>

				{/* Expand/Collapse All */}
				<div className="flex justify-center gap-4 mt-10">
					<button
						onClick={() =>
							setExpandedVersions(changelog.map((c) => c.version))
						}
						className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white/60 hover:text-white hover:bg-white/10 transition-colors text-sm"
					>
						Expand All
					</button>
					<button
						onClick={() => setExpandedVersions([])}
						className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white/60 hover:text-white hover:bg-white/10 transition-colors text-sm"
					>
						Collapse All
					</button>
				</div>

				{/* Footer */}
				<footer className="mt-16 pt-8 border-t border-white/10">
					<Link
						href="/nepsedashboard"
						className="inline-flex items-center gap-2 text-white/60 hover:text-white transition-colors"
					>
						<ArrowLeft className="h-4 w-4" />
						Back to Home
					</Link>
				</footer>
			</main>
		</div>
	);
}
