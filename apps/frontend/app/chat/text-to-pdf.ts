import { jsPDF } from "jspdf";
import type { websiteContent } from "./type";

// function blobToDataUrl(blob: Blob): Promise<string> {
// 	return new Promise((resolve, reject) => {
// 		const reader = new FileReader();
// 		reader.onloadend = () => resolve(reader.result as string);
// 		reader.onerror = reject;
// 		reader.readAsDataURL(blob); // <-- IMPORTANT
// 	});
// }

export function parsedNewsToPdf(data: websiteContent): File {
	const doc = new jsPDF();

	const marginX = 15;
	let y = 20;
	const pageWidth = doc.internal.pageSize.getWidth();
	const maxWidth = pageWidth - marginX * 2;

	doc.setFont("Times", "bold");
	doc.setFontSize(16);
	doc.text(data.title, marginX, y, { maxWidth });
	y += 12;

	doc.setFont("Times", "normal");
	doc.setFontSize(10);
	doc.text(`Language: ${data.lang}`, marginX, y);
	y += 8;

	doc.setFontSize(12);
	const lines = doc.splitTextToSize(data.content, maxWidth);
	doc.text(lines, marginX, y);

	// IMPORTANT: return File (not base64)
	const blob = doc.output("blob");

	return new File([blob], "news.pdf", {
		type: "application/pdf",
	});
}
