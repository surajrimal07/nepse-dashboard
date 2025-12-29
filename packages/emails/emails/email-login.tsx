import {
	Body,
	Container,
	Head,
	Heading,
	Html,
	Img,
	Link,
	Preview,
	Section,
	Text,
} from "@react-email/components";

interface EmailLoginProps {
	link: string;
	otp: number;
	newUser: boolean;
}

const EmailLogin = ({
	link = "https://nepsechatbot.com/verify",
	otp = 123456,
	newUser = false,
}: EmailLoginProps) => {
	const url = `${link}/nepsedashboard/login?token=${otp}`;

	return (
		<Html>
			<Head />
			<Body
				style={{
					backgroundColor: "#0a0a0a",
					fontFamily:
						'-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Ubuntu, sans-serif',
				}}
			>
				<Preview>Your verification code for Nepse Dashboard</Preview>
				<Container
					style={{
						backgroundColor: "#ffffff",
						margin: "24px auto",
						padding: "0",
						borderRadius: "12px",
						maxWidth: "520px",
						border: "1px solid #e5e7eb",
					}}
				>
					<Section
						style={{
							background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
							padding: "24px 32px",
							borderTopLeftRadius: "12px",
							borderTopRightRadius: "12px",
							textAlign: "center",
						}}
					>
						<Img
							src="https://logos.nepsechatbot.com/logo.jpg"
							width="48"
							height="48"
							alt="Nepse Dashboard Logo"
							style={{
								margin: "0 auto 12px",
								borderRadius: "8px",
							}}
						/>
						<Heading
							style={{
								color: "#ffffff",
								fontSize: "22px",
								fontWeight: "700",
								margin: "0",
								lineHeight: "1.3",
							}}
						>
							Welcome{" "}
							{newUser ? "to Nepse Dashboard!" : "back to Nepse Dashboard!"}
						</Heading>
					</Section>
					<Section style={{ padding: "28px 32px 0px" }}>
						<Text
							style={{
								color: "#111827",
								fontSize: "15px",
								lineHeight: "1.5",
								margin: "0 0 16px",
							}}
						>
							Hello there! 👋
						</Text>
						<Text
							style={{
								color: "#4b5563",
								fontSize: "14px",
								lineHeight: "1.5",
								margin: "0 0 20px",
							}}
						>
							We received a request to sign in to your account. You can use the
							magic link below or enter the OTP code to complete your sign-in.
						</Text>

						<Section
							style={{
								backgroundColor: "#f3f4f6",
								borderRadius: "10px",
								padding: "18px 0 10px 0",
								margin: "0 0 24px 0",
								textAlign: "center",
							}}
						>
							<Text
								style={{
									color: "#667eea",
									fontWeight: "700",
									fontSize: "13px",
									margin: "0 0 8px 0",
									letterSpacing: "1px",
								}}
							>
								Or use this OTP code:
							</Text>
							<Text
								style={{
									color: "#111827",
									fontWeight: "bold",
									fontSize: "28px",
									letterSpacing: "8px",
									margin: "0 0 8px 0",
								}}
							>
								{otp}
							</Text>
							<Text
								style={{
									color: "#6b7280",
									fontSize: "12px",
									margin: "0",
								}}
							>
								This code is valid for a limited time.
							</Text>
						</Section>

						<Section
							style={{
								textAlign: "center",
								margin: "0 0 24px",
							}}
						>
							<Link
								href={url}
								style={{
									backgroundColor: "#667eea",
									color: "#ffffff",
									padding: "12px 28px",
									borderRadius: "8px",
									textDecoration: "none",
									fontWeight: "600",
									fontSize: "14px",
									display: "inline-block",
								}}
							>
								Sign in with Magic Link
							</Link>
						</Section>
					</Section>

					<Section
						style={{
							backgroundColor: "#f9fafb",
							padding: "14px 32px",
							borderBottomLeftRadius: "12px",
							borderBottomRightRadius: "12px",
							borderTop: "2px solid #e5e7eb",
						}}
					>
						<Text
							style={{
								color: "#6b7280",
								fontSize: "13px",
								lineHeight: "1.5",
								margin: "0 0 12px",
								textAlign: "center",
							}}
						>
							Need help?{" "}
							<Link
								href="https://nepsechatbot.com/support"
								style={{
									color: "#667eea",
									textDecoration: "none",
									fontWeight: "500",
								}}
							>
								Support Center
							</Link>
						</Text>
						<Text
							style={{
								color: "#9ca3af",
								fontSize: "11px",
								lineHeight: "1.4",
								margin: "0",
								textAlign: "center",
							}}
						>
							© 2025 Nepse Dashboard. All rights reserved.
							<br />
							Nepal Stock Exchange trading dashboard.
						</Text>
					</Section>
				</Container>

				<Container style={{ maxWidth: "520px", margin: "0 auto" }}>
					<Text
						style={{
							color: "#6b7280",
							fontSize: "11px",
							textAlign: "center",
							margin: "16px 0",
						}}
					>
						<Link
							href="https://nepsechatbot.com/privacy"
							style={{
								color: "#9ca3af",
								textDecoration: "underline",
								margin: "0 6px",
							}}
						>
							Privacy
						</Link>
						•
						<Link
							href="https://nepsechatbot.com/terms"
							style={{
								color: "#9ca3af",
								textDecoration: "underline",
								margin: "0 6px",
							}}
						>
							Terms
						</Link>
					</Text>
				</Container>
			</Body>
		</Html>
	);
};

export default EmailLogin;
