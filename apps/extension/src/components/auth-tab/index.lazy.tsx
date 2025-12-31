import { api } from "@nepse-dashboard/convex/convex/_generated/api";
import { createLazyRoute } from "@tanstack/react-router";
import { useAction } from "convex/react";
import { useCallback, useState } from "react";
import { toast } from "sonner";
import LoggedInView from "@/components/auth-tab/logged-in";
import LoginView from "@/components/auth-tab/login";
import NotLoggedInView from "@/components/auth-tab/not-logged";
import Loading from "@/components/loading";
import { useUser } from "@/hooks/useUser";
import { useAuth } from "@/lib/auth/auth-context";
import { convex } from "@/lib/query";
import { cn } from "@/lib/utils";
import { profileRoute } from "@/routes";
import BackButton from "../back-button/back-button";
import { OTPForm } from "./otp-form";

export const Route = createLazyRoute("/profile")({
	component: UserTab,
});

export default function UserTab() {
	const { fromAuthFlow } = profileRoute.useSearch();
	const { logout, setUser } = useUser();
	const { user: authUser, isAuthenticated, isLoading: authLoading } = useAuth();
	const [loading, setLoading] = useState(false);
	const [showLogin, setShowLogin] = useState(false);
	const [showOTPForm, setShowOTPForm] = useState(false);

	const [verificationEmail, setVerificationEmail] = useState<string | null>(
		null,
	);
	const sendVerificationEmail = useAction(api.emails.sendEmailVerification);

	const handleShowLogin = useCallback(() => {
		setShowLogin(true);
	}, []);

	const handleLogout = useCallback(async () => {
		logout();
		setShowLogin(true);
	}, [logout]);

	const handleBackToWelcome = useCallback(() => {
		setShowLogin(false);
		setVerificationEmail(null);
	}, []);

	const handleSetEmail = useCallback((email: string) => {
		setVerificationEmail(email);
	}, []);

	const handleSendOtp = useCallback(
		async (email: string) => {
			setLoading(true);

			if (!authUser || !authUser.randomId || !email) {
				toast.error("Extension is not initialized properly. Please try again.");
				setLoading(false);
				return;
			}

			const promise = sendVerificationEmail({
				to: email,
				randomId: authUser.randomId,
			});

			toast.promise(promise, {
				loading: "Sending verification email...",
				success: (result) => {
					if (result.success) {
						setShowOTPForm(true);
						setLoading(false);
						return "Verification email sent! Please check your inbox.";
					} else {
						setLoading(false);

						throw new Error(
							result.message ||
								"Failed to send verification email. Please try again.",
						);
					}
				},
				error: (err) => {
					setLoading(false);
					return (
						err.message ||
						"Failed to send verification email. Please try again."
					);
				},
			});
		},
		[authUser, sendVerificationEmail, setShowOTPForm],
	);

	const handleLogin = useCallback(
		async (email: string): Promise<boolean> => {
			setLoading(true);

			if (!authUser || !authUser.randomId || !email) {
				toast.error("Email is required to login.");
				setLoading(false);
				return false;
			}

			const isAuthorized = await convex.query(api.users.isUserAuthorized, {
				randomId: authUser.randomId,
				email,
			});

			const user = isAuthorized.data;

			if (!user) {
				// means user has not been created, procced with otp verification
				setLoading(false);
				return false;
			}

			await setUser({
				email: user.email,
				image: user.image ? user.image : null,
			});

			setShowLogin(false);

			setLoading(false);

			return true;
		},
		[authUser, setUser],
	);

	if (authLoading) {
		return <Loading />;
	}

	return (
		<div
			className={cn(
				fromAuthFlow
					? "fixed h-full top-0 left-0 right-0 z-50 bg-background rounded-lg text-gray-10"
					: "p-1",
			)}
		>
			{isAuthenticated && authUser ? (
				<LoggedInView
					user={authUser}
					onLogout={handleLogout}
					fromAuthFlow={fromAuthFlow}
				/>
			) : showOTPForm && verificationEmail ? (
				<OTPForm
					onBack={handleBackToWelcome}
					email={verificationEmail}
					resend={handleSendOtp}
					onOTPVerified={handleLogin}
				/>
			) : showLogin ? (
				<LoginView
					onBack={handleBackToWelcome}
					onSendOTP={handleSendOtp}
					setEmail={handleSetEmail}
					checkLogin={handleLogin}
					otpLoading={loading}
				/>
			) : (
				<NotLoggedInView onLogin={handleShowLogin} />
			)}

			<BackButton showBack={!fromAuthFlow} />
		</div>
	);
}
