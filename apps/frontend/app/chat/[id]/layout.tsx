"use client";

import { PromptInputProvider } from "@nepse-dashboard/ui/components/ai-elements/prompt-input";
import type { ReactNode } from "react";

export default function ChatLayout({ children }: { children: ReactNode }) {
	return <PromptInputProvider>{children}</PromptInputProvider>;
}
