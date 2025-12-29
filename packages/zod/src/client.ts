import { z as baseZ } from "zod";

baseZ.config({ jitless: true });
export const z = baseZ;
