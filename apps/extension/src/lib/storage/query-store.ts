import { createAsyncStoragePersister } from "@tanstack/query-async-storage-persister";
// import type {
// 	PersistedClient,
// 	Persister,
// } from "@tanstack/react-query-persist-client";

// // Browser extension storage wrapper (uses browser.storage.local)
// const storageKey = "tsQueryCache";

// export const queryStoragePersister: Persister = {
// 	persistClient: async (client: PersistedClient) => {
// 		return new Promise<void>((resolve, reject) => {
// 			browser.storage.local.set(
// 				{ [storageKey]: JSON.stringify(client) },
// 				() => {
// 					if (browser.runtime.lastError)
// 						return reject(browser.runtime.lastError);
// 					resolve();
// 				},
// 			);
// 		});
// 	},

// 	restoreClient: async () => {
// 		return new Promise<PersistedClient | undefined>((resolve, reject) => {
// 			browser.storage.local.get(storageKey, (result) => {
// 				if (browser.runtime.lastError) return reject(browser.runtime.lastError);
// 				if (!result[storageKey]) return resolve(undefined);
// 				try {
// 					resolve(JSON.parse(result[storageKey]) as PersistedClient);
// 				} catch (_e) {
// 					resolve(undefined);
// 				}
// 			});
// 		});
// 	},

// 	removeClient: async () => {
// 		return new Promise<void>((resolve, reject) => {
// 			browser.storage.local.remove(storageKey, () => {
// 				if (browser.runtime.lastError) return reject(browser.runtime.lastError);
// 				resolve();
// 			});
// 		});
// 	},
// };

export const queryStoragePersister = createAsyncStoragePersister({
	storage: window.localStorage,
});
