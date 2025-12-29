"use client";

import { Button } from "@nepse-dashboard/ui/components/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@nepse-dashboard/ui/components/card";
import { useOpenPanel } from "@openpanel/nextjs";
import {
	CheckCircle,
	CheckCircle2,
	Loader2,
	Mail,
	ShieldAlert,
	XCircle,
} from "lucide-react";
import { useSearchParams } from "next/navigation";
import { Suspense, useCallback, useEffect, useMemo, useState } from "react";
import { checkExtensionInstalled, openExtensionPanel } from "@/utils/extension";
import { verifyMagicLinkAction } from "./actions";

type LoginState =
	| "loading"
	| "success"
	| "invalid_otp"
	| "expired_otp"
	| "error"
	| "no_token"
	| "extension_not_installed";

function ExtensionLoginContent() {
	const op = useOpenPanel();
	const searchParams = useSearchParams();
	const token = useMemo(() => searchParams.get("token"), [searchParams]);

	const [state, setState] = useState<LoginState>(() => {
		if (!token) return "no_token";
		const otp = Number.parseInt(token, 10);
		return Number.isNaN(otp) ? "invalid_otp" : "loading";
	});
	const [errorMessage, setErrorMessage] = useState("");
	const [email, setEmail] = useState("");
	const [extensionOpened, setExtensionOpened] = useState(false);
	const [extensionInstalled, setExtensionInstalled] = useState<boolean | null>(
		null,
	);

	// Check if extension is installed on mount
	useEffect(() => {
		const checkExtension = async () => {
			const isInstalled = await checkExtensionInstalled();
			setExtensionInstalled(isInstalled);

			if (!isInstalled && token) {
				setState("extension_not_installed");
				op.track("extension_not_installed_error", {
					hasToken: !!token,
				});
			}
		};

		checkExtension();
	}, [token, op]);

	const handleMagicLink = useCallback(async () => {
		if (!token) return;

		const otp = Number.parseInt(token, 10);
		if (Number.isNaN(otp)) return;

		try {
			const result = await verifyMagicLinkAction(otp);

			if (result.success) {
				setState("success");
				setEmail(result.email);
				op.track("extension_login_verified", {
					success: true,
					email: result.email,
				});
			} else {
				const error = result.error || "Verification failed";

				if (error.includes("Invalid OTP")) {
					setState("invalid_otp");
					op.track("extension_login_failed", {
						reason: "invalid_otp",
						error,
					});
				} else if (error.includes("expired")) {
					setState("expired_otp");
					op.track("extension_login_failed", {
						reason: "expired_otp",
						error,
					});
				} else {
					setState("error");
					setErrorMessage(error);
					op.track("extension_login_failed", {
						reason: "verification_error",
						error,
					});
				}
			}
		} catch (error) {
			const errorMsg = error instanceof Error ? error.message : String(error);
			setState("error");
			setErrorMessage(errorMsg);
			op.track("extension_login_failed", {
				reason: "exception",
				error: errorMsg,
			});
		}
	}, [token, op]);

	useEffect(() => {
		if (state === "loading" && extensionInstalled !== null) {
			if (!extensionInstalled) {
				setState("extension_not_installed");
			} else {
				handleMagicLink();
			}
		} else if (state === "no_token") {
			op.track("extension_login_page_visited", {
				state: "no_token",
			});
		}
	}, [state, handleMagicLink, op, extensionInstalled]);

	const renderContent = useMemo(() => {
		switch (state) {
			case "loading":
				return (
					<Card className="w-full max-w-md mx-auto">
						<CardHeader className="text-center">
							<div className="flex justify-center mb-4">
								<Loader2 className="h-16 w-16 text-primary animate-spin" />
							</div>
							<CardTitle>Verifying Your Login</CardTitle>
							<CardDescription>
								Please wait while we authenticate your request...
							</CardDescription>
						</CardHeader>
					</Card>
				);

			case "success":
				return (
					<Card className="w-full max-w-md mx-auto border-green-500/50">
						<CardHeader className="text-center">
							<div className="flex justify-center mb-4">
								<CheckCircle2 className="h-16 w-16 text-green-500" />
							</div>
							<CardTitle className="text-green-600">
								Login Successful!
							</CardTitle>
							<CardDescription>
								You have been successfully authenticated as {email}.
							</CardDescription>
						</CardHeader>
						<CardContent className="text-center space-y-4">
							<p className="text-sm text-muted-foreground">
								You can now close this window and return to the extension.
							</p>
							<Button
								className="w-full bg-gray-900 dark:bg-gray-100 hover:bg-gray-800 dark:hover:bg-gray-200 text-white dark:text-gray-900 transition-all duration-200"
								onClick={() => {
									if (!extensionOpened) {
										openExtensionPanel((success, error) => {
											if (success) {
												setExtensionOpened(true);
												op.track("extension_panel_opened", {
													success: true,
													email: email,
													source: "login_success",
												});
											} else {
												console.error("Failed to open extension:", error);
												op.track("extension_panel_open_failed", {
													success: false,
													email: email,
													error: error,
													source: "login_success",
												});
											}
										});
									}
								}}
								disabled={extensionOpened}
							>
								{extensionOpened ? (
									<span className="flex items-center space-x-2">
										<CheckCircle className="w-4 h-4" />
										<span>Extension Opened</span>
									</span>
								) : (
									"Open Extension Dashboard"
								)}
							</Button>
						</CardContent>
					</Card>
				);

			case "invalid_otp":
				return (
					<Card className="w-full max-w-md mx-auto border-destructive/50">
						<CardHeader className="text-center">
							<div className="flex justify-center mb-4">
								<XCircle className="h-16 w-16 text-destructive" />
							</div>
							<CardTitle className="text-destructive">
								Invalid Login Link
							</CardTitle>
							<CardDescription>
								The login link you used is not valid.
							</CardDescription>
						</CardHeader>
						<CardContent className="text-center space-y-4">
							<p className="text-sm text-muted-foreground">
								This could be because:
							</p>
							<ul className="text-sm text-muted-foreground list-disc list-inside space-y-1">
								<li>The link has already been used</li>
								<li>The link was copied incorrectly</li>
								<li>The verification code is invalid</li>
							</ul>
							<p className="text-sm text-muted-foreground mt-4">
								Please request a new token through the extension.
							</p>
							<Button
								className="w-full bg-gray-900 dark:bg-gray-100 hover:bg-gray-800 dark:hover:bg-gray-200 text-white dark:text-gray-900 transition-all duration-200"
								onClick={() => {
									if (!extensionOpened) {
										openExtensionPanel((success, error) => {
											if (success) {
												setExtensionOpened(true);
												op.track("extension_panel_opened", {
													success: true,
													source: "invalid_otp",
												});
											} else {
												console.error("Failed to open extension:", error);
												op.track("extension_panel_open_failed", {
													success: false,
													error: error,
													source: "invalid_otp",
												});
											}
										});
									}
								}}
								disabled={extensionOpened}
							>
								{extensionOpened ? (
									<span className="flex items-center space-x-2">
										<CheckCircle className="w-4 h-4" />
										<span>Extension Opened</span>
									</span>
								) : (
									"Open Extension Dashboard"
								)}
							</Button>
						</CardContent>
					</Card>
				);

			case "expired_otp":
				return (
					<Card className="w-full max-w-md mx-auto border-yellow-500/50">
						<CardHeader className="text-center">
							<div className="flex justify-center mb-4">
								<ShieldAlert className="h-16 w-16 text-yellow-500" />
							</div>
							<CardTitle className="text-yellow-600">Link Expired</CardTitle>
							<CardDescription>
								This login link has expired for security reasons.
							</CardDescription>
						</CardHeader>
						<CardContent className="text-center space-y-4">
							<p className="text-sm text-muted-foreground">
								Login links are valid for 10 minutes only.
							</p>
							<p className="text-sm text-muted-foreground">
								Please request a new token through the extension.
							</p>
							<Button
								className="w-full bg-gray-900 dark:bg-gray-100 hover:bg-gray-800 dark:hover:bg-gray-200 text-white dark:text-gray-900 transition-all duration-200"
								onClick={() => {
									if (!extensionOpened) {
										openExtensionPanel((success, error) => {
											if (success) {
												setExtensionOpened(true);
												op.track("extension_panel_opened", {
													success: true,
													source: "expired_otp",
												});
											} else {
												console.error("Failed to open extension:", error);
												op.track("extension_panel_open_failed", {
													success: false,
													error: error,
													source: "expired_otp",
												});
											}
										});
									}
								}}
								disabled={extensionOpened}
							>
								{extensionOpened ? (
									<span className="flex items-center space-x-2">
										<CheckCircle className="w-4 h-4" />
										<span>Extension Opened</span>
									</span>
								) : (
									"Open Extension Dashboard"
								)}
							</Button>
						</CardContent>
					</Card>
				);

			case "extension_not_installed":
				return (
					<Card className="w-full max-w-md mx-auto border-destructive/50">
						<CardHeader className="text-center">
							<div className="flex justify-center mb-4">
								<XCircle className="h-16 w-16 text-destructive" />
							</div>
							<CardTitle className="text-destructive">
								Extension Not Installed
							</CardTitle>
							<CardDescription>
								The Nepse Dashboard extension is not installed in this browser.
							</CardDescription>
						</CardHeader>
						<CardContent className="text-center space-y-4">
							<p className="text-sm text-muted-foreground">
								To use this login link, you need to:
							</p>
							<ul className="text-sm text-muted-foreground list-disc list-inside space-y-1 text-left">
								<li>Install the Nepse Dashboard extension</li>
								<li>
									Open the login link in the same browser where the extension is
									installed
								</li>
							</ul>
							<p className="text-sm text-muted-foreground mt-4">
								Please install the extension or switch to a browser that has it
								installed.
							</p>
						</CardContent>
					</Card>
				);

			case "no_token":
				return (
					<Card className="w-full max-w-md mx-auto border-destructive/50">
						<CardHeader className="text-center">
							<div className="flex justify-center mb-4">
								<Mail className="h-16 w-16 text-muted-foreground" />
							</div>
							<CardTitle>No Login Token Found</CardTitle>
							<CardDescription>
								This page requires a valid login token to proceed.
							</CardDescription>
						</CardHeader>
						<CardContent className="text-center space-y-4">
							<p className="text-sm text-muted-foreground">
								Please click the login link from your email to authenticate.
							</p>
						</CardContent>
					</Card>
				);

			case "error":
				return (
					<Card className="w-full max-w-md mx-auto border-destructive/50">
						<CardHeader className="text-center">
							<div className="flex justify-center mb-4">
								<XCircle className="h-16 w-16 text-destructive" />
							</div>
							<CardTitle className="text-destructive">
								Authentication Failed
							</CardTitle>
							<CardDescription>
								An error occurred while processing your login.
							</CardDescription>
						</CardHeader>
						<CardContent className="text-center space-y-4">
							{errorMessage && (
								<div className="bg-destructive/10 rounded-md p-3">
									<p className="text-sm text-destructive font-mono">
										{errorMessage}
									</p>
								</div>
							)}
							<p className="text-sm text-muted-foreground">
								Please try again through the extension.
							</p>
							<Button
								className="w-full bg-gray-900 dark:bg-gray-100 hover:bg-gray-800 dark:hover:bg-gray-200 text-white dark:text-gray-900 transition-all duration-200"
								onClick={() => {
									if (!extensionOpened) {
										openExtensionPanel((success, error) => {
											if (success) {
												setExtensionOpened(true);
												op.track("extension_panel_opened", {
													success: true,
													source: "error_retry",
													errorMessage: errorMessage,
												});
											} else {
												console.error("Failed to open extension:", error);
												op.track("extension_panel_open_failed", {
													success: false,
													error: error,
													source: "error_retry",
													errorMessage: errorMessage,
												});
											}
										});
									}
								}}
								disabled={extensionOpened}
							>
								{extensionOpened ? (
									<span className="flex items-center space-x-2">
										<CheckCircle className="w-4 h-4" />
										<span>Extension Opened</span>
									</span>
								) : (
									"Open Extension Dashboard"
								)}
							</Button>
						</CardContent>
					</Card>
				);
		}
	}, [state, email, errorMessage, extensionOpened, op]);

	return (
		<div className="min-h-screen flex items-center justify-center p-4 bg-linear-to-br from-background to-muted/20">
			{renderContent}
		</div>
	);
}

export default function ExtensionLoginPage() {
	return (
		<Suspense
			fallback={
				<div className="min-h-screen flex items-center justify-center p-4 bg-linear-to-br from-background to-muted/20">
					<Card className="w-full max-w-md mx-auto">
						<CardHeader className="text-center">
							<div className="flex justify-center mb-4">
								<Loader2 className="h-16 w-16 text-primary animate-spin" />
							</div>
							<CardTitle>Loading...</CardTitle>
							<CardDescription>
								Please wait while we load the login page...
							</CardDescription>
						</CardHeader>
					</Card>
				</div>
			}
		>
			<ExtensionLoginContent />
		</Suspense>
	);
}
