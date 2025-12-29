import fs from 'node:fs/promises';
import path from 'node:path';
import { isValidData } from './validate';

export const fetchDataforNepseAlphaORSystemxlite = async (
  symbolIndex: string,
  timeFrame: string,
  fromEpochTime: number,
  currentEpochTime: number,
  force_key: string
) => {
  let response: {
    t: number[];
    o: number[];
    h: number[];
    l: number[];
    c: number[];
    v: number[];
  };
  try {
    const fetchResponse = await fetch(
      `https://api.npstocks.com/tv/tv/history?symbol=${symbolIndex}&resolution=${timeFrame}&from=${fromEpochTime}&to=${currentEpochTime}&countback=18`,
      {
        headers: {
          accept: '*/*',
          'accept-language': 'en-US,en;q=0.9,ne;q=0.8',
          'if-none-match': 'W/"107d7-CkFswx0Zr81sX6ZUbikPAlgnJBA"',
          'sec-ch-ua':
            '"Chromium";v="124", "Microsoft Edge";v="124", "Not-A.Brand";v="99"',
          'sec-ch-ua-mobile': '?0',
          'sec-ch-ua-platform': '"Windows"',
          'sec-fetch-dest': 'empty',
          'sec-fetch-mode': 'cors',
          'sec-fetch-site': 'same-site',
          'sec-gpc': '1',
          Referer: 'https://chart.npstocks.com/',
          'Referrer-Policy': 'strict-origin-when-cross-origin',
        },
        method: 'GET',
      }
    );
    response = await fetchResponse.json();

    if (!(response && isValidData(response))) {
      throw new Error('Invalid data recieved from npstocks.com');
    }
  } catch (error) {
    console.log(
      `Fetching data from npstocks.com failed. Trying nepsealpha.com ${error}`
    );

    const fetchResponse = await fetch(
      `https://www.nepsealpha.com/trading/1/history?force_key=${force_key}&symbol=${symbolIndex}&resolution=${timeFrame}&pass=ok&fs=${force_key}`,
      {
        headers: {
          accept: 'application/json, text/plain, */*',
          'sec-ch-ua':
            '"Chromium";v="124", "Microsoft Edge";v="124", "Not-A.Brand";v="99"',
          'sec-ch-ua-arch': '"x86"',
          'sec-ch-ua-bitness': '"64"',
          'sec-ch-ua-full-version': '"124.0.2478.67"',
          'sec-ch-ua-full-version-list':
            '"Chromium";v="124.0.6367.91", "Microsoft Edge";v="124.0.2478.67", "Not-A.Brand";v="99.0.0.0"',
          'sec-ch-ua-mobile': '?0',
          'sec-ch-ua-model': '""',
          'sec-ch-ua-platform': '"Windows"',
          'sec-ch-ua-platform-version': '"15.0.0"',
          'x-requested-with': 'XMLHttpRequest',
          Referer: 'https://www.nepsealpha.com/trading/chart?symbol=NEPSE',
          'Referrer-Policy': 'strict-origin-when-cross-origin',
        },
        method: 'GET',
      }
    );
    response = await fetchResponse.json();

    // if (!response || !isValidData(response)) {
    //   throw new Error('Invalid data recieved from nepsealpha.com');
    // }
  }

  return response;
};

/**
 * Saves chart data for all stocks in stockmap.json
 * @param outputDir Directory to save the chart data files
 * @param timeframe Timeframe for the chart data (e.g., '1D')
 * @param startTime Start time in epoch seconds
 * @param endTime End time in epoch seconds
 */
export async function saveStockChart(
  outputDir: string = path.join(
    import.meta.dir,
    '..',
    '..',
    'public',
    'stocks'
  ),
  timeframe = '1D',
  startTime = 1_058_418_900, // Default start time
  endTime = 1_741_193_540
): Promise<void> {
  try {
    // Ensure the output directory exists
    await fs.mkdir(outputDir, { recursive: true });

    // Load the stock map
    const stockMapPath = path.join(import.meta.dir, 'stockmap.json');
    const stockMapData = await fs.readFile(stockMapPath, 'utf-8');
    const stockMap = JSON.parse(stockMapData);

    console.log(
      `Starting to fetch chart data for ${Object.keys(stockMap).length} stocks`
    );

    // Process each stock symbol
    for (const symbol of Object.keys(stockMap)) {
      try {
        console.log(`Fetching data for ${symbol}...`);

        // Fetch data using the existing function
        const data = await fetchDataforNepseAlphaORSystemxlite(
          symbol,
          timeframe,
          startTime,
          endTime,
          'ghghgfv' // Using the same parameter as seen in the example
        );

        if (!(data && isValidData(data))) {
          console.warn(`Invalid data received for ${symbol}, skipping...`);
          continue; // Skip to the next symbol
        }

        // Save the data to a JSON file
        const filePath = path.join(outputDir, `${symbol}.json`);
        await fs.writeFile(filePath, JSON.stringify(data, null, 2));

        console.log(`Successfully saved data for ${symbol}`);

        // Delay to avoid rate limiting
        await new Promise((resolve) => setTimeout(resolve, 5000));
      } catch (error) {
        console.error(`Error fetching data for ${symbol}:`, error);
        // Continue with the next symbol even if one fails
      }
    }

    console.log('Completed saving stock chart data for all symbols');
  } catch (error) {
    console.error('Failed to save stock chart data:', error);
    throw error;
  }
}

saveStockChart();
