import { type NextRequest, NextResponse } from "next/server";

export function proxy(_request: NextRequest) {
	return NextResponse.next();
}

export const config = {
	matcher: [
		{
			source:
				"/((?!_next/static|_next/image|favicon.ico|favicons/.*\\.png|manifest.webmanifest|manifest.json|api/.*|fonts/.*|sitemap.xml|robots.txt|manifest.json|manifest.webmanifest|\\.well-known/.*).*)",
			missing: [
				{ type: "header", key: "next-router-prefetch" },
				{ type: "header", key: "purpose", value: "prefetch" },
			],
		},
	],
};
