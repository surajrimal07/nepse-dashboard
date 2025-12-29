import { fetchURL, Image } from "image-js";
import type { SolveResult } from "@/types/content-types";
import { ResultTypes } from "@/types/content-types";
import DATA_BOLD from "../../assets/data/bold_data.json";
import DATA_SLIM from "../../assets/data/slim_data.json";
import EMPTY from "../../assets/empty.jpg";

const FACTORS = [1, 3, 2, 8, 3];

enum Kind {
	Bold = 0,
	Slim = 1,
}

async function solve_captcha(
	captcha_uri: string,
	kind?: Kind,
): Promise<SolveResult> {
	let captcha_value: number[][] | null = null;

	let data: { [key: string]: number[] };

	if (kind === Kind.Bold || !kind) {
		data = DATA_BOLD;
	} else {
		data = DATA_SLIM;
	}

	const captcha_img = await fetchURL(captcha_uri);
	captcha_value = await evaluate_captcha(captcha_img);

	let captcha = "";

	for (let i = 0; i < captcha_value.length; i++) {
		const item = captcha_value[i];
		const sim: Array<[string, number]> = Object.entries(data).map(
			(character) => {
				let abs_sum = 0;

				item.forEach((indv_property, index) => {
					abs_sum +=
						FACTORS[index] * Math.abs(character[1][index] - indv_property);
				});

				return [character[0], abs_sum];
			},
		);

		const sorted_values = sim.sort((a, b) => a[1] - b[1]);

		if (
			sorted_values[0][1] > 60 ||
			sorted_values[1][1] - sorted_values[0][1] < 5
		) {
			if (kind) {
				return {
					type: ResultTypes.LowConfidence,
					value: captcha,
				};
			}
			return solve_captcha(captcha_uri, Kind.Slim);
		}

		captcha += sorted_values[0][0];
	}

	if (captcha_value.length === 6) {
		if (typeof window === "object") {
			const captcha_field = document?.getElementById(
				"captchaEnter",
			) as HTMLInputElement;

			captcha_field.value = captcha;

			captcha_field?.dispatchEvent(new Event("input"));
		}

		return { type: ResultTypes.Success, value: captcha };
	}
	return {
		type: ResultTypes.InvalidLength,
		value: captcha,
	};
}

/*
Image is first splitted into individual characters by finding empty line between
characters.

Then each character is evalauated based on 5 factors:
  - Average Pixel Value
  - Horizontal Length of Image
  - Average Pixel of Vertical Left Half of Image
  - Average Pixel of Horizontal Top Half of Image
  - Average Pixel of Horizontal Bottom Half of Image
*/
async function evaluate_captcha(img: Image): Promise<number[][]> {
	const cleaned = await clean_image(img);

	let counter = 0;
	let matrix: number[] = [];
	const matrix_list: number[][] = [];

	// Splitting images by characters
	for (let i = 0; i < 130; i++) {
		let columnEmpty = true;
		for (let j = 0; j < 35; j++) {
			const pixelIndex = 130 * j + i;
			const pixelValue = cleaned.getRawImage().data[pixelIndex];

			if (pixelValue) {
				if (!counter) {
					matrix.splice(0, matrix.length - (matrix.length % 35));
				}
				columnEmpty = false;
				matrix.push(1);
				counter++;
			} else if (j === 34 && counter && columnEmpty) {
				matrix.push(0);
				matrix_list.push(matrix.splice(0, matrix.length - 35));

				matrix = [];
				counter = 0;
			} else {
				matrix.push(0);
			}
		}
	}

	const averages: number[][] = [];

	matrix_list.forEach((char_mat: number[]) => {
		const temp_img = to_image(char_mat, 35)
			.rotate(90)
			.flip({ axis: "horizontal" });

		const rawData = temp_img.getRawImage().data;
		const sum = Array.from(rawData).reduce(
			(acc: number, val: number) => acc + val,
			0,
		);
		const average = sum / 256;

		const vAvg = vavg(temp_img);
		const hAvg = htopavg(temp_img);
		const hbtAvg = hbotavg(temp_img);

		averages.push([average, vAvg, hAvg, hbtAvg, char_mat.length / 35]);
	});

	return averages;
}

// Pixel array to Image
function to_image(matrix: number[], width = 35): Image {
	const image = new Image(width, matrix.length / width, {
		colorModel: "GREY",
		bitDepth: 8,
	});

	matrix.forEach((item, index) => {
		if (item) {
			image.setValueByIndex(index, 0, 255);
		}
	});

	return image;
}

// Subtract the background noise image
async function clean_image(img: Image): Promise<Image> {
	const empty = (await fetchURL(EMPTY)).grey();
	const data = img.grey();

	let cleaned = empty.subtract(data).multiply(10);

	const rawImage = cleaned.getRawImage();
	Array.from(rawImage.data).forEach((item: number, index: number) => {
		if (item < 50) {
			cleaned.setValueByIndex(index, 0, 0);
		} else {
			cleaned.setValueByIndex(index, 0, 255);
		}
	});

	cleaned = cleaned.crop({
		origin: { column: 75, row: 24 },
		width: 130,
		height: 35,
	});

	return cleaned;
}

// Average pixel value of horizontal top half
function htopavg(char_img: Image): number {
	const temp_img = char_img.crop({
		origin: { column: 0, row: 0 },
		width: char_img.width,
		height: Math.ceil(char_img.height / 2 + 1),
	});

	const rawData = temp_img.getRawImage().data;
	return (
		Array.from(rawData).reduce((acc: number, val: number) => acc + val, 0) / 256
	);
}

// Average pixel value of horizontal bottom half
function hbotavg(char_img: Image): number {
	const temp_img = char_img.crop({
		origin: { column: 0, row: Math.ceil(char_img.height / 2 + 1) },
		width: char_img.width,
		height: 35 - Math.ceil(char_img.height / 2 + 1),
	});

	const rawData = temp_img.getRawImage().data;
	return (
		Array.from(rawData).reduce((acc: number, val: number) => acc + val, 0) / 256
	);
}

// Average pixel value of vertical half
function vavg(char_img: Image): number {
	let transformed_image = char_img.rotate(90);

	transformed_image = transformed_image.crop({
		origin: { column: 0, row: 0 },
		width: transformed_image.width,
		height: Math.floor(transformed_image.height / 2 + 1),
	});

	const rawData = transformed_image.getRawImage().data;
	return (
		Array.from(rawData).reduce((acc: number, val: number) => acc + val, 0) / 256
	);
}

export { evaluate_captcha, solve_captcha };
