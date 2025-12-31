import { api } from "@nepse-dashboard/convex/convex/_generated/api";
import { Button } from "@nepse-dashboard/ui/components/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@nepse-dashboard/ui/components/card";
import {
	Field,
	FieldDescription,
	FieldGroup,
	FieldLabel,
} from "@nepse-dashboard/ui/components/field";
import {
	InputOTP,
	InputOTPGroup,
	InputOTPSlot,
} from "@nepse-dashboard/ui/components/input-otp";
import { ArrowLeft } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import useScreenView from "@/hooks/usePageView";
import { track } from "@/lib/analytics";
import { convex } from "@/lib/query";
import { cn } from "@/lib/utils";
import { Env, EventName } from "@/types/analytics-types";

interface OTPFormProps {
	onBack: () => void;
	email: string;
	resend: (email: string) => void;
	onOTPVerified: (email: string) => void;
}

export function OTPForm({
	onBack,
	email,
	resend,
	onOTPVerified,
}: OTPFormProps) {
	const [error, setError] = useState<boolean>(false);
	const [loading, setLoading] = useState<boolean>(false);
	const [otp, setOtp] = useState<string>("");

	useScreenView("/otp-form");

	const handleVerifyOtp = async (otp: number) => {
		setLoading(true);

		if (!otp || otp.toString().length !== 6) {
			setError(true);
			toast.error("Please enter a valid 6-digit code.");
			setLoading(false);

			void track({
				context: Env.UNIVERSAL,
				eventName: EventName.OTP_ERROR,
				params: {
					otp,
				},
			});

			return;
		}

		const verify = await convex.mutation(api.email.verifyOTP, {
			otp,
		});

		if (verify.success) {
			toast.success(`Welcome, ${email}!`);
			onOTPVerified(email);
		} else {
			setError(true);
			setOtp("");
			toast.error(
				"error" in verify && verify.error
					? verify.error
					: "Failed to verify OTP. Please try again.",
			);
		}

		setLoading(false);
	};

	// Automatically verify OTP when 6 digits are entered
	useEffect(() => {
		if (otp.length === 6) {
			handleVerifyOtp(Number(otp));
		}
	}, [otp]);

	return (
		<>
			<div className="relative shrink-0 pt-4 px-4">
				<button
					type="button"
					onClick={onBack}
					className="p-2 rounded-full hover:bg-muted/50 transition-colors"
					disabled={loading}
				>
					<ArrowLeft className="h-4 w-4 text-muted-foreground" />
				</button>
			</div>
			<div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
				<div className="w-full max-w-xs">
					<Card>
						<CardHeader>
							<CardTitle>Enter verification code</CardTitle>
							<CardDescription>
								We sent a 6-digit code to your email {email}.
							</CardDescription>
						</CardHeader>
						<CardContent>
							<form
								onSubmit={async (e) => {
									e.preventDefault();
									if (otp.length !== 6) return;
									await handleVerifyOtp(Number(otp));
								}}
							>
								<FieldGroup>
									<Field>
										<FieldLabel htmlFor="otp">Verification code</FieldLabel>
										<InputOTP
											maxLength={6}
											id="otp"
											required
											value={otp}
											onChange={(value) => {
												if (error) setError(false);
												setOtp(value);
											}}
											aria-invalid={error}
										>
											<InputOTPGroup className="gap-2.5 *:data-[slot=input-otp-slot]:rounded-md *:data-[slot=input-otp-slot]:border">
												<InputOTPSlot index={0} />
												<InputOTPSlot index={1} />
												<InputOTPSlot index={2} />
												<InputOTPSlot index={3} />
												<InputOTPSlot index={4} />
												<InputOTPSlot index={5} />
											</InputOTPGroup>
										</InputOTP>
										<FieldDescription
											className={cn(
												"transition-colors",
												error && "text-destructive",
											)}
										>
											{error
												? "Invalid verification code. Please try again."
												: "Enter the 6-digit code sent to your email."}
										</FieldDescription>
									</Field>
									<FieldGroup>
										<Button
											className="w-full h-10 bg-primary hover:bg-primary/90 text-primary-foreground font-medium text-sm shadow-lg hover:shadow-xl transition-all duration-200"
											type="submit"
											disabled={loading}
										>
											Verify
										</Button>
										<FieldDescription className="text-center">
											Didn&apos;t receive the code?{" "}
											<button
												type="button"
												onClick={() => resend(email)}
												className="underline text-primary hover:text-primary/80"
											>
												Resend
											</button>
										</FieldDescription>
									</FieldGroup>
								</FieldGroup>
							</form>
						</CardContent>
					</Card>
				</div>
			</div>
		</>
	);
}
