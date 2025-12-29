// import { hash } from "bun";

import { CryptoHasher } from 'bun';

// const DELIMITER = "|";

// // Extract primitive serialization to reduce complexity
// function serializePrimitive(obj: unknown, type: string): string {
// 	switch (type) {
// 		case "string":
// 			return `s${obj}`;
// 		case "number":
// 			return `n${obj}`;
// 		case "boolean":
// 			return `b${obj}`;
// 		case "bigint":
// 			return `g${obj}`;
// 		default:
// 			return `${type[0]}${obj}`;
// 	}
// }

// // Extract array serialization
// function serializeArray(obj: unknown[], seen: WeakSet<object>): string {
// 	const len = obj.length;
// 	if (len === 0) {
// 		return "a0";
// 	}

// 	let result = `a${len}${DELIMITER}`;
// 	for (let i = 0; i < len; i++) {
// 		result += ultraFastSerialize(obj[i], seen);
// 		if (i < len - 1) {
// 			result += DELIMITER;
// 		}
// 	}
// 	return result;
// }

// // Extract object serialization
// function serializeObject(obj: object, seen: WeakSet<object>): string {
// 	const keys = Object.keys(obj);
// 	const len = keys.length;

// 	if (len === 0) {
// 		return "o0";
// 	}

// 	keys.sort();

// 	let result = `o${len}${DELIMITER}`;
// 	for (let i = 0; i < len; i++) {
// 		const key = keys[i];
// 		result += `${key}${DELIMITER}${ultraFastSerialize(
// 			// biome-ignore lint/suspicious/noExplicitAny: <iei>
// 			(obj as any)[key],
// 			seen,
// 		)}`;
// 		if (i < len - 1) {
// 			result += DELIMITER;
// 		}
// 	}
// 	return result;
// }

// function ultraFastSerialize(obj: unknown, seen = new WeakSet()): string {
// 	// Handle null/undefined
// 	if (obj === null) {
// 		return "n";
// 	}
// 	if (obj === undefined) {
// 		return "u";
// 	}

// 	const type = typeof obj;

// 	// Handle primitives
// 	if (type !== "object") {
// 		return serializePrimitive(obj, type);
// 	}

// 	// Circular reference check
// 	if (seen.has(obj as object)) {
// 		return "circular";
// 	}
// 	seen.add(obj as object);

// 	// Handle arrays
// 	if (Array.isArray(obj)) {
// 		return serializeArray(obj, seen);
// 	}

// 	// Handle objects
// 	return serializeObject(obj as object, seen);
// }

// // export function CalculateVersion<T extends object>(data: T): number {
// // 	const serialized = ultraFastSerialize(data);
// // 	const encoder = new TextEncoder();
// // 	const bytes = encoder.encode(serialized);
// // 	const hashValue = hash(bytes);

// // 	return Number(hashValue);
// // }

// biome-ignore lint/suspicious/noExplicitAny: <iknow>
export function CalculateVersion(obj: any): string {
  const str = JSON.stringify(obj); // ensure consistent serialization
  const hasher = new CryptoHasher('sha256');
  hasher.update(str);
  return hasher.digest('hex'); // or "base64" if preferred
}
// // Create singleton instance
// const versioning = new DataVersioning();

// // Example usage
// const data = {
// 	items: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
// 	status: "active",
// 	metadata: {
// 		created: "2024-01-28T12:00:00Z",
// 		modified: "2024-01-28T13:00:00Z",
// 		version: "1.0.0",
// 		tags: ["test", "performance", "hash", "large-data"],
// 		config: {
// 			enabled: true,
// 			timeout: 5000,
// 			retries: 3,
// 			settings: {
// 				cache: true,
// 				compression: "gzip",
// 				parameters: [
// 					{
// 						id: "param_1",
// 						value: "value_1",
// 						enabled: true,
// 						metadata: {
// 							description: "First parameter",
// 							type: "string",
// 							required: true,
// 						},
// 					},
// 					{
// 						id: "param_2",
// 						value: "value_2",
// 						enabled: false,
// 						metadata: {
// 							description: "Second parameter",
// 							type: "number",
// 							required: false,
// 						},
// 					},
// 				],
// 			},
// 		},
// 	},
// 	data: [
// 		{
// 			id: "record_1",
// 			timestamp: "2024-01-28T12:30:00Z",
// 			values: [0, 10, 20, 30, 40],
// 			active: true,
// 			details: {
// 				source: "source_A",
// 				priority: 1,
// 				tags: ["tag_1_1", "tag_1_2", "tag_1_3"],
// 			},
// 		},
// 		{
// 			id: "record_2",
// 			timestamp: "2024-01-28T12:45:00Z",
// 			values: [5, 15, 25, 35, 45],
// 			active: false,
// 			details: {
// 				source: "source_B",
// 				priority: 2,
// 				tags: ["tag_2_1", "tag_2_2", "tag_2_3"],
// 			},
// 		},
// 	],
// };

// // Initial versioning
// const versionedData = versioning.version(data);

// // Later, check new data against old hash
// const newData = {
// 	items: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
// 	status: "active",
// 	metadata: {
// 		created: "2024-01-28T12:00:00Z",
// 		modified: "2024-01-28T13:00:00Z",
// 		version: "1.0.0",
// 		tags: ["test", "performanc", "hash", "large-data"],
// 		config: {
// 			enabled: true,
// 			timeout: 5000,
// 			retries: 3,
// 			settings: {
// 				cache: true,
// 				compression: "gzip",
// 				parameters: [
// 					{
// 						id: "param_1",
// 						value: "value_1",
// 						enabled: true,
// 						metadata: {
// 							description: "First parameter",
// 							type: "string",
// 							required: true,
// 						},
// 					},
// 					{
// 						id: "param_2",
// 						value: "value_2",
// 						enabled: false,
// 						metadata: {
// 							description: "Second parameter",
// 							type: "number",
// 							required: false,
// 						},
// 					},
// 				],
// 			},
// 		},
// 	},
// 	data: [
// 		{
// 			id: "record_1",
// 			timestamp: "2024-01-28T12:30:00Z",
// 			values: [0, 10, 20, 30, 40],
// 			active: true,
// 			details: {
// 				source: "source_A",
// 				priority: 1,
// 				tags: ["tag_1_1", "tag_1_2", "tag_1_3"],
// 			},
// 		},
// 		{
// 			id: "record_2",
// 			timestamp: "2024-01-28T12:45:00Z",
// 			values: [5, 15, 25, 35, 45],
// 			active: false,
// 			details: {
// 				source: "source_B",
// 				priority: 2,
// 				tags: ["tag_2_1", "tag_2_2", "tag_2_3"],
// 			},
// 		},
// 	],
// };
// const { isChanged, newVersionedData } = versioning.isChanged(
// 	newData,
// 	versionedData.version,
// );
// console.log("Changed?", isChanged);
// console.log(
// 	`initial version hash: ${versionedData.version} and new version hash: ${newVersionedData.version}`,
// );

// export { DataVersioning, versioning, type VersionedData };
