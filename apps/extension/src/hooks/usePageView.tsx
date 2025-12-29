import { useEffect, useRef } from "react";
import { page } from "@/lib/analytics";
import { Env } from "@/types/analytics-types";

function useScreenView(path: string, title?: string) {
	const hasTrackedRef = useRef(false);

	useEffect(() => {
		const trackPage = () => {
			if (!hasTrackedRef.current) {
				page({
					context: Env.CONTENT,
					path,
					title,
				});

				hasTrackedRef.current = true;
			}
		};
		trackPage();
	}, [path]);
}

export default useScreenView;
