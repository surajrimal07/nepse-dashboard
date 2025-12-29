import type { NextConfig } from "next";

const nextConfig: NextConfig = {
	images: { unoptimized: true },
	reactStrictMode: false,
	reactCompiler: true,
	productionBrowserSourceMaps: false,
	devIndicators: false,
	experimental: {
		serverSourceMaps: false,
	},
};

export default nextConfig;
