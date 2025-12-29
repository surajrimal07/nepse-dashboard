import { createCrannStateHook } from "crann-fork";
import { appState } from "@/lib/service/app-service";

export const useAppState = createCrannStateHook(appState);
