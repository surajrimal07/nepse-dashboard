import type { aiProvidersType } from "@nepse-dashboard/ai/types";
import { aiProviders } from "@nepse-dashboard/ai/types";
import { Button } from "@nepse-dashboard/ui/components/button";
import { Input } from "@nepse-dashboard/ui/components/input";
import { Label } from "@nepse-dashboard/ui/components/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@nepse-dashboard/ui/components/select";
import { Switch } from "@nepse-dashboard/ui/components/switch";
import { createLazyRoute, useRouteContext } from "@tanstack/react-router";
import {
	Bot,
	Check,
	CheckCircle2,
	ChevronRight,
	Eye,
	EyeOff,
	Key,
	Loader2,
	Pencil,
	RefreshCw,
	Shield,
	Sparkles,
	Trash2,
	Zap,
} from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { LIST_HEIGHT } from "@/constants/app-config";
import { useAppState } from "@/hooks/use-app";
import { cn } from "@/lib/utils";

export const Route = createLazyRoute("/keys")({
	component: Keys,
});

export default function Keys() {
	const { useStateItem, callAction } = useAppState();
	const routeContext = useRouteContext({ strict: false });
	const listHeight = useMemo(
		() =>
			routeContext.fullscreen ? LIST_HEIGHT.FULLSCREEN : LIST_HEIGHT.NORMAL,
		[routeContext.fullscreen],
	);

	const [aiSettings, setAiSettings] = useStateItem("aiSettings");
	const [edit, setEdit] = useState(false);
	const [provider, setProvider] = useState(aiSettings?.provider ?? "");
	const [model, setModel] = useState(aiSettings?.model ?? "");
	const [apiKey, setApiKey] = useState(aiSettings?.apiKey ?? "");
	const [hasKeys, setHasKeys] = useState(aiSettings?.hasKeys ?? false);
	const [loading, setLoading] = useState(false);
	const [testLoading, setTestLoading] = useState(false);
	const [success, setSuccess] = useState("");
	const [error, setError] = useState("");
	const [testPassed, setTestPassed] = useState(false);
	const [reveal, setReveal] = useState(false);

	const handleEdit = () => {
		setProvider(aiSettings?.provider ?? "");
		setModel(aiSettings?.model ?? "");
		setApiKey(aiSettings?.apiKey ?? "");
		setHasKeys(aiSettings?.hasKeys ?? false);
		setEdit(true);
		setSuccess("");
		setError("");
		setTestPassed(false);
	};

	const handleCancel = () => {
		setEdit(false);
		setSuccess("");
		setError("");
	};

	const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		setLoading(true);
		setSuccess("");
		setError("");
		try {
			await callAction("setAISettings", {
				provider: hasKeys ? provider : null,
				model: hasKeys ? model : null,
				apiKey: hasKeys ? apiKey : null,
				hasKeys,
			});
			toast.success("Saved successfully.");

			setEdit(false);
		} catch {
			toast.error("Failed to save. Please try again.");
		} finally {
			setLoading(false);
		}
	};

	const handleTestConnection = async () => {
		if (!provider || !model || !apiKey) {
			toast.error("Fill provider, model and key before testing.");
			return;
		}

		setTestLoading(true);
		setTestPassed(false);
		try {
			const result = await callAction("checkConfig", {
				model,
				provider,
				key: apiKey,
			});

			if (result?.success) {
				setTestPassed(true);
				toast.success(result.message || "Connection OK");
			} else {
				setTestPassed(false);
				toast.error(result.message || "Connection failed");
			}
		} catch {
			setTestPassed(false);
			toast.error("Connection test failed");
		} finally {
			setTestLoading(false);
		}
	};

	const handleToggle = async () => {
		const newVal = !hasKeys;
		setHasKeys(newVal);
		await callAction?.("setAISettings", { ...aiSettings, hasKeys: newVal });
	};

	const handleClear = () => {
		setAiSettings?.({
			provider: null,
			model: null,
			apiKey: null,
			hasKeys: false,
		});
		setHasKeys(false);
		toast.success("Settings cleared");
	};

	const isConfigured =
		aiSettings?.provider && aiSettings?.model && aiSettings?.apiKey;

	return (
		<div
			className="w-full h-full overflow-y-auto scrollbar-thin scrollbar-thumb-zinc-700 scrollbar-track-transparent"
			style={{
				minHeight: listHeight,
				maxHeight: listHeight,
			}}
		>
			<div className="p-4 space-y-4">
				{/* Header Section */}
				<div className="relative overflow-hidden rounded-xl bg-gray-900/50 p-5">
					<div className="absolute top-0 right-0 w-32 h-32  rounded-full blur-2xl -translate-y-1/2 translate-x-1/2" />
					<div className="absolute bottom-0 left-0 w-24 h-24  rounded-full blur-2xl translate-y-1/2 -translate-x-1/2" />

					<div className="relative flex items-start gap-4">
						<div className="shrink-0 w-12 h-12 rounded-xl bg-linear-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg shadow-violet-500/25">
							<Key className="w-6 h-6 text-white" />
						</div>
						<div className="flex-1 min-w-0">
							<h1 className="text-xl font-bold text-foreground flex items-center gap-2">
								AI Configuration
								<Sparkles className="w-4 h-4 text-violet-400" />
							</h1>
							<p className="text-sm text-muted-foreground mt-1 leading-relaxed">
								Configure your AI provider and API key to enable AI-powered
								features in the extension.
							</p>
						</div>
					</div>
				</div>

				{!edit ? (
					<>
						{/* Status Banner */}
						<div
							className={cn(
								"flex items-center gap-3 px-4 py-3 rounded-lg border transition-all duration-200",
								isConfigured && hasKeys
									? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
									: "bg-amber-500/10 border-amber-500/30 text-amber-400",
							)}
						>
							{isConfigured && hasKeys ? (
								<>
									<CheckCircle2 className="w-5 h-5 shrink-0" />
									<span className="text-sm font-medium">
										AI features are enabled and configured
									</span>
								</>
							) : (
								<>
									<Shield className="w-5 h-5 shrink-0" />
									<span className="text-sm font-medium">
										{hasKeys
											? "Complete your configuration below"
											: "Enable local API key to get started"}
									</span>
								</>
							)}
						</div>

						{/* Configuration Cards */}
						<div className="space-y-3">
							{/* Provider Card */}
							<div className="group relative overflow-hidden rounded-lg border border-zinc-800 bg-zinc-900/50 hover:bg-zinc-900/80 hover:border-zinc-700 transition-all duration-200">
								<div className="p-4">
									<div className="flex items-center justify-between">
										<div className="flex items-center gap-3">
											<div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
												<Bot className="w-5 h-5 text-blue-400" />
											</div>
											<div>
												<div className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
													Provider
												</div>
												<div className="text-base font-semibold text-foreground mt-0.5">
													{aiSettings?.provider ? (
														aiSettings.provider.charAt(0).toUpperCase() +
														aiSettings.provider.slice(1)
													) : (
														<span className="text-zinc-500 font-normal">
															Not configured
														</span>
													)}
												</div>
											</div>
										</div>
										<ChevronRight className="w-4 h-4 text-zinc-600 group-hover:text-zinc-400 transition-colors" />
									</div>
								</div>
							</div>

							{/* Model Card */}
							<div className="group relative overflow-hidden rounded-lg border border-zinc-800 bg-zinc-900/50 hover:bg-zinc-900/80 hover:border-zinc-700 transition-all duration-200">
								<div className="p-4">
									<div className="flex items-center justify-between">
										<div className="flex items-center gap-3">
											<div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
												<Zap className="w-5 h-5 text-purple-400" />
											</div>
											<div>
												<div className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
													Model
												</div>
												<div className="text-base font-semibold text-foreground mt-0.5">
													{aiSettings?.model || (
														<span className="text-zinc-500 font-normal">
															Not configured
														</span>
													)}
												</div>
											</div>
										</div>
										<ChevronRight className="w-4 h-4 text-zinc-600 group-hover:text-zinc-400 transition-colors" />
									</div>
								</div>
							</div>

							{/* API Key Card */}
							<div className="group relative overflow-hidden rounded-lg border border-zinc-800 bg-zinc-900/50 hover:bg-zinc-900/80 hover:border-zinc-700 transition-all duration-200">
								<div className="p-4">
									<div className="flex items-center justify-between">
										<div className="flex items-center gap-3">
											<div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center">
												<Key className="w-5 h-5 text-amber-400" />
											</div>
											<div>
												<div className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
													API Key
												</div>
												<div className="text-base font-semibold text-foreground mt-0.5 font-mono">
													{aiSettings?.apiKey ? (
														"••••••••••••••••"
													) : (
														<span className="text-zinc-500 font-normal font-sans">
															Not set
														</span>
													)}
												</div>
											</div>
										</div>
										<ChevronRight className="w-4 h-4 text-zinc-600 group-hover:text-zinc-400 transition-colors" />
									</div>
								</div>
							</div>
						</div>

						{/* Toggle & Actions */}
						<div className="space-y-3 pt-2">
							{/* Enable Toggle */}
							<div className="flex items-center justify-between p-4 rounded-lg border border-zinc-800 bg-zinc-900/30">
								<div className="flex items-center gap-3">
									<div
										className={cn(
											"w-2 h-2 rounded-full transition-colors",
											hasKeys
												? "bg-emerald-500 shadow-lg shadow-emerald-500/50"
												: "bg-zinc-600",
										)}
									/>
									<div>
										<div className="text-sm font-medium text-foreground">
											Enable Local API Key
										</div>
										<div className="text-xs text-muted-foreground mt-0.5">
											Use your own API key for AI features
										</div>
									</div>
								</div>
								<Switch
									checked={hasKeys}
									onCheckedChange={handleToggle}
									className="data-[state=checked]:bg-emerald-500"
								/>
							</div>

							{/* Action Buttons */}
							<div className="flex gap-3">
								<Button
									onClick={handleEdit}
									variant="outline"
									className="flex-1 h-11 border-0"
								>
									<Pencil className="w-4 h-4 mr-2" />
									Edit Configuration
								</Button>
								<Button
									variant="outline"
									onClick={handleClear}
									className="h-11 px-4 border-zinc-700 hover:bg-red-500/10 hover:border-red-500/50 hover:text-red-400 transition-colors"
									disabled={!isConfigured}
								>
									<Trash2 className="w-4 h-4" />
								</Button>
							</div>
						</div>

						{success && (
							<div className="flex items-center gap-2 text-emerald-400 text-sm p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
								<Check className="w-4 h-4" />
								{success}
							</div>
						)}
						{error && (
							<div className="text-red-400 text-sm p-3 rounded-lg bg-red-500/10 border border-red-500/20">
								{error}
							</div>
						)}
					</>
				) : (
					/* Edit Form */
					<form className="space-y-4" onSubmit={handleSave}>
						{/* Use Local Key Toggle */}
						<div className="flex items-center justify-between p-4 rounded-lg border border-zinc-800 bg-zinc-900/50">
							<div className="flex items-center gap-3">
								<Shield className="w-5 h-5 text-violet-400" />
								<div>
									<Label
										htmlFor="useLocalKey"
										className="text-sm font-medium text-foreground cursor-pointer"
									>
										Use Local API Key
									</Label>
									<p className="text-xs text-muted-foreground mt-0.5">
										Store and use your own API credentials
									</p>
								</div>
							</div>
							<Switch
								id="useLocalKey"
								checked={hasKeys}
								onCheckedChange={setHasKeys}
								className="data-[state=checked]:bg-violet-500"
							/>
						</div>

						{hasKeys && (
							<div className="space-y-4 animate-in slide-in-from-top-2 duration-200">
								{/* Provider Select */}
								<div className="space-y-2">
									<Label
										htmlFor="provider-select"
										className="text-sm font-medium text-foreground flex items-center gap-2"
									>
										<Bot className="w-4 h-4 text-blue-400" />
										Provider
									</Label>
									<Select
										value={provider}
										onValueChange={(v: string) =>
											setProvider(v as aiProvidersType)
										}
									>
										<SelectTrigger
											id="provider-select"
											className="w-full h-11 bg-zinc-900/50 border-zinc-800 hover:border-zinc-700 focus:border-violet-500 transition-colors"
										>
											<SelectValue placeholder="Select AI provider" />
										</SelectTrigger>
										<SelectContent className="bg-zinc-900 border-zinc-800">
											{Object.entries(aiProviders).map(([key, val]) => (
												<SelectItem
													key={key}
													value={val}
													className="focus:bg-violet-500/20 focus:text-foreground"
												>
													{key.charAt(0).toUpperCase() + key.slice(1)}
												</SelectItem>
											))}
										</SelectContent>
									</Select>
								</div>

								{/* Model Input */}
								<div className="space-y-2">
									<Label
										htmlFor="model"
										className="text-sm font-medium text-foreground flex items-center gap-2"
									>
										<Zap className="w-4 h-4 text-purple-400" />
										Model
									</Label>
									<Input
										id="model"
										required
										value={model}
										onChange={(e) => setModel(e.target.value)}
										placeholder="e.g., gpt-4o, claude-3.5-sonnet"
										className="h-11 bg-zinc-900/50 border-zinc-800 hover:border-zinc-700 focus:border-violet-500 transition-colors"
									/>
								</div>

								{/* API Key Input */}
								<div className="space-y-2">
									<Label
										htmlFor="apiKey"
										className="text-sm font-medium text-foreground flex items-center gap-2"
									>
										<Key className="w-4 h-4 text-amber-400" />
										API Key
									</Label>
									<div className="flex gap-2">
										<div className="relative flex-1">
											<Input
												id="apiKey"
												required
												minLength={10}
												type={reveal ? "text" : "password"}
												value={apiKey}
												onChange={(e) => {
													setApiKey(e.target.value);
													setTestPassed(false);
												}}
												placeholder="Enter your API key"
												className="h-11 pr-10 bg-zinc-900/50 border-zinc-800 hover:border-zinc-700 focus:border-violet-500 transition-colors font-mono"
											/>
											<button
												type="button"
												onClick={() => setReveal((r) => !r)}
												className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition-colors"
											>
												{reveal ? (
													<EyeOff className="w-4 h-4" />
												) : (
													<Eye className="w-4 h-4" />
												)}
											</button>
										</div>
									</div>
								</div>

								{/* Test Connection Button */}
								<Button
									type="button"
									variant="outline"
									onClick={handleTestConnection}
									disabled={testLoading || !provider || !model || !apiKey}
									className={cn(
										"w-full h-11 border-zinc-700 transition-all duration-200",
										testPassed
											? "bg-emerald-500/10 border-emerald-500/50 text-emerald-400 hover:bg-emerald-500/20"
											: "hover:border-violet-500/50 hover:bg-violet-500/10",
									)}
								>
									{testLoading ? (
										<>
											<Loader2 className="w-4 h-4 mr-2 animate-spin" />
											Testing Connection...
										</>
									) : testPassed ? (
										<>
											<CheckCircle2 className="w-4 h-4 mr-2" />
											Connection Verified
										</>
									) : (
										<>
											<RefreshCw className="w-4 h-4 mr-2" />
											Test Connection
										</>
									)}
								</Button>

								{!testPassed && (
									<p className="text-xs text-muted-foreground text-center">
										You must verify the connection before saving
									</p>
								)}
							</div>
						)}

						{/* Form Actions */}
						<div className="flex gap-3 pt-2">
							<Button
								variant="outline"
								type="button"
								onClick={handleCancel}
								className="flex-1 h-11 border-zinc-700 hover:bg-zinc-800"
							>
								Cancel
							</Button>
							<Button
								type="submit"
								disabled={loading || (hasKeys && !testPassed)}
								className="flex-1 h-11 bg-linear-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white border-0 disabled:opacity-50 disabled:cursor-not-allowed"
							>
								{loading ? (
									<>
										<Loader2 className="w-4 h-4 mr-2 animate-spin" />
										Saving...
									</>
								) : (
									<>
										<Check className="w-4 h-4 mr-2" />
										Save Changes
									</>
								)}
							</Button>
						</div>

						{success && (
							<div className="flex items-center gap-2 text-emerald-400 text-sm p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
								<Check className="w-4 h-4" />
								{success}
							</div>
						)}
						{error && (
							<div className="text-red-400 text-sm p-3 rounded-lg bg-red-500/10 border border-red-500/20">
								{error}
							</div>
						)}
					</form>
				)}
			</div>
		</div>
	);
}
