// export const handleGoogleLogin = async (): Promise<string | null> => {
// 	const manifest = browser.runtime.getManifest();

// 	if (!manifest.oauth2) {
// 		throw new Error("OAuth2 configuration is missing in manifest");
// 	}

// 	console.log("manifest", manifest);
// 	console.log(browser.runtime.id);

// 	const redirectUri = `https://${browser.runtime.id}.chromiumapp.org`;
// 	const state = Math.random().toString(36).substring(7);

// 	const params = new Map([
// 		["state", state],
// 		["client_id", manifest.oauth2.client_id],
// 		["response_type", "id_token"],
// 		["access_type", "offline"],
// 		["redirect_uri", redirectUri],
// 		["prompt", "consent"],
// 		["scope", manifest.oauth2?.scopes?.join(" ") || ""],
// 	]);

// 	const url = new URL("https://accounts.google.com/o/oauth2/auth");
// 	params.forEach((value, key) => {
// 		url.searchParams.set(key, value);
// 	});

// 	return new Promise((resolve, reject) => {
// 		browser.identity.launchWebAuthFlow(
// 			{
// 				url: url.href,
// 				interactive: true,
// 			},
// 			(redirectedTo) => {
// 				if (browser.runtime.lastError || !redirectedTo) {
// 					reject(null);
// 				} else {
// 					const url = new URL(redirectedTo);
// 					const params = new URLSearchParams(url.hash);
// 					const idToken = params.get("id_token");

// 					if (idToken) {
// 						resolve(idToken);
// 					} else {
// 						reject(null);
// 					}
// 				}
// 			},
// 		);
// 	});
// };
