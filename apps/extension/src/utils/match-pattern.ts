import { MatchPattern } from "#imports";

import {
	mero_watch_url,
	naasa_watch_url,
	tms_watch_url,
} from "@/constants/content-url";

export const tmsPattern = new MatchPattern(tms_watch_url);
export const meroPattern = new MatchPattern(mero_watch_url);
export const naasaPattern = new MatchPattern(naasa_watch_url);
