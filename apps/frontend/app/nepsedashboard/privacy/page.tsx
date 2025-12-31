"use client";

import {
	AlertTriangle,
	ArrowLeft,
	ArrowRight,
	Bot,
	Database,
	Eye,
	Github,
	Globe,
	Key,
	Lock,
	Mail,
	RefreshCw,
	Server,
	Shield,
	ShieldCheck,
	Smartphone,
	Users,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";

interface Section {
	id: string;
	title: string;
	icon: React.ComponentType<{ className?: string }>;
	content: React.ReactNode;
}

export default function PrivacyPage() {
	const [activeSection, setActiveSection] = useState<string | null>(null);

	const sections: Section[] = [
		{
			id: "scope",
			title: "Extension Scope",
			icon: Globe,
			content: (
				<div className="space-y-4">
					<p className="text-white/70">
						This privacy policy applies exclusively to the browser extension
						&quot;Nepse Dashboard&quot; (formerly &quot;Nepse Account
						Manager&quot;).
					</p>
					<div className="bg-white/5 rounded-xl p-4">
						<h4 className="font-semibold mb-3">Supported Platforms:</h4>
						<ul className="space-y-2 text-white/70">
							<li className="flex items-center gap-2">
								<span className="w-2 h-2 bg-green-400 rounded-full" />
								TMS portals (*-nepsetms.com.np) — All 50+ broker portals
							</li>
							<li className="flex items-center gap-2">
								<span className="w-2 h-2 bg-green-400 rounded-full" />
								Meroshare portal (meroshare.cdsc.com.np)
							</li>
							<li className="flex items-center gap-2">
								<span className="w-2 h-2 bg-green-400 rounded-full" />
								NaasaX trading platform (naasax.com)
							</li>
						</ul>
					</div>
					<p className="text-white/60 text-sm">
						The extension only activates and operates on these specific
						domains. No data is collected from any other websites.
					</p>
				</div>
			),
		},
		{
			id: "local-storage",
			title: "Local Data Storage",
			icon: Database,
			content: (
				<div className="space-y-4">
					<p className="text-white/70">
						All your data is stored locally on your device using Chrome&apos;s
						secure storage API. Here&apos;s what we store:
					</p>
					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						{[
							{
								icon: Lock,
								title: "Credentials",
								desc: "TMS, Meroshare, and NaasaX login credentials",
							},
							{
								icon: Users,
								title: "Account Settings",
								desc: "Account aliases, primary account preferences",
							},
							{
								icon: Key,
								title: "API Keys (BYOK)",
								desc: "Your AI provider API keys (if configured)",
							},
							{
								icon: RefreshCw,
								title: "Preferences",
								desc: "Theme, notifications, and display settings",
							},
						].map((item, index) => (
							<div
								key={index}
								className="bg-white/5 rounded-xl p-4 flex items-start gap-3"
							>
								<div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center flex-shrink-0">
									<item.icon className="w-5 h-5 text-blue-400" />
								</div>
								<div>
									<h4 className="font-semibold">{item.title}</h4>
									<p className="text-white/60 text-sm">{item.desc}</p>
								</div>
							</div>
						))}
					</div>
					<div className="bg-green-500/10 border border-green-500/30 rounded-xl p-4 flex items-start gap-3">
						<ShieldCheck className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
						<p className="text-white/70">
							<strong className="text-green-400">Important:</strong> Your data
							never leaves your device. We do not have access to your
							credentials or any personal information.
						</p>
					</div>
				</div>
			),
		},
		{
			id: "ai-features",
			title: "AI Features & BYOK",
			icon: Bot,
			content: (
				<div className="space-y-4">
					<p className="text-white/70">
						The AI Chat feature uses a &quot;Bring Your Own Key&quot; (BYOK)
						model for maximum privacy and control.
					</p>
					<div className="bg-white/5 rounded-xl p-4 space-y-3">
						<h4 className="font-semibold">How BYOK Works:</h4>
						<ul className="space-y-2 text-white/70">
							<li className="flex items-start gap-2">
								<span className="w-2 h-2 bg-purple-400 rounded-full mt-2" />
								You provide your own OpenAI or Anthropic API key
							</li>
							<li className="flex items-start gap-2">
								<span className="w-2 h-2 bg-purple-400 rounded-full mt-2" />
								Your API key is stored locally and never shared
							</li>
							<li className="flex items-start gap-2">
								<span className="w-2 h-2 bg-purple-400 rounded-full mt-2" />
								AI requests are made directly to your chosen provider
							</li>
							<li className="flex items-start gap-2">
								<span className="w-2 h-2 bg-purple-400 rounded-full mt-2" />
								You pay for usage through your own API account
							</li>
						</ul>
					</div>
					<p className="text-white/60 text-sm">
						We do not proxy, log, or store any AI conversations. Your chats
						are between you and your chosen AI provider.
					</p>
				</div>
			),
		},
		{
			id: "analytics",
			title: "Analytics & Data Collection",
			icon: Eye,
			content: (
				<div className="space-y-4">
					<p className="text-white/70">
						We collect minimal analytics data to improve the extension and ensure service quality.
						This data is processed using OpenPanel (analytics.nepsechatbot.com), a privacy-focused analytics platform.
					</p>

					<div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4 mb-4">
						<h4 className="font-semibold text-blue-400 mb-3">Data We Collect</h4>
						<div className="space-y-3">
							<div className="bg-white/5 rounded-lg p-3">
								<h5 className="font-medium text-white/90 mb-1">📍 Location Data</h5>
								<p className="text-white/60 text-sm">IP address, city, region, and country. Used exclusively for monitoring connection latency to ensure fast, reliable market data delivery. If users in specific regions experience high latency, we may add local servers to improve performance.</p>
							</div>
							<div className="bg-white/5 rounded-lg p-3">
								<h5 className="font-medium text-white/90 mb-1">📧 Email (Optional)</h5>
								<p className="text-white/60 text-sm">Only collected if you voluntarily provide it. Used for user identification and support purposes. Displayed as &quot;Anonymous&quot; if not provided.</p>
							</div>
							<div className="bg-white/5 rounded-lg p-3">
								<h5 className="font-medium text-white/90 mb-1">🔧 Error & Event Tracking</h5>
								<p className="text-white/60 text-sm">Anonymous error reports, feature usage statistics, and extension events. This helps identify bugs quickly and understand which features are most valuable to users.</p>
							</div>
							<div className="bg-white/5 rounded-lg p-3">
								<h5 className="font-medium text-white/90 mb-1">🆔 Random User ID</h5>
								<p className="text-white/60 text-sm">A randomly generated identifier stored locally. This is NOT linked to your personal identity and is used only for analytics aggregation.</p>
							</div>
						</div>
					</div>

					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						<div className="bg-green-500/10 border border-green-500/30 rounded-xl p-4">
							<h4 className="font-semibold text-green-400 mb-2">
								Why We Collect This
							</h4>
							<ul className="space-y-1 text-white/70 text-sm">
								<li>• Fix bugs and errors quickly</li>
								<li>• Monitor service latency</li>
								<li>• Improve extension features</li>
								<li>• Plan infrastructure (add servers if needed)</li>
							</ul>
						</div>
						<div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4">
							<h4 className="font-semibold text-red-400 mb-2">
								What We NEVER Collect
							</h4>
							<ul className="space-y-1 text-white/70 text-sm">
								<li>• Usernames or passwords</li>
								<li>• Trading or financial data</li>
								<li>• Browsing history</li>
								<li>• Keystrokes or clicks</li>
								<li>• Website content</li>
							</ul>
						</div>
					</div>

					<div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4">
						<p className="text-white/70 text-sm">
							<strong className="text-amber-400">Data Retention:</strong> Analytics data is retained for product improvement purposes.
							We do not sell, share, or transfer your data to third parties for marketing or advertising purposes.
							The sole developer uses this data exclusively to maintain and improve the extension.
						</p>
					</div>
				</div>
			),
		},
		{
			id: "backup",
			title: "Backup & Restore",
			icon: RefreshCw,
			content: (
				<div className="space-y-4">
					<p className="text-white/70">
						The backup feature allows you to export and import your account
						configurations.
					</p>
					<div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4 flex items-start gap-3">
						<AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
						<div>
							<h4 className="font-semibold text-amber-400">
								Important Security Notice
							</h4>
							<p className="text-white/70 text-sm mt-1">
								Backup files contain your credentials in plain text. You are
								solely responsible for:
							</p>
							<ul className="text-white/60 text-sm mt-2 space-y-1">
								<li>• Storing backup files securely</li>
								<li>• Not sharing backup files with others</li>
								<li>• Deleting backups you no longer need</li>
							</ul>
						</div>
					</div>
					<p className="text-white/60 text-sm">
						Backup files are created and stored locally on your device. The
						extension does not upload backups to any server.
					</p>
				</div>
			),
		},
		{
			id: "third-party",
			title: "Third-Party Services",
			icon: Server,
			content: (
				<div className="space-y-4">
					<p className="text-white/70">
						The extension interacts with the following services:
					</p>
					<div className="space-y-3">
						{[
							{
								name: "TMS/Meroshare/NaasaX Portals",
								desc: "Form filling and auto-login functionality",
								type: "Essential",
							},
							{
								name: "Chrome Storage API",
								desc: "Local data storage (your browser)",
								type: "Essential",
							},
							{
								name: "Convex Backend",
								desc: "Market data, IPO info, and disclosures",
								type: "Essential",
							},
							{
								name: "OpenPanel Analytics",
								desc: "Anonymous usage statistics (optional)",
								type: "Optional",
							},
							{
								name: "OpenAI/Anthropic (BYOK)",
								desc: "AI chat functionality (your own key)",
								type: "Optional",
							},
						].map((service, index) => (
							<div
								key={index}
								className="bg-white/5 rounded-xl p-4 flex items-center justify-between"
							>
								<div>
									<h4 className="font-semibold">{service.name}</h4>
									<p className="text-white/60 text-sm">{service.desc}</p>
								</div>
								<span
									className={`px-3 py-1 rounded-full text-xs font-medium ${
										service.type === "Essential"
											? "bg-blue-500/20 text-blue-400"
											: "bg-gray-500/20 text-gray-400"
									}`}
								>
									{service.type}
								</span>
							</div>
						))}
					</div>
				</div>
			),
		},
		{
			id: "security",
			title: "Security Measures",
			icon: Shield,
			content: (
				<div className="space-y-4">
					<p className="text-white/70">
						We implement multiple layers of security to protect your data:
					</p>
					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						{[
							{
								icon: Lock,
								title: "Secure Storage",
								desc: "Chrome's encrypted storage API",
							},
							{
								icon: ShieldCheck,
								title: "No External Transmission",
								desc: "Credentials never leave your device",
							},
							{
								icon: Globe,
								title: "HTTPS Only",
								desc: "All network requests use encryption",
							},
							{
								icon: Shield,
								title: "CSP Implemented",
								desc: "Content Security Policy protection",
							},
						].map((item, index) => (
							<div
								key={index}
								className="bg-white/5 rounded-xl p-4 flex items-start gap-3"
							>
								<div className="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center flex-shrink-0">
									<item.icon className="w-5 h-5 text-emerald-400" />
								</div>
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
			id: "user-rights",
			title: "Your Rights & Control",
			icon: Users,
			content: (
				<div className="space-y-4">
					<p className="text-white/70">
						You have complete control over your data:
					</p>
					<div className="bg-white/5 rounded-xl p-4">
						<ul className="space-y-3">
							{[
								"Enable or disable analytics collection at any time",
								"Create, export, and manage data backups",
								"Delete individual accounts or all data",
								"Remove all data by uninstalling the extension",
								"View and modify your stored preferences",
								"Control AI feature usage and API keys",
							].map((right, index) => (
								<li key={index} className="flex items-center gap-3">
									<span className="w-6 h-6 rounded-full bg-purple-500/20 flex items-center justify-center flex-shrink-0">
										<span className="text-purple-400 text-xs">✓</span>
									</span>
									<span className="text-white/70">{right}</span>
								</li>
							))}
						</ul>
					</div>
				</div>
			),
		},
		{
			id: "open-source",
			title: "Open Source Transparency",
			icon: Github,
			content: (
				<div className="space-y-4">
					<p className="text-white/70">
						We maintain full transparency through open-source development:
					</p>

					{/* Public Repository */}
					<div className="bg-gradient-to-br from-emerald-500/20 via-green-500/10 to-teal-500/20 border border-emerald-500/40 rounded-xl p-6">
						<div className="flex items-center justify-between mb-4">
							<div className="flex items-center gap-4">
								<Github className="w-8 h-8" />
								<div>
									<h4 className="font-semibold">surajrimal07/nepse-dashboard</h4>
									<p className="text-white/60 text-sm">Source Available License</p>
								</div>
							</div>
							<span className="px-2 py-1 bg-emerald-500/20 text-emerald-400 text-xs font-medium rounded-full">
								Public
							</span>
						</div>
						<ul className="space-y-2 text-white/70 text-sm">
							<li>• Complete monorepo with extension, backend & all tooling</li>
							<li>• Publicly available source code for full transparency</li>
							<li>• Community code review and contributions welcome</li>
							<li>• Documented data handling practices</li>
							<li>• Open issue tracking and bug reporting</li>
						</ul>
						<Link
							href="https://github.com/surajrimal07/nepse-dashboard"
							target="_blank"
							className="inline-flex items-center gap-2 mt-4 text-emerald-400 hover:text-emerald-300"
						>
							View Repository <ArrowRight className="w-4 h-4" />
						</Link>
					</div>
				</div>
			),
		},
		{
			id: "contact",
			title: "Contact & Support",
			icon: Mail,
			content: (
				<div className="space-y-4">
					<p className="text-white/70">
						For privacy concerns, questions, or support:
					</p>
					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						<Link
							href="https://github.com/surajrimal07/nepse-dashboard"
							target="_blank"
							className="bg-white/5 hover:bg-white/10 rounded-xl p-4 flex items-center gap-3 transition-colors"
						>
							<div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center">
								<Github className="w-5 h-5" />
							</div>
							<div>
								<h4 className="font-semibold">GitHub Repository</h4>
								<p className="text-white/60 text-sm">View code & documentation</p>
							</div>
						</Link>
						<Link
							href="https://github.com/surajrimal07/nepse-dashboard/issues"
							target="_blank"
							className="bg-white/5 hover:bg-white/10 rounded-xl p-4 flex items-center gap-3 transition-colors"
						>
							<div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center">
								<Smartphone className="w-5 h-5" />
							</div>
							<div>
								<h4 className="font-semibold">Issue Tracker</h4>
								<p className="text-white/60 text-sm">Report bugs & request features</p>
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
							davidparkedme@gmail.com - For urgent concerns
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
				<div className="absolute top-1/4 right-1/4 w-96 h-96 bg-green-500/10 rounded-full blur-3xl animate-pulse" />
				<div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-1000" />
			</div>

			<main className="relative z-10 max-w-4xl mx-auto px-6 py-16">
				{/* Header */}
				<div className="text-center mb-16">
					<div className="inline-flex items-center gap-2 px-4 py-2 bg-green-500/10 backdrop-blur-sm border border-green-500/30 rounded-full text-sm text-green-400 mb-6">
						<Shield className="w-4 h-4" />
						Your Privacy Matters
					</div>
					<h1 className="text-4xl md:text-5xl font-extrabold mb-4 bg-gradient-to-r from-white via-green-200 to-emerald-200 bg-clip-text text-transparent">
						Privacy Policy
					</h1>
					<p className="text-lg text-white/60 max-w-2xl mx-auto">
						Version 2.1.0 — Last updated: December 29, 2025
					</p>
				</div>

				{/* Important Notice */}
				<div className="bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-red-500/10 border border-amber-500/30 rounded-2xl p-6 mb-6">
					<div className="flex items-start gap-4">
						<div className="w-12 h-12 rounded-xl bg-amber-500/20 flex items-center justify-center flex-shrink-0">
							<AlertTriangle className="w-6 h-6 text-amber-400" />
						</div>
						<div>
							<h2 className="text-xl font-bold text-amber-400 mb-2">
								Important Privacy Notice
							</h2>
							<ul className="space-y-2 text-white/70">
								<li className="flex items-start gap-2">
									<span className="text-amber-400">•</span>
									This Extension is NOT affiliated with NEPSE, TMS, Meroshare/CDSC, or NaasaX
								</li>
								<li className="flex items-start gap-2">
									<span className="text-amber-400">•</span>
									All user data remains strictly on the user&apos;s device
								</li>
								<li className="flex items-start gap-2">
									<span className="text-amber-400">•</span>
									No credentials are ever transmitted to external servers
								</li>
								<li className="flex items-start gap-2">
									<span className="text-amber-400">•</span>
									Users are solely responsible for securing their backup files
								</li>
							</ul>
						</div>
					</div>
				</div>

				{/* Strong Legal Disclaimer */}
				<div className="bg-red-500/10 border border-red-500/40 rounded-2xl p-6 mb-10">
					<div className="flex items-start gap-4">
						<div className="w-12 h-12 rounded-xl bg-red-500/20 flex items-center justify-center flex-shrink-0">
							<AlertTriangle className="w-6 h-6 text-red-400" />
						</div>
						<div>
							<h2 className="text-xl font-bold text-red-400 mb-3">
								Legal Disclaimer
							</h2>
							<div className="space-y-3 text-white/70 text-sm">
								<p>
									<strong className="text-red-300">THE SOFTWARE IS PROVIDED &quot;AS IS&quot;</strong>, without warranty of any kind.
									The author holds <strong className="text-red-300">NO LIABILITY</strong> for any claim, damages,
									financial losses, or other liability arising from use of this software.
								</p>
								<p>
									<strong className="text-red-300">FOR EDUCATIONAL AND EXPLORATORY PURPOSES ONLY.</strong> This
									extension relies on publicly available third-party data sources. NEPSE does not provide
									an official free API, therefore data accuracy and availability are NOT guaranteed.
								</p>
								<p className="text-white/50 text-xs">
									Data sources may change, break, or become unavailable at any time without notice.
									Do not make financial decisions based solely on this tool.
								</p>
							</div>
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
									<div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
										<section.icon className="w-5 h-5 text-white/70" />
									</div>
									<span className="text-lg font-semibold">{section.title}</span>
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
						href="/nepsedashboard/terms"
						className="inline-flex items-center gap-2 text-purple-400 hover:text-purple-300 transition-colors"
					>
						View Terms of Service
						<ArrowRight className="h-4 w-4" />
					</Link>
				</footer>
			</main>
		</div>
	);
}
