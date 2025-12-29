import { S3Client } from "bun";
import env from "env";

// CloudFlare R2
export const r2 = new S3Client({
	accessKeyId: env.CLOUDFLARE_ACCESSS_KEY,
	secretAccessKey: env.CLOUDFLARE_ACCESSS_SECRET,
	bucket: env.CLOUDFLARE_BUCKET_NAME,
	endpoint: env.CLOUDFLARE_HOST,
});

export const logosBucket = new S3Client({
	accessKeyId: env.CLOUDFLARE_ACCESSS_KEY,
	secretAccessKey: env.CLOUDFLARE_ACCESSS_SECRET,
	bucket: env.CLOUDFLARE_LOGO_BUCKET_NAME,
	endpoint: env.CLOUDFLARE_HOST,
	region: env.CLOUDFLARE_LOGO_REGION,
});