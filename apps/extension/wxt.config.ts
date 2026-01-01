import { defineConfig } from "wxt";

export default defineConfig({
	srcDir: "src",
	imports: false,
	webExt: {
		binaries: {
			chrome: "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
		},
	},

	manifestVersion: 3,
	modules: ["@wxt-dev/module-react", "@wxt-dev/auto-icons"],
	react: {
		vite: {
			babel: {
				plugins: [["babel-plugin-react-compiler", { target: "19" }]],
			},
		},
	},
	manifest: ({ mode, browser }) => ({
		name: "Nepse Dashboard",
		description:
			"Browser extension enhancing NEPSE TMS and Meroshare with live updates, login management, and auto-fill for better UX.",
		minimum_chrome_version: "102.0",
		content_security_policy: {
			extension_pages: "script-src 'self'; frame-ancestors 'none';",
		},
		key: "MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA/E2FImSMkkejjnjjlIgc56TIITcx8HeL/oNnKqfwILxFSnf2hw4u9aoOzo/3I59u8B4IB8dm/YvdEUBPo5NWgzEQk+qwMQMMCGibcvef+TPlc8/zlnFUE1x2OCEEOVDdaR8uEAWeMj/U64d7A3kEWhIGl9foXKbvfCliUrNPKAdR2znhRUUGExJZMw+UMM55hqcUcMXJn7ZgNP+nIa/0nXc8tDqYu89K+dATHFq0EL7MSxXZLkaE+px8y+EPhjJmboosil2Jx879DrOzxBBhqHVpfRQxPdTLtAX670IF8amwWWi0GQPsMPEam1tSC7PDroB4aCjT1mm8dqJ0KZGg7QIDAQAB",

		permissions: [
			"storage",
			"background",
			"clipboardWrite",
			"activeTab",
			"notifications",
			"unlimitedStorage",
			"contextMenus",
			"tabs",
		],
		host_permissions: ["*://*/*"],
		commands: {
			openpopup: {
				suggested_key: {
					default: "Alt+P",
					mac: "Command+P",
					linux: "Alt+P",
				},
				description: "Open the Nepse Dashboard popup",
			},
			opensidebar: {
				suggested_key: {
					default: "Alt+S",
					mac: "Command+S",
					linux: "Alt+S",
				},
				description: "Open the Nepse Dashboard sidebar",
			},
			openoptions: {
				suggested_key: {
					default: "Alt+O",
					mac: "Command+O",
					linux: "Alt+O",
				},
				description: "Open the Nepse Dashboard options page",
			},
		},

		web_accessible_resources: [
			{
				resources: [
					"assets/empty.jpg",
					"assets/data/bold_data.json",
					"assets/data/slim_data.json",
				],
				matches: ["https://*.nepsetms.com.np/*"],
			},
			{
				resources: ["icons/*.png"],
				matches: ["*://*/*"],
			},
		],

		externally_connectable: {
			matches:
				mode === "development"
					? [
							"http://localhost:3005/*",
							"https://*.nepsetms.com.np/*",
							"https://www.nepsechatbot.com/*",
						]
					: ["https://*.nepsetms.com.np/*", "https://www.nepsechatbot.com/*"],
		},

		...(browser === "firefox" && {
			browser_specific_settings: {
				gecko: {
					id: "nepse-account-manager@surajrimal.dev",
					strict_min_version: "109.0",
					data_collection_permissions: {
						required: ["none"],
					},
				},
			},
		}),
	}),
	dev: {
		server: {
			port: 3333,
		},
	},
});
