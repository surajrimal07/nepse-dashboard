// import {
// 	Sidebar,
// 	SidebarContent,
// 	SidebarGroup,
// 	SidebarGroupContent,
// 	SidebarGroupLabel,
// 	SidebarHeader,
// 	SidebarMenu,
// 	SidebarMenuButton,
// 	SidebarMenuItem,
// } from "@nepse-dashboard/ui/components/sidebar";
// import { useRouter } from "@tanstack/react-router";
// import { URLS } from "@/constants/app-urls";
// import { version } from "../../../../package.json";
// import { NAV_ITEMS } from "./nav-items";

// export function AppSidebar() {
// 	const router = useRouter();

// 	return (
// 		<Sidebar collapsible="icon" variant="inset">
// 			<SidebarHeader className="group-data-[state=expanded]:px-5 group-data-[state=expanded]:pt-4 transition-all">
// 				<a href={URLS.welcome_url} className="flex items-center gap-2">
// 					<span className="text-md font-bold overflow-hidden truncate">
// 						{"Nepse Dashboard"}
// 					</span>
// 					<span className="text-xs text-muted-foreground overflow-hidden truncate">
// 						{`v${version}`}
// 					</span>
// 				</a>
// 			</SidebarHeader>
// 			<SidebarContent className="group-data-[state=expanded]:px-2 transition-all">
// 				<SidebarGroup>
// 					<SidebarGroupLabel>Options</SidebarGroupLabel>
// 					<SidebarGroupContent>
// 						<SidebarMenu>
// 							{Object.entries(NAV_ITEMS).map(([key, item]) => (
// 								<SidebarMenuItem key={key}>
// 									<SidebarMenuButton
// 										onClick={() =>
// 											router.navigate({ to: `/options/${item.url}` })
// 										}
// 									>
// 										<item.icon />
// 										<span>{item.title}</span>
// 									</SidebarMenuButton>
// 								</SidebarMenuItem>
// 							))}
// 						</SidebarMenu>
// 					</SidebarGroupContent>
// 				</SidebarGroup>
// 			</SidebarContent>
// 		</Sidebar>
// 	);
// }
