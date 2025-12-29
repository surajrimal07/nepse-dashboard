import fs from "node:fs";
import { Image } from "image-js";
import { evaluate_captcha } from "@/entrypoints/tms.content/capcha";
import type { KindEntry } from "@/types/content-types";
import { kinds } from "@/types/kinds";

Object.values(kinds).forEach((kind: KindEntry) => {
	const files = fs.readdirSync(kind.data_path);

	const data: Map<string, Array<Array<number>>> = new Map();

	const promises = files.map(async (filename) => {
		const img = await Image.load(`${kind.data_path}/${filename}`);

		const res = await evaluate_captcha(img);

		if (res.length === 6) {
			res.forEach((item, index) => {
				const char: string = filename[index];

				if (!data.get(char)) {
					data.set(char, []);
				}

				data.get(char)?.push(item);
			});
		}

		return res;
	});

	Promise.all(promises).then(() => {
		const averaged_data: Map<string, Array<number>> = new Map();

		data.forEach((value, key: string) => {
			if (value.length > 1) {
				let sums = value.reduce((acc, new_val) => {
					const temp_summed = acc.map((item, index) => {
						return item + new_val[index];
					});

					return temp_summed;
				});

				sums = sums.map((item) => item / value.length);

				averaged_data.set(key, sums);
			} else {
				averaged_data.set(key, value[0]);
			}
		});

		const json_data = JSON.stringify(Object.fromEntries(averaged_data));

		fs.writeFileSync(`src/data/${kind.write_name}`, json_data);
	});
});
