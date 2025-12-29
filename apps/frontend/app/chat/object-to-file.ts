// export function objectToFile(data: unknown, filename = "news.json"): File {
// 	const json = JSON.stringify(data, null, 2);

// 	const blob = new Blob([json], {
// 		type: "application/json",
// 	});

// 	return new File([blob], filename, {
// 		type: "application/json",
// 	});
// }

// export function parsedNewsToTextFile(data: unknown): File {
// 	const text = `
// TITLE:
// ${data.title}

// LANGUAGE:
// ${data.lang}

// CONTENT:
// ${data.content}
// `.trim();

// 	return new File([text], "news.txt", {
// 		type: "text/plain",
// 	});
// }
