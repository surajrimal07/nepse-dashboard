import { OpenPanelComponent } from "@openpanel/nextjs";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ThemeProvider } from "next-themes";
import type { ReactNode } from "react";
import { Toaster } from "sonner";
import { ConvexClientProvider } from "./ConvexClientProvider";
import "../globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
	title: "Nepse Dashboard",
	description: "A complete dashboard for Nepse analysis",
};

export default function RootLayout({ children }: { children: ReactNode }) {
	const isProduction = process.env.NODE_ENV === "production";

	return (
		<html lang="en" suppressHydrationWarning>
			<body className={`${inter.className} bg-background min-h-screen`}>
				<OpenPanelComponent
					apiUrl="/api/op"
					cdnUrl="/api/op/op1.js"
					clientId={
						isProduction
							? process.env.NEXT_PUBLIC_OPENPANEL_ID
							: process.env.NEXT_PUBLIC_OPENPANEL_ID_DEV
					}
					trackScreenViews={true}
					trackOutgoingLinks={true}
					trackAttributes={true}
				/>
				<ThemeProvider
					attribute="class"
					defaultTheme="system"
					enableSystem
					disableTransitionOnChange
				>
					<ConvexClientProvider>
						<main>{children}</main>
					</ConvexClientProvider>

					<Toaster />
				</ThemeProvider>
			</body>
		</html>
	);
}
