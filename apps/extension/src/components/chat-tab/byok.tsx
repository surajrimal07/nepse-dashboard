/** biome-ignore-all lint/a11y/noStaticElementInteractions: <explanation> */
/** biome-ignore-all lint/a11y/useButtonType: <explanation> */
/** biome-ignore-all lint/a11y/useKeyWithClickEvents: <explanation> */
import { aiProviders, type aiProvidersType } from "@nepse-dashboard/ai/types";
import { Button } from "@nepse-dashboard/ui/components/button";
import { Input } from "@nepse-dashboard/ui/components/input";
import { Label } from "@nepse-dashboard/ui/components/label";
import { Gauge, HeartHandshake, Key, Shield, X, Zap } from "lucide-react";
import { useState } from "react";
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
	const { useStateItem } = useAppState();
	const [aiConfig, setAiConfig] = useStateItem("aiSettings");

	const [isOpen, setIsOpen] = useState(false);

	const [useKey, setUseKey] = useState(aiConfig?.hasKeys ?? false);
	const [provider, setProvider] = useState(aiConfig?.provider ?? "");
	const [model, setModel] = useState(aiConfig?.model ?? "");
	const [apiKey, setApiKey] = useState(aiConfig?.apiKey ?? "");

	const openDialog = () => {
		setUseKey(aiConfig?.hasKeys ?? false);
		setProvider(aiConfig?.provider ?? "");
		setModel(aiConfig?.model ?? "");
		setApiKey(aiConfig?.apiKey ?? "");
		setIsOpen(true);
	};

	const closeDialog = () => setIsOpen(false);

	const onSubmit = (e: React.FormEvent) => {
		e.preventDefault();

		setAiConfig(
			useKey
				? {
						hasKeys: true,
						provider: provider as aiProvidersType,
						model,
						apiKey,
					}
				: {
						hasKeys: false,
						provider: null,
						model: null,
						apiKey: null,
					},
		);

		closeDialog();
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

			{isOpen && (
				<>
					<div
						className="fixed inset-0 bg-black/80 z-50"
						onClick={closeDialog}
					/>

					<div className="fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2">
						<div className="bg-zinc-900 border border-zinc-800 rounded-lg shadow-xl p-6">
							<div className="flex justify-between items-center mb-4">
								<h2 className="text-lg font-semibold text-zinc-50">
									API Configuration
								</h2>
								<button
									onClick={closeDialog}
									className="text-zinc-400 hover:text-zinc-50"
								>
									<X className="w-5 h-5" />
								</button>
							</div>

							<form onSubmit={onSubmit} className="space-y-5">
								<div className="flex justify-between items-center">
									<Label className="text-sm text-zinc-300">
										Use my API key
									</Label>
									<input
										type="checkbox"
										checked={useKey}
										onChange={(e) => setUseKey(e.target.checked)}
										className="w-4 h-4 rounded bg-zinc-800 border-zinc-700"
									/>
								</div>

								{useKey && (
									<div className="space-y-4">
										<div className="space-y-1">
											<Label className="text-sm text-zinc-300">Provider</Label>
											<select
												required
												value={provider}
												onChange={(e) => setProvider(e.target.value)}
												className="w-full h-10 rounded-md bg-zinc-950 border border-zinc-800 text-zinc-50 px-3 text-sm"
											>
												<option value="">Select provider</option>
												{Object.entries(aiProviders).map(([key, value]) => (
													<option key={key} value={value}>
														{key.charAt(0).toUpperCase() + key.slice(1)}
													</option>
												))}
											</select>
										</div>

										<div className="space-y-1">
											<Label className="text-sm text-zinc-300">Model</Label>
											<Input
												required
												value={model}
												onChange={(e) => setModel(e.target.value)}
												placeholder="e.g., gpt-4, sonnet-3.5"
												className="bg-zinc-950 border-zinc-800 text-zinc-50"
											/>
										</div>

										<div className="space-y-1">
											<Label className="text-sm text-zinc-300">API Key</Label>
											<Input
												required
												minLength={10}
												type="password"
												value={apiKey}
												onChange={(e) => setApiKey(e.target.value)}
												placeholder="Enter API key"
												className="bg-zinc-950 border-zinc-800 text-zinc-50"
											/>
										</div>
									</div>
								)}

								<div className="flex gap-3 pt-2">
									<Button
										type="button"
										variant="outline"
										onClick={closeDialog}
										className="flex-1 border-zinc-700 text-zinc-300 hover:bg-zinc-800"
									>
										Cancel
									</Button>
									<Button
										type="submit"
										className="flex-1 bg-zinc-50 text-zinc-900 hover:bg-zinc-100"
									>
										Save
									</Button>
								</div>
							</form>
						</div>
					</div>
				</>
			)}
			<BackButton showBack={true} />
		</div>
	);
}
