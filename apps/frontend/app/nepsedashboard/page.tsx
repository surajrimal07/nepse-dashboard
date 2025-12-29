"use client";

import { Button } from "@nepse-dashboard/ui/components/button";
import {
	ArrowRight,
	BarChart3,
	Bell,
	Bot,
	ChevronDown,
	Chrome,
	Download,
	Eye,
	Fingerprint,
	Github,
	Keyboard,
	Lock,
	MessageSquare,
	PieChart,
	RefreshCw,
	Save,
	Search,
	Shield,
	ShieldCheck,
	Sparkles,
	TrendingUp,
	Users,
	Wallet,
	X,
	Zap,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

const features = [
	{
		category: "Auto-Login & Credentials",
		icon: Fingerprint,
		color: "from-violet-500 to-purple-600",
		items: [
			{
				icon: Zap,
				title: "TMS CAPTCHA Solver",
				description:
					"AI-powered CAPTCHA solving for TMS portals with auto-retry and backoff",
			},
			{
				icon: Lock,
				title: "Meroshare Auto-Login",
				description:
					"Automatic credential filling with DP dropdown selection and error handling",
			},
			{
				icon: Sparkles,
				title: "NaasaX Support",
				description:
					"Full auto-login support for NaasaX trading platform",
			},
			{
				icon: Save,
				title: "Auto-Save Credentials",
				description:
					"Automatically saves your manually entered login credentials",
			},
			{
				icon: Users,
				title: "Multiple Accounts",
				description:
					"Manage unlimited accounts across all platforms with primary account support",
			},
		],
	},
	{
		category: "Live Market Data",
		icon: BarChart3,
		color: "from-emerald-500 to-teal-600",
		items: [
			{
				icon: TrendingUp,
				title: "Live NEPSE Index",
				description:
					"Real-time market updates with interactive charts and OHLC data",
			},
			{
				icon: Eye,
				title: "Market Depth",
				description:
					"Real-time buy/sell order book visualization for any stock",
			},
			{
				icon: PieChart,
				title: "Sentiment Analysis",
				description:
					"Market sentiment indicators and AI-powered predictions",
			},
			{
				icon: BarChart3,
				title: "Supply & Demand",
				description:
					"Visualize market supply and demand analytics for better decisions",
			},
			{
				icon: TrendingUp,
				title: "Top Traders",
				description:
					"Top gainers, losers, turnovers etc. at a glance",
			},
		],
	},
	{
		category: "AI & Intelligence",
		icon: Bot,
		color: "from-blue-500 to-indigo-600",
		items: [
			{
				icon: MessageSquare,
				title: "AI Chat Assistant",
				description:
					"Chat with AI about market status, stocks, and get trading insights",
			},
			{
				icon: Sparkles,
				title: "BYOK Support",
				description:
					"Bring Your Own Key - use your OpenAI/Anthropic API keys",
			},
			{
				icon: Search,
				title: "Smart Search",
				description:
					"Quick search overlay to find any stock instantly from any page",
			},
		],
	},
	{
		category: "Trading Tools",
		icon: Wallet,
		color: "from-amber-500 to-orange-600",
		items: [
			{
				icon: RefreshCw,
				title: "Odd Lot Trading",
				description:
					"P2P odd lot order management - buy and sell odd lots easily",
			},
			{
				icon: Bell,
				title: "IPO Tracker",
				description: "Track current and upcoming IPOs with all details",
			},
			{
				icon: BarChart3,
				title: "Company Details",
				description:
					"Detailed stock information, financials, and analysis",
			},
			{
				icon: TrendingUp,
				title: "Market Indices",
				description: "All NEPSE sub-indices at your fingertips",
			},
		],
	},
	{
		category: "Productivity",
		icon: Keyboard,
		color: "from-pink-500 to-rose-600",
		items: [
			{
				icon: Keyboard,
				title: "Keyboard Shortcuts",
				description: "Ctrl+Shift+P/S/O for instant access to popup, sidebar, options",
			},
			{
				icon: Download,
				title: "Backup & Restore",
				description:
					"Export and import all your accounts and settings easily",
			},
			{
				icon: Bell,
				title: "Smart Notifications",
				description: "Desktop and in-app notifications for market events",
			},
		],
	},
];

const platforms = [
	{
		name: "TMS Portals",
		description: "All 50+ broker TMS portals",
		pattern: "*-nepsetms.com.np",
	},
	{
		name: "Meroshare",
		description: "CDSC Meroshare portal",
		pattern: "meroshare.cdsc.com.np",
	},
	{
		name: "NaasaX",
		description: "NaasaX trading platform",
		pattern: "naasax.com",
	},
];

const stats = [
	{ value: "50+", label: "Supported Brokers" },
	{ value: "3", label: "Trading Platforms" },
	{ value: "20+", label: "Unique Features" },
	{ value: "100%", label: "Works Locally" },
];

const faqs = [
	{
		question: "Is my data secure?",
		answer:
			"Absolutely! All your credentials are stored locally on your device using Chrome's secure storage API. No data is ever transmitted to external servers. The extension is open-source, so you can verify this yourself.",
	},
	{
		question: "What platforms are supported?",
		answer:
			"The extension supports all 50+ TMS broker portals, Meroshare (CDSC), and NaasaX trading platform. It automatically detects when you're on these sites and activates.",
	},
	{
		question: "Is it free?",
		answer:
			"Yes! The extension is completely free and open-source under the MIT license. You can use all features without any payment or subscription.",
	},
	{
		question: "How does the AI Chat work?",
		answer:
			"The AI Chat uses a Bring Your Own Key (BYOK) model. You provide your own OpenAI or Anthropic API key, giving you full control over costs and privacy.",
	},
	{
		question: "Can I use multiple accounts?",
		answer:
			"Yes! You can add unlimited accounts for each platform and set a primary account per broker for TMS and one primary for Meroshare for quick access.",
	},
];

export default function WelcomePage() {
	const [showPinReminder, setShowPinReminder] = useState<boolean>(false);
	const [openFaq, setOpenFaq] = useState<number | null>(null);

	useEffect(() => {
		const dismissed = localStorage.getItem("pinReminderDismissed") === "true";
		setShowPinReminder(!dismissed);
	}, []);

	const handleClosePinReminder = () => {
		setShowPinReminder(false);
		localStorage.setItem("pinReminderDismissed", "true");
	};

	return (
		<div className="min-h-screen bg-gradient-to-b from-[#0a0a0f] via-[#0f0f1a] to-[#1a1a2e] text-white overflow-hidden">
			{/* Animated Background Elements */}
			<div className="fixed inset-0 overflow-hidden pointer-events-none">
				<div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse" />
				<div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-1000" />
				<div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-radial from-indigo-500/5 to-transparent rounded-full" />
			</div>

			{/* Pin Reminder Banner */}
			{showPinReminder && (
				<div className="relative z-50 w-full bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white py-6 px-5 shadow-2xl">
					<div className="max-w-6xl mx-auto flex flex-col lg:flex-row items-center relative gap-8">
						<div className="flex-1 lg:pr-5">
							<Image
								src="https://cdn.surajrimal.dev/pin_dashboard.gif"
								alt="How to pin extension"
								width={500}
								height={300}
								className="w-full max-w-md rounded-2xl shadow-2xl border-2 border-white/20"
							/>
						</div>
						<div className="flex-1 lg:pl-5">
							<div className="text-3xl mb-4">👋 Welcome!</div>
							<h2 className="text-2xl font-bold mb-4">
								Get started in 3 simple steps:
							</h2>
							<ol className="space-y-4 text-lg">
								<li className="flex items-center gap-3">
									<span className="flex items-center justify-center w-8 h-8 bg-white/20 rounded-full font-bold">
										1
									</span>
									Click the extensions icon in your toolbar
								</li>
								<li className="flex items-center gap-3">
									<span className="flex items-center justify-center w-8 h-8 bg-white/20 rounded-full font-bold">
										2
									</span>
									Press the 📌 pin icon next to Nepse Dashboard
								</li>
								<li className="flex items-center gap-3">
									<span className="flex items-center justify-center w-8 h-8 bg-white/20 rounded-full font-bold">
										3
									</span>
									Click the icon anytime to access your dashboard
								</li>
							</ol>
						</div>
						<Button
							variant="ghost"
							size="sm"
							className="absolute top-0 right-0 text-white hover:bg-white/20 w-10 h-10 p-0 rounded-full"
							onClick={handleClosePinReminder}
						>
							<X className="h-5 w-5" />
						</Button>
					</div>
				</div>
			)}

			{/* Hero Section */}
			<section className="relative z-10 max-w-7xl mx-auto px-6 pt-20 pb-16 text-center">
				<div className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 backdrop-blur-sm border border-white/10 rounded-full text-sm text-white/70 mb-8">
					<span className="relative flex h-2 w-2">
						<span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
						<span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
					</span>
					Version 0.8.0 — Now with NaasaX Support & AI Chat
				</div>

				<h1 className="text-5xl md:text-7xl font-extrabold mb-6 bg-gradient-to-r from-white via-purple-200 to-indigo-200 bg-clip-text text-transparent">
					Nepse Dashboard
				</h1>

				<p className="text-xl md:text-2xl text-white/60 mb-8 max-w-3xl mx-auto leading-relaxed">
					The ultimate browser extension for NEPSE traders. Auto-login,
					live market data, AI insights, and powerful trading tools — all
					in one place.
				</p>

				<div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
					<Button
						size="lg"
						className="bg-gradient-to-r from-[#DB4437] to-[#ea4335] hover:from-[#c33c30] hover:to-[#d43d31] text-white px-8 py-6 text-lg rounded-xl shadow-lg shadow-red-500/20 hover:shadow-red-500/40 transition-all duration-300"
						asChild
					>
						<Link
							href="https://chromewebstore.google.com/detail/nepse-account-manager/efglamoipanaajcmhfeblhdbhciggojd"
							target="_blank"
						>
							<Chrome className="w-5 h-5 mr-2" />
							Add to Chrome
						</Link>
					</Button>
					<Button
						size="lg"
						className="bg-gradient-to-r from-[#FF9500] to-[#ff7b00] hover:from-[#e68600] hover:to-[#e66f00] text-white px-8 py-6 text-lg rounded-xl shadow-lg shadow-orange-500/20 hover:shadow-orange-500/40 transition-all duration-300"
						asChild
					>
						<Link
							href="https://addons.mozilla.org/en-US/firefox/addon/nepse-account-manager/"
							target="_blank"
						>
							<Image
								src="/firefox.png"
								alt="Firefox"
								width={20}
								height={20}
								className="mr-2"
							/>
							Add to Firefox
						</Link>
					</Button>
				</div>

				{/* Stats */}
				<div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
					{stats.map((stat, index) => (
						<div
							key={index}
							className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all duration-300"
						>
							<div className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
								{stat.value}
							</div>
							<div className="text-white/60 text-sm mt-1">{stat.label}</div>
						</div>
					))}
				</div>
			</section>

			{/* Features Grid */}
			<section className="relative z-10 max-w-7xl mx-auto px-6 py-20">
				<div className="text-center mb-16">
					<h2 className="text-4xl md:text-5xl font-bold mb-4">
						Packed with Features
					</h2>
					<p className="text-white/60 text-lg max-w-2xl mx-auto">
						Everything you need to streamline your NEPSE trading experience
					</p>
				</div>

				<div className="space-y-16">
					{features.map((category, catIndex) => (
						<div key={catIndex}>
							<div className="flex items-center gap-3 mb-8">
								<div
									className={`w-12 h-12 rounded-xl bg-gradient-to-br ${category.color} flex items-center justify-center`}
								>
									<category.icon className="w-6 h-6 text-white" />
								</div>
								<h3 className="text-2xl font-bold">{category.category}</h3>
							</div>

							<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
								{category.items.map((feature, index) => (
									<div
										key={index}
										className="group relative bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 hover:bg-white/10 hover:border-white/20 transition-all duration-300"
									>
										<div
											className={`w-10 h-10 rounded-xl bg-gradient-to-br ${category.color} opacity-80 flex items-center justify-center mb-4`}
										>
											<feature.icon className="w-5 h-5 text-white" />
										</div>
										<h4 className="text-lg font-semibold mb-2">
											{feature.title}
										</h4>
										<p className="text-white/60 text-sm leading-relaxed">
											{feature.description}
										</p>
									</div>
								))}
							</div>
						</div>
					))}
				</div>
			</section>

			{/* Supported Platforms */}
			<section className="relative z-10 max-w-7xl mx-auto px-6 py-20">
				<div className="text-center mb-12">
					<h2 className="text-4xl font-bold mb-4">Supported Platforms</h2>
					<p className="text-white/60 text-lg">
						Seamlessly works across all major NEPSE trading platforms
					</p>
				</div>

				<div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
					{platforms.map((platform, index) => (
						<div
							key={index}
							className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 text-center hover:scale-105 transition-transform duration-300"
						>
							<h3 className="text-xl font-bold mb-2">{platform.name}</h3>
							<p className="text-white/60 text-sm mb-3">
								{platform.description}
							</p>
							<code className="text-xs bg-white/10 px-3 py-1 rounded-full text-purple-300">
								{platform.pattern}
							</code>
						</div>
					))}
				</div>
			</section>

			{/* Security Section */}
			<section className="relative z-10 max-w-7xl mx-auto px-6 py-20">
				<div className="bg-gradient-to-br from-green-500/10 via-emerald-500/5 to-teal-500/10 border border-green-500/20 rounded-3xl p-10 md:p-16">
					<div className="flex items-center justify-center gap-3 mb-8">
						<ShieldCheck className="w-10 h-10 text-green-400" />
						<h2 className="text-3xl md:text-4xl font-bold">
							Privacy & Security First
						</h2>
					</div>

					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
						{[
							{
								icon: Lock,
								text: "100% local storage using Chrome's secure API",
							},
							{ icon: Shield, text: "Zero data transmission to external servers" },
							{ icon: Github, text: "Fully open-source for complete transparency" },
							{
								icon: Eye,
								text: "Optional anonymous analytics (easily disabled)",
							},
							{ icon: Users, text: "Minimal analytics for latency & error tracking only" },
							{
								icon: RefreshCw,
								text: "Full control with backup & restore",
							},
						].map((item, index) => (
							<div
								key={index}
								className="flex items-center gap-4 bg-white/5 rounded-xl p-4"
							>
								<div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center flex-shrink-0">
									<item.icon className="w-5 h-5 text-green-400" />
								</div>
								<span className="text-white/80">{item.text}</span>
							</div>
						))}
					</div>
				</div>
			</section>

			{/* FAQ Section */}
			<section className="relative z-10 max-w-4xl mx-auto px-6 py-20">
				<div className="text-center mb-12">
					<h2 className="text-4xl font-bold mb-4">
						Frequently Asked Questions
					</h2>
					<p className="text-white/60">
						Got questions? We&apos;ve got answers.
					</p>
				</div>

				<div className="space-y-4">
					{faqs.map((faq, index) => (
						<div
							key={index}
							className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl overflow-hidden"
						>
							<button
								className="w-full px-6 py-5 flex items-center justify-between text-left hover:bg-white/5 transition-colors"
								onClick={() => setOpenFaq(openFaq === index ? null : index)}
							>
								<span className="font-semibold text-lg">{faq.question}</span>
								<ChevronDown
									className={`w-5 h-5 text-white/60 transition-transform duration-300 ${openFaq === index ? "rotate-180" : ""}`}
								/>
							</button>
							{openFaq === index && (
								<div className="px-6 pb-5 text-white/70 leading-relaxed">
									{faq.answer}
								</div>
							)}
						</div>
					))}
				</div>
			</section>

			{/* CTA Section */}
			<section className="relative z-10 max-w-4xl mx-auto px-6 py-20 text-center">
				<div className="bg-gradient-to-r from-indigo-600/20 via-purple-600/20 to-pink-600/20 border border-white/10 rounded-3xl p-10 md:p-16">
					<h2 className="text-3xl md:text-4xl font-bold mb-4">
						Ready to supercharge your trading?
					</h2>
					<p className="text-white/60 text-lg mb-8">
						Join the traders who have streamlined their NEPSE experience
					</p>
					<div className="flex flex-col sm:flex-row gap-4 justify-center">
						<Button
							size="lg"
							className="bg-white text-black hover:bg-white/90 px-8 py-6 text-lg rounded-xl"
							asChild
						>
							<Link
								href="https://chromewebstore.google.com/detail/nepse-account-manager/efglamoipanaajcmhfeblhdbhciggojd"
								target="_blank"
							>
								Get Started Free
								<ArrowRight className="w-5 h-5 ml-2" />
							</Link>
						</Button>
						<Button
							size="lg"
							variant="outline"
							className="border-white/20 hover:bg-white/10 px-8 py-6 text-lg rounded-xl"
							asChild
						>
							<Link
								href="https://github.com/surajrimal07/tms-captcha"
								target="_blank"
							>
								<Github className="w-5 h-5 mr-2" />
								View on GitHub
							</Link>
						</Button>
					</div>
				</div>
			</section>

			{/* Disclaimer */}
			<section className="relative z-10 max-w-4xl mx-auto px-6 pb-10">
				<div className="bg-gradient-to-r from-amber-500/10 via-red-500/10 to-amber-500/10 border border-red-500/30 rounded-2xl p-6">
					<h3 className="text-lg font-bold text-red-400 mb-3 text-center">
						⚠️ Important Legal Disclaimer
					</h3>
					<div className="space-y-3 text-white/70 text-sm">
						<p className="text-center">
							This extension is <strong className="text-red-300">NOT affiliated with, endorsed by, or connected to</strong> Nepal Stock Exchange (NEPSE),
							Trading Management System (TMS), Meroshare/CDSC, or NaasaX.
						</p>
						<div className="bg-black/20 rounded-xl p-4 text-xs space-y-2">
							<p>
								<strong className="text-amber-300">PROVIDED &quot;AS IS&quot;:</strong> This software is provided without warranty of any kind.
								The author holds <strong className="text-red-300">NO LIABILITY</strong> for any damages, financial losses, or other claims.
							</p>
							<p>
								<strong className="text-amber-300">EDUCATIONAL USE ONLY:</strong> This is an independent, open-source tool for educational and exploratory purposes.
								Do not make trading decisions based solely on this tool.
							</p>
							<p>
								<strong className="text-amber-300">DATA SOURCES:</strong> Market data comes from publicly available third-party sources.
								NEPSE provides no official free API. Data accuracy and availability are NOT guaranteed.
							</p>
						</div>
						<p className="text-center text-white/50 text-xs">
							By using this extension, you accept these terms and use it at your own risk.
						</p>
					</div>
				</div>
			</section>

			{/* Emergency Contact */}
			<section className="relative z-10 max-w-4xl mx-auto px-6 pb-10">
				<p className="text-center text-white/50 text-sm">
					For emergency situations or urgent cases, please email the{" "}
					<a
						href="mailto:davidparkedme@gmail.com"
						className="text-purple-400 hover:text-purple-300 underline"
					>
						author
					</a>
				</p>
			</section>

			{/* Footer */}
			<footer className="relative z-10 border-t border-white/10 mt-10">
				<div className="max-w-7xl mx-auto px-6 py-10">
					<div className="flex flex-wrap justify-center gap-8 text-white/60">
						<Link
							href="/nepsedashboard/changelog"
							className="hover:text-white transition-colors flex items-center gap-2"
						>
							<RefreshCw className="w-4 h-4" />
							Changelog
						</Link>
						<Link
							href="/nepsedashboard/privacy"
							className="hover:text-white transition-colors flex items-center gap-2"
						>
							<Shield className="w-4 h-4" />
							Privacy Policy
						</Link>
						<Link
							href="/nepsedashboard/terms"
							className="hover:text-white transition-colors flex items-center gap-2"
						>
							<Lock className="w-4 h-4" />
							Terms of Service
						</Link>
						<Link
							href="https://github.com/surajrimal07/tms-captcha"
							target="_blank"
							className="hover:text-white transition-colors flex items-center gap-2"
						>
							<Github className="w-4 h-4" />
							GitHub
						</Link>
					</div>
					<div className="text-center text-white/40 text-sm mt-8">
						© {new Date().getFullYear()} Nepse Dashboard. Made with ❤️ for
						NEPSE traders.
					</div>
				</div>
			</footer>
		</div>
	);
}
