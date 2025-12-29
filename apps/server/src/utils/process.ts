// biome-ignore lint/style/useNodejsImportProtocol: <explanation>
import { join } from 'path';

function getPublicFolderPath() {
  return join(import.meta.dir, '..', '..', 'public');
}

async function getLastUpdated() {
  try {
    const lastUpdatedPath = join(getPublicFolderPath(), 'lastUpdated.json');
    const data = await Bun.file(lastUpdatedPath).json();
    return data.lastUpdated;
  } catch (error) {
    return 0;
  }
}

async function updateLastUpdated(timestamp: number) {
  const lastUpdatedPath = join(getPublicFolderPath(), 'lastUpdated.json');
  await Bun.write(lastUpdatedPath, JSON.stringify({ lastUpdated: timestamp }));
}

async function ensureDirectory() {
  const dataDir = join(getPublicFolderPath(), 'data');
  try {
    await Bun.write(join(dataDir, '.gitkeep'), '');
  } catch (error) {
    // Directory already exists
  }
  return dataDir;
}

async function readExistingData(filePath: string) {
  try {
    const data = await Bun.file(filePath).json();
    return data;
  } catch (error) {
    return [];
  }
}

export async function processStockData() {
  try {
    // Load input data
    const stockDataPath = join(getPublicFolderPath(), 'stockData.json');
    const data = await Bun.file(stockDataPath).json();

    // Extract arrays from input
    const {
      t: timestamps,
      c: closePrices,
      o: openPrices = [],
      h: highPrices = [],
      l: lowPrices = [],
      v: volumes = [],
    } = data;

    // Define split date (2016-11-28)
    const splitEpoch = Math.floor(new Date('2016-11-28').getTime() / 1000);

    // Get last processed timestamp
    const lastUpdated = await getLastUpdated();
    let latestTimestamp = 0;

    console.log(
      `Last updated timestamp: ${lastUpdated} (${new Date(lastUpdated * 1000)})`
    );
    console.log(`Number of timestamps to process: ${timestamps.length}`);
    console.log(
      `First timestamp: ${timestamps[0]} (${new Date(timestamps[0] * 1000)})`
    );
    console.log(
      `Last timestamp: ${timestamps[timestamps.length - 1]} (${new Date(
        timestamps[timestamps.length - 1] * 1000
      )})`
    );

    // Find actual last processed timestamp
    const actualLastProcessed =
      [...timestamps]
        .sort((a, b) => a - b)
        .filter((t) => t <= lastUpdated)
        .pop() || 0;

    console.log(
      `Actually last processed: ${actualLastProcessed} (${new Date(
        actualLastProcessed * 1000
      )})`
    );

    if (lastUpdated > actualLastProcessed) {
      console.log(
        `Warning: lastUpdated timestamp ${lastUpdated} is ahead of data. Resetting to ${actualLastProcessed}`
      );
    }

    // Process only new data
    const newCloseOnly = [];
    const newOhlcData = [];

    for (let i = 0; i < timestamps.length; i++) {
      const t = Number.parseInt(timestamps[i]);

      // Skip already processed data
      if (t <= actualLastProcessed) {
        continue;
      }

      console.log(`Processing new data point: ${t}`);
      latestTimestamp = Math.max(latestTimestamp, t);

      if (t <= splitEpoch) {
        // Close-only period
        const entry: { t: number; c: number; v?: number } = {
          t,
          c: closePrices[i],
        };
        if (i < volumes.length && volumes[i] != null) {
          entry.v = volumes[i];
        }
        newCloseOnly.push(entry);
      } else {
        // Full OHLC period
        const entry: {
          t: number;
          o: number;
          h: number;
          l: number;
          c: number;
          v?: number;
        } = {
          t,
          o: openPrices[i],
          h: highPrices[i],
          l: lowPrices[i],
          c: closePrices[i],
        };
        if (i < volumes.length && volumes[i] != null) {
          entry.v = volumes[i];
        }
        newOhlcData.push(entry);
      }
    }

    // Save new data only if we have any
    if (newCloseOnly.length > 0 || newOhlcData.length > 0) {
      const dataDir = await ensureDirectory();
      const closeOnlyFilePath = join(dataDir, 'close_only.json');
      const ohlcFilePath = join(dataDir, 'ohlc.json');

      // Read existing data
      const existingCloseOnly = await readExistingData(closeOnlyFilePath);
      const existingOhlc = await readExistingData(ohlcFilePath);

      // Append new data
      const updatedCloseOnly = existingCloseOnly.concat(newCloseOnly);
      const updatedOhlc = existingOhlc.concat(newOhlcData);

      // Write updated data back to files
      await Bun.write(
        closeOnlyFilePath,
        JSON.stringify(updatedCloseOnly, null, 2)
      );
      await Bun.write(ohlcFilePath, JSON.stringify(updatedOhlc, null, 2));

      // Update the last processed timestamp
      await updateLastUpdated(latestTimestamp);
      console.log(
        `Processed new data up to ${new Date(latestTimestamp * 1000)}`
      );
    } else {
      console.log('No new data to process');
    }
  } catch (error) {
    console.error('Error processing stock data:', error);
    throw error;
  }
}

// await processStockData();
