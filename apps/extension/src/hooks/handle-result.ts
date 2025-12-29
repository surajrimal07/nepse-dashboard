// import { toast } from "sonner";
// import type { ActionNameType } from "@/constants/action-name";
// import { EventName } from "@/types/analytics-types";
// import type { stateResult } from "@/types/misc-types";
// import { OpenPanelWeb } from "@/utils/open-panel-web";

// // handles toasts, error tracking, and analytics events
// interface HandleResultOptions {
// 	actionName: ActionNameType;
// }

// export function handleResult(
// 	result: stateResult,
// 	options: HandleResultOptions,
// ) {
// 	const { actionName } = options;

// 	if (!result.success) {
// 		toast.error(result.message);
// 		OpenPanelWeb.track(EventName.EXCEPTION, {
// 			error: result.message,
// 			name: actionName,
// 		});
// 	} else {
// 		toast.success(result.message);
// 	}

// 	return result;
// }
