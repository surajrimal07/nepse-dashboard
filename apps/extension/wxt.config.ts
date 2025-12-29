import { defineConfig } from "wxt";

export default defineConfig({
	srcDir: "src",
	imports: {
		eslintrc: {
			enabled: 9,
		},
	},
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
	manifest: () => ({
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
		host_permissions: ["<all_urls>"],
		commands: {
			open_popup: {
				suggested_key: {
					default: "Ctrl+Shift+P",
					mac: "Command+Shift+P",
					linux: "Ctrl+Shift+P",
				},
				description: "Open the Nepse Dashboard popup",
			},
			"open-sidebar": {
				suggested_key: {
					default: "Ctrl+Shift+S",
					mac: "Command+Shift+S",
					linux: "Ctrl+Shift+S",
				},
				description: "Open the Nepse Dashboard sidebar",
			},
			"open-options": {
				suggested_key: {
					default: "Ctrl+Shift+O",
					mac: "Command+Shift+O",
					linux: "Ctrl+Shift+O",
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
				matches: ["<all_urls>"],
			},
		],

		externally_connectable: {
			matches: [
				"http://localhost:3005/*", //add nextjs frontend too here
				"https://*.nepsetms.com.np/*",
				"https://www.nepsechatbot.com/*",
			],
		},

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
	dev: {
		server: {
			port: 3333,
		},
	},
});
