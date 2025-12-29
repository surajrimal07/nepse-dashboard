/** biome-ignore-all lint/a11y/noStaticElementInteractions: <iknow> */
/** biome-ignore-all lint/a11y/useKeyWithClickEvents: <iknow> */
"use client";

import { aiProviders } from "@nepse-dashboard/ai/types";
import { Button } from "@nepse-dashboard/ui/components/button";
import { Input } from "@nepse-dashboard/ui/components/input";
import { Label } from "@nepse-dashboard/ui/components/label";
import { Heart, Key, Shield, X, Zap } from "lucide-react";
import { useState } from "react";

function RequireBYOK() {
	const [isDialogOpen, setIsDialogOpen] = useState(false);
	const [showFields, setShowFields] = useState(true);
	const [provider, setProvider] = useState("");
	const [model, setModel] = useState("");
	const [apiKey, setApiKey] = useState("");
	const [errors, setErrors] = useState({ provider: "", model: "", apiKey: "" });

	const handleOpenBYOK = () => {
		setIsDialogOpen(true);
	};

	const handleClose = () => {
		setIsDialogOpen(false);
		setErrors({ provider: "", model: "", apiKey: "" });
	};

	const validateFields = () => {
		const newErrors = { provider: "", model: "", apiKey: "" };
		let isValid = true;

		if (showFields) {
			if (!provider) {
				newErrors.provider = "Please select a provider";
				isValid = false;
			}
			if (!model.trim()) {
				newErrors.model = "Model name is required";
				isValid = false;
			}
			if (!apiKey.trim()) {
				newErrors.apiKey = "API key is required";
				isValid = false;
			} else if (apiKey.trim().length < 10) {
				newErrors.apiKey = "API key seems too short";
				isValid = false;
			}
		}

		setErrors(newErrors);
		return isValid;
	};

	const handleSave = () => {
		if (showFields && !validateFields()) {
			return;
		}

		if (showFields) {
			const message = {
				source: "page",
				type: "PASS_AI_CONFIG",
				payload: {
					hasKeys: true,
					provider,
					model: model.trim(),
					apiKey: apiKey.trim(),
				},
			};
			window.parent.postMessage(message, "*");
		} else {
			const message = {
				source: "page",
				type: "PASS_AI_CONFIG",
				payload: {
					hasKeys: false,
					provider: null,
					model: null,
					apiKey: null,
				},
			};
			window.parent.postMessage(message, "*");
		}

		setIsDialogOpen(false);
		setErrors({ provider: "", model: "", apiKey: "" });
	};

	const benefits = [
		{
			icon: Heart,
			title: "Unlimited Usage",
			description: "No rate limits or usage restrictions",
		},
		{
			icon: Shield,
			title: "Complete Privacy",
			description: "Your data stays between you and the provider",
		},
		{
			icon: Zap,
			title: "Better Performance",
			description: "Direct API access for faster responses",
		},
		{
			icon: Heart,
			title: "Support Development",
			description: "Help keep this project sustainable",
		},
	];

	return (
		<>
			<div className="min-h-screen w-full bg-zinc-950 flex items-center justify-center p-4">
				<div className="max-w-2xl w-full space-y-8">
					<div className="flex flex-col items-center gap-6">
						<div className="relative">
							<div className="w-16 h-16 rounded-full border border-zinc-800 bg-zinc-900 flex items-center justify-center">
								<Key className="w-7 h-7 text-zinc-400" />
							</div>
						</div>

						<div className="text-center space-y-3">
							<h1 className="text-2xl font-semibold tracking-tight text-zinc-50">
								API Key Required
							</h1>
							<p className="text-sm text-zinc-400 max-w-md mx-auto leading-relaxed">
								As an independent developer, I can't provide free AI services.
								Bringing your own key gives you a better experience with no
								compromises.
							</p>
						</div>

						<div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-xl mt-4">
							{benefits.map((benefit, index) => {
								const Icon = benefit.icon;
								return (
									<div
										key={index}
										className="flex gap-3 p-4 rounded-lg border border-zinc-800 bg-zinc-900/50"
									>
										<div className="flex-shrink-0 mt-0.5">
											<Icon className="w-5 h-5 text-zinc-400" />
										</div>
										<div className="space-y-1">
											<h3 className="text-sm font-medium text-zinc-200">
												{benefit.title}
											</h3>
											<p className="text-xs text-zinc-500 leading-relaxed">
												{benefit.description}
											</p>
										</div>
									</div>
								);
							})}
						</div>

						<Button
							onClick={handleOpenBYOK}
							className="w-full max-w-xs bg-zinc-50 text-zinc-900 hover:bg-zinc-100 font-medium mt-4"
						>
							Configure API Key
						</Button>

						<div className="text-center space-y-1">
							<div className="flex flex-wrap gap-2 justify-center mt-2">
								{Object.keys(aiProviders).map((provider) => (
									<span
										key={provider}
										className="px-2 py-1 text-xs bg-zinc-800 text-zinc-300 rounded border border-zinc-700"
									>
										{provider.charAt(0).toUpperCase() + provider.slice(1)}
									</span>
								))}
							</div>
							<p className="text-xs text-zinc-400">
								Your key is stored locally and never shared
							</p>
						</div>
					</div>
				</div>
			</div>

			{isDialogOpen && (
				<>
					<div
						className="fixed inset-0 bg-black/80 z-50"
						onClick={handleClose}
					/>
					<div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-md p-4">
						<div className="bg-zinc-900 border border-zinc-800 rounded-lg shadow-lg">
							<div className="flex items-center justify-between p-6 pb-4">
								<h2 className="text-lg font-semibold text-zinc-50">
									API Configuration
								</h2>
								<button
									type="button"
									onClick={handleClose}
									className="text-zinc-400 hover:text-zinc-50 transition-colors"
								>
									<X className="h-4 w-4" />
								</button>
							</div>

							<div className="px-6 pb-6 space-y-4">
								<div className="flex items-center justify-between py-2">
									<Label
										htmlFor="use-own-key"
										className="text-sm text-zinc-300"
									>
										Use own API key
									</Label>
									<input
										id="use-own-key"
										type="checkbox"
										checked={showFields}
										onChange={(e) => {
											setShowFields(e.target.checked);
											setErrors({ provider: "", model: "", apiKey: "" });
										}}
										className="w-4 h-4 rounded border-zinc-700 bg-zinc-800 text-zinc-50 focus:ring-2 focus:ring-zinc-400 focus:ring-offset-0"
									/>
								</div>

								{showFields && (
									<div className="space-y-4 pt-2">
										<div className="space-y-2">
											<Label
												htmlFor="provider"
												className="text-sm text-zinc-300"
											>
												Provider
											</Label>
											<select
												id="provider"
												value={provider}
												onChange={(e) => {
													setProvider(e.target.value);
													setErrors((prev) => ({ ...prev, provider: "" }));
												}}
												className="w-full h-10 px-3 rounded-md border border-zinc-800 bg-zinc-950 text-zinc-50 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-400"
											>
												<option value="">Select provider</option>
												{Object.entries(aiProviders).map(([key, value]) => (
													<option key={key} value={value}>
														{key.charAt(0).toUpperCase() + key.slice(1)}
													</option>
												))}
											</select>
											{errors.provider && (
												<p className="text-xs text-red-400">
													{errors.provider}
												</p>
											)}
										</div>

										<div className="space-y-2">
											<Label htmlFor="model" className="text-sm text-zinc-300">
												Model
											</Label>
											<Input
												id="model"
												type="text"
												value={model}
												onChange={(e) => {
													setModel(e.target.value);
													setErrors((prev) => ({ ...prev, model: "" }));
												}}
												placeholder="e.g., gpt-4, claude-3-5-sonnet"
												className="bg-zinc-950 border-zinc-800 text-zinc-50 placeholder:text-zinc-500 focus:ring-2 focus:ring-zinc-400"
											/>
											{errors.model && (
												<p className="text-xs text-red-400">{errors.model}</p>
											)}
										</div>

										<div className="space-y-2">
											<Label htmlFor="apiKey" className="text-sm text-zinc-300">
												API Key
											</Label>
											<Input
												id="apiKey"
												type="password"
												value={apiKey}
												onChange={(e) => {
													setApiKey(e.target.value);
													setErrors((prev) => ({ ...prev, apiKey: "" }));
												}}
												placeholder="Enter your API key"
												className="bg-zinc-950 border-zinc-800 text-zinc-50 placeholder:text-zinc-500 focus:ring-2 focus:ring-zinc-400"
											/>
											{errors.apiKey && (
												<p className="text-xs text-red-400">{errors.apiKey}</p>
											)}
										</div>
									</div>
								)}

								<div className="flex gap-2 pt-4">
									<Button
										type="button"
										variant="outline"
										onClick={handleClose}
										className="flex-1 border-zinc-800 bg-transparent text-zinc-300 hover:bg-zinc-800 hover:text-zinc-50"
									>
										Cancel
									</Button>
									<Button
										type="button"
										onClick={handleSave}
										className="flex-1 bg-zinc-50 text-zinc-900 hover:bg-zinc-100"
									>
										Save
									</Button>
								</div>
							</div>
						</div>
					</div>
				</>
			)}
		</>
	);
}

export default RequireBYOK;
