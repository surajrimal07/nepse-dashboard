import z from "@nepse-dashboard/zod";

export const NewsSites = {
	MEROLAGANI: "merolagani",
	SHARESANSAR: "sharesansar",
} as const;

export type NewsSiteType = (typeof NewsSites)[keyof typeof NewsSites];

export const TabStateSchema = z.enum(["nepse", "dashboard"]);
export type TabState = z.infer<typeof TabStateSchema>;

export const TabStateEnum = {
	HOME: "home",
	DASHBOARD: "dashboard",
} as const;

export type TabStateEnumType = (typeof TabStateEnum)[keyof typeof TabStateEnum];

export const CountTypesSchema = z.enum([
	TabStateEnum.HOME,
	TabStateEnum.DASHBOARD,
]);
export type CountTypes = z.infer<typeof CountTypesSchema>;

export type DashboardDirection = "next" | "prev";
