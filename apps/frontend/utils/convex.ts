import { ConvexReactClient } from "convex/react";

const URL = process.env.NEXT_PUBLIC_CONVEX_URL;
if (!URL) {
	throw new Error("NEXT_PUBLIC_CONVEX_URL is not set");
}

export const convex = new ConvexReactClient(URL);
