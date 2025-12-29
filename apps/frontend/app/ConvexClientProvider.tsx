"use client";

import { ConvexProvider } from "convex/react";
import type { ReactNode } from "react";
import { convex } from "@/utils/convex";

export function ConvexClientProvider({ children }: { children: ReactNode }) {
	return <ConvexProvider client={convex}>{children}</ConvexProvider>;
}
