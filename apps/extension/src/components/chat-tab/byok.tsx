import { Button } from "@nepse-dashboard/ui/components/button";
import { useRouter } from "@tanstack/react-router";
import { Gauge, HeartHandshake, Key, Shield, Zap } from "lucide-react";
import BackButton from "../back-button/back-button";

const BENEFITS = [
	{
		title: "Unlimited Usage",
		desc: "No rate limits",
		icon: Zap,
	},
	{
		title: "Complete Privacy",
		desc: "Your key never leaves device",
		icon: Shield,
	},
	{
		title: "Better Performance",
		desc: "Faster responses",
		icon: Gauge,
	},
	{
		title: "Support Development",
		desc: "Keeps the project sustainable",
		icon: HeartHandshake,
	},
];

export default function RequireBYOK() {
	const router = useRouter();
	const openDialog = () => {
		router.navigate({
			to: "/keys",
		});
	};

	return (
		<div className="flex flex-col items-center justify-center px-4 py-8 h-full">
			<div className="flex flex-col items-center justify-center px-4 py-6 h-full">
				<div className="w-14 h-14 flex items-center justify-center rounded-full border border-zinc-800 bg-zinc-900">
					<Key className="w-6 h-6 text-zinc-400" />
				</div>

				<h1 className="text-lg font-semibold text-zinc-50 mt-4">
					API Key Required
				</h1>

				<p className="text-xs text-zinc-400 text-center max-w-xs mt-1">
					Bring your own API key for unlimited usage and full control.
				</p>

				<div className="w-full max-w-sm mt-5 space-y-2">
					{BENEFITS.map((b, i) => (
						<div
							key={i}
							className="flex items-center gap-3 p-3 rounded-lg border border-zinc-800 bg-zinc-900/60"
						>
							<b.icon className="w-5 h-5 text-zinc-400 shrink-0" />

							<div className="flex flex-col">
								<span className="text-[13px] font-medium text-zinc-100">
									{b.title}
								</span>
								<span className="text-[11px] text-zinc-500 leading-tight">
									{b.desc}
								</span>
							</div>
						</div>
					))}
				</div>

				<Button
					onClick={openDialog}
					className="w-full max-w-xs mt-6 h-9 rounded-md bg-white text-zinc-900 text-sm hover:bg-zinc-200"
				>
					Configure API Key
				</Button>

				<p className="text-[11px] text-zinc-500 mt-2">
					Your key stays on your device.
				</p>
			</div>
			<BackButton showBack={true} />
		</div>
	);
}
