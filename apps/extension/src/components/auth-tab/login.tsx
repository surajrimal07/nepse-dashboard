import { Button } from "@nepse-dashboard/ui/components/button";
import { Card, CardContent } from "@nepse-dashboard/ui/components/card";
import { Input } from "@nepse-dashboard/ui/components/input";
import { Label } from "@nepse-dashboard/ui/components/label";
import { ArrowLeft, Loader2, LogIn, Mail } from "lucide-react";
import { memo, useState } from "react";
import { useHotkeys } from "react-hotkeys-hook";
import useScreenView from "@/hooks/usePageView";
import { emailSchema } from "./schema";

interface LoginViewProps {
	onBack: () => void;
	onSendOTP: (email: string) => Promise<void>;
	setEmail: (email: string) => void;
	checkLogin: (email: string) => Promise<boolean>;
	otpLoading: boolean;
}

const LoginView = memo(
	({ onBack, onSendOTP, setEmail, checkLogin, otpLoading }: LoginViewProps) => {
		useScreenView("/login");

		const [email, setTempEmail] = useState("");
		const [isLoading, setIsLoading] = useState(false);
		const [emailError, setEmailError] = useState("");

		const validateEmail = (email: string): boolean => {
			if (!email.trim()) {
				setEmailError("Email is required");
				return false;
			}

			const result = emailSchema.safeParse({
				email: email.trim(),
			});

			if (!result.success) {
				setEmailError(result.error.message);
				return false;
			}

			setEmailError("");
			return true;
		};

		const handleLogin = async () => {
			if (!validateEmail(email)) {
				return;
			}
			setIsLoading(true);

			setEmail(email);

			const result = await checkLogin(email);

			if (!result) {
				await onSendOTP(email);
			}

			setIsLoading(false);
		};

		const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
			setTempEmail(e.target.value);
			if (emailError) {
				setEmailError("");
			}
		};

		useHotkeys(
			"enter",
			() => {
				handleLogin();
			},
			{
				enabled: !isLoading && !otpLoading && email.trim().length > 0,
				preventDefault: true,
				enableOnFormTags: ["input"],
			},
			[handleLogin, email, isLoading, otpLoading],
		);

		return (
			<div className="w-full h-full flex flex-col bg-linear-to-br from-background to-muted/20 overflow-y-auto">
				<div className="relative shrink-0 pt-4 px-4">
					<button
						type="button"
						onClick={onBack}
						className="p-2 rounded-full hover:bg-muted/50 transition-colors"
						disabled={isLoading}
					>
						<ArrowLeft className="h-4 w-4 text-muted-foreground" />
					</button>
				</div>

				<div className="flex-1 flex flex-col justify-center px-4 py-6">
					<div className="text-center mb-6">
						<div className="mx-auto mb-3 w-14 h-14 rounded-full bg-linear-to-br from-primary/20 to-primary/10 flex items-center justify-center">
							<LogIn className="w-7 h-7 text-primary" />
						</div>
						<h1 className="text-xl font-bold text-foreground mb-2">
							Sign in to NEPSE Dashboard
						</h1>
						<p className="text-sm text-muted-foreground">
							Enter your email to continue
						</p>
					</div>

					<Card className="bg-card/50 backdrop-blur-sm border-border/50 shadow-sm">
						<CardContent className="p-4 space-y-4">
							<div className="space-y-2">
								<Label
									htmlFor="email"
									className="text-sm font-medium text-foreground"
								>
									Email Address
								</Label>
								<div className="relative">
									<Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
									<Input
										id="email"
										type="email"
										placeholder="your.email@example.com"
										value={email}
										onChange={handleEmailChange}
										disabled={isLoading || otpLoading}
										className={`pl-10 ${emailError ? "border-red-500 focus-visible:ring-red-500" : ""}`}
									/>
								</div>
								{emailError && (
									<p className="text-xs text-red-500 mt-1">{emailError}</p>
								)}
							</div>

							<div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3 space-y-1">
								<p className="text-xs font-medium text-blue-600 dark:text-blue-400">
									How it works:
								</p>
								<ul className="text-xs text-muted-foreground space-y-0.5 ml-3 list-disc">
									<li>Enter your email address</li>
									<li>We'll send you a magic link</li>
									<li>Click the link to verify and sign in</li>
								</ul>
							</div>

							<div className="pt-1">
								<Button
									onClick={handleLogin}
									disabled={isLoading || otpLoading || !email.trim()}
									className="w-full h-10 bg-primary hover:bg-primary/90 text-primary-foreground font-medium text-sm shadow-lg hover:shadow-xl transition-all duration-200"
								>
									{isLoading || otpLoading ? (
										<>
											<Loader2 className="mr-2 h-4 w-4 animate-spin" />
											Processing...
										</>
									) : (
										<>
											<Mail className="mr-2 h-4 w-4" />
											Continue with Email
										</>
									)}
								</Button>

								<p className="text-[10px] text-center text-muted-foreground mt-2">
									By signing in, you agree to our Terms of Service and Privacy
									Policy
								</p>
							</div>
						</CardContent>
					</Card>
				</div>
			</div>
		);
	},
);

LoginView.displayName = "LoginView";

export default LoginView;
