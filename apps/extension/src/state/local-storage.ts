import type { StateStorage } from "zustand/middleware/persist";
import { browser } from "#imports";

export const LocalStorage: StateStorage = {
	getItem: (name) => {
		return new Promise<string | null>((resolve, reject) => {
			browser.storage.local.get(name, (result) => {
				if (browser.runtime.lastError) {
					return reject(browser.runtime.lastError);
				}
				const val = result[name];
				resolve(typeof val === "string" ? val : null);
			});
		});
	},
	setItem: (name, value) => {
		return new Promise<void>((resolve, reject) => {
			browser.storage.local.set({ [name]: value }, () => {
				if (browser.runtime.lastError) {
					return reject(browser.runtime.lastError);
				}
				resolve();
			});
		});
	},
	removeItem: (name) => {
		return new Promise<void>((resolve, reject) => {
			browser.storage.local.remove(name, () => {
				if (browser.runtime.lastError) {
					return reject(browser.runtime.lastError);
				}
				resolve();
			});
		});
	},
};
