"use client";

import {
	AlertTriangle,
	ArrowLeft,
	ArrowRight,
	BarChart3,
	Bot,
	FileText,
	Github,
	Globe,
	Gavel,
	Lock,
	Mail,
	Scale,
	Shield,
	Smartphone,
	Users,
	Zap,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";

interface Section {
	id: string;
	number: number;
	title: string;
	icon: React.ComponentType<{ className?: string }>;
	content: React.ReactNode;
}

export default function TermsPage() {
	const [activeSection, setActiveSection] = useState<string | null>(null);

	const sections: Section[] = [
		{
			id: "scope",
			number: 1,
			title: "Extension Scope & Information",
			icon: Globe,
			content: (
				<div className="space-y-4">
					<p className="text-white/70">
						These terms apply exclusively to the browser extension &quot;Nepse
						Dashboard&quot; (formerly known as &quot;Nepse Account Manager&quot;).
					</p>
					<div className="bg-white/5 rounded-xl p-4">
						<h4 className="font-semibold mb-3">
							The Extension functions on these domains:
						</h4>
						<ul className="space-y-2 text-white/70">
							<li className="flex items-center gap-2">
								<span className="w-2 h-2 bg-emerald-400 rounded-full" />
								<code className="text-emerald-300">*.nepsetms.com.np</code> —
								All 50+ broker TMS portals
							</li>
							<li className="flex items-center gap-2">
								<span className="w-2 h-2 bg-emerald-400 rounded-full" />
								<code className="text-emerald-300">meroshare.cdsc.com.np</code>{" "}
								— Meroshare/CDSC portal
							</li>
							<li className="flex items-center gap-2">
								<span className="w-2 h-2 bg-emerald-400 rounded-full" />
								<code className="text-emerald-300">naasax.com</code> — NaasaX
								trading platform
							</li>
						</ul>
					</div>
					<p className="text-white/60 text-sm">
						The Extension is not designed to and will not function on any
						other websites. It will only activate when you visit the
						supported platforms listed above.
					</p>
				</div>
			),
		},
		{
			id: "service",
			number: 2,
			title: "Description of Service",
			icon: Zap,
			content: (
				<div className="space-y-4">
					<p className="text-white/70">
						The Extension provides the following features and services:
					</p>
					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						{[
							{
								icon: Lock,
								title: "Auto-Login & Credentials",
								items: [
									"TMS login with CAPTCHA solving",
									"Meroshare auto-login with DP selection",
									"NaasaX auto-login support",
									"Multi-account management",
								],
							},
							{
								icon: BarChart3,
								title: "Market Data",
								items: [
									"Live NEPSE index updates",
									"Market depth visualization",
									"Supply & demand analytics",
									"Top traders tracking",
								],
							},
							{
								icon: Bot,
								title: "AI Features",
								items: [
									"AI chat assistant (BYOK)",
									"Market insights and analysis",
									"Smart search functionality",
								],
							},
							{
								icon: Users,
								title: "Trading Tools",
								items: [
									"Odd lot trading P2P",
									"IPO tracker",
									"Disclosures and news",
									"Community features",
								],
							},
						].map((category, index) => (
							<div key={index} className="bg-white/5 rounded-xl p-4">
								<div className="flex items-center gap-2 mb-3">
									<category.icon className="w-5 h-5 text-purple-400" />
									<h4 className="font-semibold">{category.title}</h4>
								</div>
								<ul className="space-y-1 text-white/60 text-sm">
									{category.items.map((item, i) => (
										<li key={i}>• {item}</li>
									))}
								</ul>
							</div>
						))}
					</div>
				</div>
			),
		},
		{
			id: "open-source",
			number: 3,
			title: "Open Source Nature",
			icon: Github,
			content: (
				<div className="space-y-4">
					<p className="text-white/70">
						This Extension is open-source software under the MIT License.
					</p>
					<div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 border border-white/10 rounded-xl p-6">
						<div className="flex items-center gap-4 mb-4">
							<Github className="w-8 h-8" />
							<div>
								<h4 className="font-semibold">surajrimal07/tms-captcha</h4>
								<p className="text-white/60 text-sm">MIT License</p>
							</div>
						</div>
						<div className="grid grid-cols-2 gap-4 text-white/70 text-sm">
							<div>
								<span className="text-green-400">✓</span> Source code publicly
								available
							</div>
							<div>
								<span className="text-green-400">✓</span> Inspect code for
								security
							</div>
							<div>
								<span className="text-green-400">✓</span> Community contributions
								welcome
							</div>
							<div>
								<span className="text-green-400">✓</span> Available for
								educational use
							</div>
						</div>
					</div>
				</div>
			),
		},
		{
			id: "user-data",
			number: 4,
			title: "User Data & Responsibility",
			icon: Shield,
			content: (
				<div className="space-y-4">
					<p className="text-white/70">
						By using this Extension, you acknowledge and accept the following:
					</p>
					<div className="space-y-3">
						{[
							{
								title: "Local Storage",
								desc: "All credentials are stored locally on your device using Chrome's secure storage API",
								type: "info",
							},
							{
								title: "Backup Responsibility",
								desc: "Backup files contain plain text credentials — you are responsible for keeping backups secure",
								type: "warning",
							},
							{
								title: "No External Transmission",
								desc: "The Extension does not transmit credentials to any external servers",
								type: "info",
							},
							{
								title: "Security Responsibility",
								desc: "You are responsible for the security of your stored credentials and device",
								type: "warning",
							},
							{
								title: "No Guarantees",
								desc: "The Extension does not guarantee the absolute security of stored data",
								type: "warning",
							},
							{
								title: "AI Features (BYOK)",
								desc: "You are responsible for your own API keys and any costs incurred through AI usage",
								type: "info",
							},
						].map((item, index) => (
							<div
								key={index}
								className={`rounded-xl p-4 flex items-start gap-3 ${
									item.type === "warning"
										? "bg-amber-500/10 border border-amber-500/30"
										: "bg-white/5"
								}`}
							>
								<span
									className={`text-lg ${
										item.type === "warning"
											? "text-amber-400"
											: "text-blue-400"
									}`}
								>
									{item.type === "warning" ? "⚠️" : "ℹ️"}
								</span>
								<div>
									<h4 className="font-semibold">{item.title}</h4>
									<p className="text-white/60 text-sm">{item.desc}</p>
								</div>
							</div>
						))}
					</div>
				</div>
			),
		},
		{
			id: "analytics",
			number: 5,
			title: "Analytics & Data Collection",
			icon: BarChart3,
			content: (
				<div className="space-y-4">
					<p className="text-white/70">
						The Extension collects the following data to improve service quality:
					</p>
					<div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-5">
						<h4 className="font-semibold text-blue-400 mb-3">Data Collected</h4>
						<ul className="space-y-3">
							<li className="flex items-start gap-3">
								<span className="text-blue-400 mt-0.5">📍</span>
								<div>
									<span className="text-white/90 font-medium">Location Data</span>
									<p className="text-white/60 text-sm">IP address, city, region, country — used exclusively to monitor connection latency and plan infrastructure improvements</p>
								</div>
							</li>
							<li className="flex items-start gap-3">
								<span className="text-blue-400 mt-0.5">📧</span>
								<div>
									<span className="text-white/90 font-medium">Email (Optional)</span>
									<p className="text-white/60 text-sm">Only if voluntarily provided — used for user identification and support</p>
								</div>
							</li>
							<li className="flex items-start gap-3">
								<span className="text-blue-400 mt-0.5">🔧</span>
								<div>
									<span className="text-white/90 font-medium">Error & Event Tracking</span>
									<p className="text-white/60 text-sm">Anonymous error reports, feature usage, and extension events — helps identify and fix bugs quickly</p>
								</div>
							</li>
							<li className="flex items-start gap-3">
								<span className="text-blue-400 mt-0.5">🆔</span>
								<div>
									<span className="text-white/90 font-medium">Random User ID</span>
									<p className="text-white/60 text-sm">Locally generated identifier for analytics — NOT linked to personal identity</p>
								</div>
							</li>
						</ul>
					</div>
					<div className="bg-white/5 rounded-xl p-5">
						<h4 className="font-semibold mb-3">Important Guarantees</h4>
						<ul className="space-y-2">
							{[
								"Credentials (usernames/passwords) are NEVER collected or transmitted",
								"Browsing history and website content are NOT tracked",
								"No keystrokes, clicks, or user activity monitoring",
								"Data is NOT sold or shared with third parties",
								"Analytics processed via OpenPanel (privacy-focused platform)",
								"Sole developer uses data exclusively for product improvement",
							].map((item, index) => (
								<li key={index} className="flex items-center gap-3">
									<span className="w-6 h-6 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0">
										<span className="text-green-400 text-xs">✓</span>
									</span>
									<span className="text-white/70">{item}</span>
								</li>
							))}
						</ul>
					</div>
				</div>
			),
		},
		{
			id: "limitations",
			number: 6,
			title: "Disclaimer & Limitations",
			icon: Scale,
			content: (
				<div className="space-y-4">
					{/* Strong Legal Disclaimer */}
					<div className="bg-red-500/10 border border-red-500/40 rounded-xl p-5">
						<h4 className="font-bold text-red-400 mb-3 flex items-center gap-2">
							<AlertTriangle className="w-5 h-5" />
							IMPORTANT LEGAL DISCLAIMER
						</h4>
						<div className="space-y-3 text-white/80 text-sm">
							<p>
								<strong className="text-red-300">THE SOFTWARE IS PROVIDED &quot;AS IS&quot;</strong>, without warranty of any kind,
								express or implied, including but not limited to the warranties of merchantability,
								fitness for a particular purpose, and noninfringement.
							</p>
							<p>
								<strong className="text-red-300">THE AUTHOR HOLDS NO LIABILITY</strong> for any claim, damages,
								financial losses, or other liability arising from the use of this software,
								including but not limited to: trading losses, missed opportunities, incorrect data,
								service interruptions, or any other direct or indirect damages.
							</p>
							<p>
								<strong className="text-red-300">THIS SOFTWARE IS FOR EDUCATIONAL AND EXPLORATORY PURPOSES ONLY.</strong> It
								should not be used as the sole basis for any financial or trading decisions.
							</p>
						</div>
					</div>

					{/* Data Source Disclaimer */}
					<div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-5">
						<h4 className="font-bold text-amber-400 mb-3">Third-Party Data Sources</h4>
						<div className="space-y-2 text-white/70 text-sm">
							<p>
								This extension relies on publicly available data sources for market information.
								<strong className="text-amber-300"> NEPSE does not provide an official free API</strong> for projects like this,
								therefore:
							</p>
							<ul className="space-y-1 mt-2">
								<li>• Data accuracy is NOT guaranteed and may contain errors</li>
								<li>• Data availability may be interrupted without notice</li>
								<li>• Third-party sources may change, break, or become unavailable at any time</li>
								<li>• Real-time data may be delayed or incomplete</li>
								<li>• The author has no control over upstream data sources</li>
							</ul>
						</div>
					</div>

					<p className="text-white/70">
						Please be aware of the following limitations:
					</p>
					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						{[
							{
								title: "No Warranty",
								desc: 'The Extension is provided "AS IS" without warranties of any kind, express or implied',
							},
							{
								title: "No Uptime Guarantee",
								desc: "No guarantee of continuous, uninterrupted access to the service or data",
							},
							{
								title: "No Data Accuracy Guarantee",
								desc: "Market data may be inaccurate, delayed, or unavailable due to third-party sources",
							},
							{
								title: "CAPTCHA Accuracy",
								desc: "CAPTCHA solving functionality may not be 100% accurate",
							},
							{
								title: "Compatibility",
								desc: "The Extension may break with future updates to target websites",
							},
							{
								title: "No Financial Advice",
								desc: "This is NOT financial advice. Do not make trading decisions based solely on this tool",
							},
						].map((item, index) => (
							<div key={index} className="bg-white/5 rounded-xl p-4">
								<h4 className="font-semibold mb-1">{item.title}</h4>
								<p className="text-white/60 text-sm">{item.desc}</p>
							</div>
						))}
					</div>

					{/* Use at own risk */}
					<div className="bg-white/5 border border-white/10 rounded-xl p-4 text-center">
						<p className="text-white/60 text-sm">
							<strong className="text-white/80">USE AT YOUR OWN RISK.</strong> By using this extension,
							you acknowledge that you understand and accept all limitations and disclaimers stated herein.
						</p>
					</div>
				</div>
			),
		},
		{
			id: "obligations",
			number: 7,
			title: "User Obligations",
			icon: Gavel,
			content: (
				<div className="space-y-4">
					<p className="text-white/70">
						As a user of this Extension, you agree to:
					</p>
					<div className="bg-white/5 rounded-xl p-5">
						<ul className="space-y-3">
							{[
								"Use the Extension responsibly and legally",
								"Maintain the security of your account credentials",
								"Report any security vulnerabilities to the author",
								"Not use the Extension for any malicious purposes",
								"Not attempt to circumvent any security measures",
								"Comply with all applicable laws while using the Extension",
								"Respect the terms of service of the platforms you access",
							].map((item, index) => (
								<li key={index} className="flex items-center gap-3">
									<span className="w-6 h-6 rounded-full bg-purple-500/20 flex items-center justify-center flex-shrink-0 text-sm">
										{index + 1}
									</span>
									<span className="text-white/70">{item}</span>
								</li>
							))}
						</ul>
					</div>
				</div>
			),
		},
		{
			id: "legal",
			number: 8,
			title: "Legal Compliance",
			icon: FileText,
			content: (
				<div className="space-y-4">
					<p className="text-white/70">
						In case of any legal concerns:
					</p>
					<div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-5 space-y-3">
						<p className="text-white/70">
							<span className="text-blue-400 font-semibold">•</span> Contact
							the author immediately if the Extension violates any laws or
							regulations
						</p>
						<p className="text-white/70">
							<span className="text-blue-400 font-semibold">•</span> The
							author commits to taking immediate action on valid legal
							concerns
						</p>
						<p className="text-white/70">
							<span className="text-blue-400 font-semibold">•</span> Users
							must comply with all applicable laws while using the Extension
						</p>
						<p className="text-white/70">
							<span className="text-blue-400 font-semibold">•</span> The
							Extension may be modified or discontinued to comply with legal
							requirements
						</p>
					</div>
				</div>
			),
		},
		{
			id: "changes",
			number: 9,
			title: "Changes to Terms",
			icon: FileText,
			content: (
				<div className="space-y-4">
					<p className="text-white/70">
						We reserve the right to modify these terms at any time. When we
						make changes:
					</p>
					<div className="bg-white/5 rounded-xl p-5">
						<ul className="space-y-3 text-white/70">
							<li className="flex items-start gap-2">
								<span className="text-emerald-400">•</span>
								Users will be notified of significant changes through the
								extension
							</li>
							<li className="flex items-start gap-2">
								<span className="text-emerald-400">•</span>
								Changes will be documented in the GitHub repository
							</li>
							<li className="flex items-start gap-2">
								<span className="text-emerald-400">•</span>
								Updated terms will be available in new releases
							</li>
							<li className="flex items-start gap-2">
								<span className="text-emerald-400">•</span>
								Continued use of the Extension after changes constitutes
								acceptance of the modified terms
							</li>
						</ul>
					</div>
				</div>
			),
		},
		{
			id: "contact",
			number: 10,
			title: "Contact Information",
			icon: Mail,
			content: (
				<div className="space-y-4">
					<p className="text-white/70">
						For support, concerns, or legal issues, you can reach us through:
					</p>
					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						<Link
							href="https://github.com/surajrimal07/tms-captcha"
							target="_blank"
							className="bg-white/5 hover:bg-white/10 rounded-xl p-4 flex items-center gap-3 transition-colors"
						>
							<div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center">
								<Github className="w-5 h-5" />
							</div>
							<div>
								<h4 className="font-semibold">GitHub Repository</h4>
								<p className="text-white/60 text-sm">
									View code & documentation
								</p>
							</div>
						</Link>
						<Link
							href="https://github.com/surajrimal07/tms-captcha/issues"
							target="_blank"
							className="bg-white/5 hover:bg-white/10 rounded-xl p-4 flex items-center gap-3 transition-colors"
						>
							<div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center">
								<Smartphone className="w-5 h-5" />
							</div>
							<div>
								<h4 className="font-semibold">Issue Tracker</h4>
								<p className="text-white/60 text-sm">
									Report bugs & issues
								</p>
							</div>
						</Link>
					</div>
					<Link
						href="mailto:davidparkedme@gmail.com"
						className="block bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30 rounded-xl p-4 text-center hover:from-purple-500/30 hover:to-pink-500/30 transition-colors"
					>
						<Mail className="w-6 h-6 mx-auto mb-2 text-purple-400" />
						<h4 className="font-semibold">Direct Contact</h4>
						<p className="text-white/60 text-sm">
							davidparkedme@gmail.com — For urgent legal concerns
						</p>
					</Link>
				</div>
			),
		},
	];

	return (
		<div className="min-h-screen bg-gradient-to-b from-[#0a0a0f] via-[#0f0f1a] to-[#1a1a2e] text-white">
			{/* Animated Background */}
			<div className="fixed inset-0 overflow-hidden pointer-events-none">
				<div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl animate-pulse" />
				<div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000" />
			</div>

			<main className="relative z-10 max-w-4xl mx-auto px-6 py-16">
				{/* Header */}
				<div className="text-center mb-16">
					<div className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-500/10 backdrop-blur-sm border border-indigo-500/30 rounded-full text-sm text-indigo-400 mb-6">
						<FileText className="w-4 h-4" />
						Legal Agreement
					</div>
					<h1 className="text-4xl md:text-5xl font-extrabold mb-4 bg-gradient-to-r from-white via-indigo-200 to-purple-200 bg-clip-text text-transparent">
						Terms of Service
					</h1>
					<p className="text-lg text-white/60 max-w-2xl mx-auto">
						Version 2.1.0 — Last updated: December 29, 2025
					</p>
				</div>

				{/* Disclaimer */}
				<div className="bg-gradient-to-r from-red-500/10 via-orange-500/10 to-amber-500/10 border border-red-500/30 rounded-2xl p-6 mb-10">
					<div className="flex items-start gap-4">
						<div className="w-12 h-12 rounded-xl bg-red-500/20 flex items-center justify-center flex-shrink-0">
							<AlertTriangle className="w-6 h-6 text-red-400" />
						</div>
						<div>
							<h2 className="text-xl font-bold text-red-400 mb-2">
								Important Disclaimer
							</h2>
							<ul className="space-y-2 text-white/70">
								<li className="flex items-start gap-2">
									<span className="text-red-400">•</span>
									This Extension is <strong>NOT affiliated with, endorsed by,
									or connected to</strong> Nepal Stock Exchange (NEPSE),
									Trading Management System (TMS), Meroshare/CDSC, or NaasaX
									in any way.
								</li>
								<li className="flex items-start gap-2">
									<span className="text-red-400">•</span>
									This is an open-source project provided for{" "}
									<strong>educational purposes only</strong>.
								</li>
								<li className="flex items-start gap-2">
									<span className="text-red-400">•</span>
									The author holds <strong>NO LIABILITY</strong> for any
									misuse, data loss, or security issues arising from the use
									of this Extension.
								</li>
								<li className="flex items-start gap-2">
									<span className="text-red-400">•</span>
									Users are <strong>solely responsible</strong> for their
									account security and any consequences of using this
									Extension.
								</li>
							</ul>
						</div>
					</div>
				</div>

				{/* Sections */}
				<div className="space-y-4">
					{sections.map((section) => (
						<div
							key={section.id}
							className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl overflow-hidden"
						>
							<button
								onClick={() =>
									setActiveSection(
										activeSection === section.id ? null : section.id
									)
								}
								className="w-full px-6 py-5 flex items-center justify-between hover:bg-white/5 transition-colors"
							>
								<div className="flex items-center gap-4">
									<div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500/30 to-purple-500/30 flex items-center justify-center font-bold">
										{section.number}
									</div>
									<span className="text-lg font-semibold">
										{section.title}
									</span>
								</div>
								<ArrowRight
									className={`w-5 h-5 text-white/50 transition-transform duration-300 ${
										activeSection === section.id ? "rotate-90" : ""
									}`}
								/>
							</button>
							{activeSection === section.id && (
								<div className="px-6 pb-6">{section.content}</div>
							)}
						</div>
					))}
				</div>

				{/* Acceptance Notice */}
				<div className="mt-10 bg-indigo-500/10 border border-indigo-500/30 rounded-2xl p-6 text-center">
					<Scale className="w-8 h-8 mx-auto mb-3 text-indigo-400" />
					<p className="text-white/70">
						By installing and using the Nepse Dashboard extension, you
						acknowledge that you have read, understood, and agree to be bound
						by these Terms of Service.
					</p>
				</div>

				{/* Footer */}
				<footer className="mt-16 pt-8 border-t border-white/10 flex flex-wrap justify-between items-center gap-4">
					<Link
						href="/nepsedashboard"
						className="inline-flex items-center gap-2 text-white/60 hover:text-white transition-colors"
					>
						<ArrowLeft className="h-4 w-4" />
						Back to Home
					</Link>
					<Link
						href="/nepsedashboard/privacy"
						className="inline-flex items-center gap-2 text-purple-400 hover:text-purple-300 transition-colors"
					>
						View Privacy Policy
						<ArrowRight className="h-4 w-4" />
					</Link>
				</footer>
			</main>
		</div>
	);
}
