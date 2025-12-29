import type { LucideIcon } from "lucide-react";
import {
	AlertCircle,
	CheckCircle2,
	MinusCircle,
	WifiOff,
	XCircle,
} from "lucide-react";
import type { ConnectionState } from "@/types/connection-type";

export const connectionStateConfig: Record<
	ConnectionState,
	{
		icon: LucideIcon;
	}
> = {
	connected: {
		icon: CheckCircle2,
	},
	disconnected: {
		icon: XCircle,
	},
	inactive: {
		icon: AlertCircle,
	},
	disabled: {
		icon: MinusCircle,
	},
	high_latency: {
		icon: AlertCircle,
	},
	medium_latency: {
		icon: AlertCircle,
	},
	no_connection: {
		icon: WifiOff,
	},
};
