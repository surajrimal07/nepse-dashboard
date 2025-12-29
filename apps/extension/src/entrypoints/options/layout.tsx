import { Outlet } from "@tanstack/react-router";
import Footer from "./footer";
import { OptionsNavTabs } from "./nav";

export function OptionsLayoutRoute() {
	return (
		<div className="flex flex-col min-h-screen max-w-7xl mx-auto w-full px-6 md:px-10 lg:px-14 z-500">
			<div className="p-6 pb-0">
				<OptionsNavTabs />
			</div>
			<div className="flex-1 p-6 pt-2">
				<Outlet />
			</div>
			<Footer />
		</div>
	);
}
