import { ConvexClient, ConvexHttpClient } from "convex/browser";
import env, { isDevelopment } from "env";

const cloudUrl = isDevelopment ? env.CONVEX_CLOUD_DEV : env.CONVEX_CLOUD_PROD;
const siteUrl = isDevelopment ? env.CONVEX_SITE_DEV : env.CONVEX_SITE_PROD;

export const httpConvex = new ConvexHttpClient(siteUrl);

export const convex = new ConvexClient(cloudUrl);
