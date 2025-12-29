"use client";
import {
	Bot,
	Brain,
	BarChart as ChartBar,
	MessageSquare,
	Pause,
	Shield,
	Target,
	TrendingUp,
} from "lucide-react";
import Helmet from "react-helmet";

export default function Home() {
	return (
		<div className="min-h-screen bg-linear-to-br from-blue-900 via-black to-purple-900 text-white flex flex-col justify-center items-center">
			<Helmet>
				<link
					rel="stylesheet"
					type="text/css"
					href="https://prod-waitlist-widget.s3.us-east-2.amazonaws.com/getwaitlist.min.css"
				/>
				<script
					src="https://prod-waitlist-widget.s3.us-east-2.amazonaws.com/getwaitlist.min.js"
					async
				/>
			</Helmet>
			<div className="container mx-auto px-4 py-16">
				<nav className="flex items-center justify-between mb-16">
					<div className="flex items-center space-x-2">
						<Bot className="w-8 h-8" />
						<span className="text-xl font-bold">Nepse Chatbot</span>
					</div>
				</nav>

				<div className="max-w-4xl mx-auto text-center">
					<div className="inline-flex items-center px-4 py-2 bg-blue-800/30 rounded-full mb-8">
						<Pause className="w-4 h-4 mr-2" />
						<span>Currently Paused</span>
					</div>
					<h1 className="text-5xl md:text-6xl font-bold mb-6 bg-clip-text text-transparent bg-linear-to-r from-blue-400 to-purple-400">
						Your Personal AI Trading Assistant for NEPSE
					</h1>
					<p className="text-xl text-gray-300 mb-12">
						Meet your AI-powered trading companion that understands Nepal&apos;s
						stock market. Get personalized insights, real-time analysis, and
						smart trading recommendations tailored just for you.
					</p>{" "}
					<div
						id="getWaitlistContainer"
						data-waitlist_id="26659"
						data-widget_type="WIDGET_3"
						className="flex justify-center mb-8"
					/>
				</div>
				<div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto mb-16">
					<div className="bg-white/5 p-8 rounded-xl backdrop-blur-sm hover:bg-white/10 transition-colors">
						<MessageSquare className="w-8 h-8 mb-4 text-blue-400" />
						<h3 className="text-xl font-semibold mb-3">
							Personal Trading Assistant
						</h3>
						<p className="text-gray-400">
							Your 24/7 companion for NEPSE trading. Ask questions, get market
							updates, and receive personalized recommendations in natural
							conversation.
						</p>
					</div>

					<div className="bg-white/5 p-8 rounded-xl backdrop-blur-sm hover:bg-white/10 transition-colors">
						<ChartBar className="w-8 h-8 mb-4 text-purple-400" />
						<h3 className="text-xl font-semibold mb-3">Market Intelligence</h3>
						<p className="text-gray-400">
							Get real-time market analysis, trend predictions, and sector-wise
							insights powered by advanced AI algorithms trained on NEPSE data.
						</p>
					</div>

					<div className="bg-white/5 p-8 rounded-xl backdrop-blur-sm hover:bg-white/10 transition-colors">
						<Shield className="w-8 h-8 mb-4 text-green-400" />
						<h3 className="text-xl font-semibold mb-3">Risk Management</h3>
						<p className="text-gray-400">
							Smart risk assessment tools and portfolio management strategies to
							protect your investments in volatile market conditions.
						</p>
					</div>

					<div className="bg-white/5 p-8 rounded-xl backdrop-blur-sm hover:bg-white/10 transition-colors">
						<Target className="w-8 h-8 mb-4 text-red-400" />
						<h3 className="text-xl font-semibold mb-3">Decision Support</h3>
						<p className="text-gray-400">
							Get actionable trading signals, entry/exit points, and portfolio
							rebalancing suggestions based on your trading style and risk
							appetite.
						</p>
					</div>

					<div className="bg-white/5 p-8 rounded-xl backdrop-blur-sm hover:bg-white/10 transition-colors">
						<Brain className="w-8 h-8 mb-4 text-yellow-400" />
						<h3 className="text-xl font-semibold mb-3">Learning & Growth</h3>
						<p className="text-gray-400">
							Learn from market patterns, understand trading strategies, and
							improve your trading skills with AI-powered insights and
							educational content.
						</p>
					</div>

					<div className="bg-white/5 p-8 rounded-xl backdrop-blur-sm hover:bg-white/10 transition-colors">
						<TrendingUp className="w-8 h-8 mb-4 text-teal-400" />
						<h3 className="text-xl font-semibold mb-3">
							Emerging Market Focus
						</h3>
						<p className="text-gray-400">
							Specially designed for Nepal&apos;s emerging market conditions,
							considering local market dynamics, regulations, and trading
							patterns.
						</p>
					</div>
				</div>

				<div className="max-w-4xl mx-auto text-center bg-white/5 rounded-2xl p-8 backdrop-blur-sm">
					<h2 className="text-3xl font-bold mb-6">
						Perfect for Every NEPSE Trader
					</h2>
					<p className="text-xl text-gray-300">
						Whether you&apos;re a day trader looking for quick market insights,
						a swing trader seeking optimal entry/exit points, or a long-term
						investor planning your portfolio strategy - Nepse Chatbot adapts to
						your trading style and helps you make informed decisions in
						Nepal&apos;s dynamic stock market.
					</p>
				</div>
			</div>
			<div className="max-w-4xl mx-auto text-center bg-white/5 rounded-2xl p-8 backdrop-blur-sm mt-8">
				<h2 className="text-2xl font-bold mb-4">Project Paused</h2>
				<p className="text-lg text-gray-300">
					Due to the complex nature of the project, we have currently paused the
					project until further notice. You can join the waitlist to get
					notified when we decide to relaunch again.
				</p>
			</div>
			<footer className="w-full py-4 text-center text-gray-400 mt-16">
				<p>
					A project by{" "}
					<a
						href="https://surajrimal.dev"
						target="_blank"
						rel="noopener noreferrer"
						className="text-blue-400 hover:text-blue-300 transition-colors"
					>
						Suraj Rimal
					</a>
				</p>
			</footer>
		</div>
	);
}
