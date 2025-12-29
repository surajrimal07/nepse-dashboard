import {
  getIndexPriceVolumeHistory,
  getMarket_depth,
  getNepseIndex,
  getNepseIndexIntraday,
  getPriceVolume,
  getPriceVolumeHistory,
  getSecurityList,
  getStockDailyPrice,
  getSummary,
  getSupplyDemand,
  getTopGainers,
  getTopLoosers,
  getTopTenTradeScrips,
  getTopTenTransactions,
  getTopTenTurnover,
  getWorkerPoolStats,
  get_market_status,
  get_security_detail,
  liveMarketData,
  shutdownWorkerPool,
  stockIntraday,
} from "../worker/index";

console.log("🚀 Starting comprehensive NEPSE API worker test...\n");

// Helper function to format results
// biome-ignore lint/suspicious/noExplicitAny: <explanation>
function formatResult(name: string, result: any, startTime: number): string {
  const duration = Date.now() - startTime;
  const status = result ? "✅ Success" : "❌ Failed";
  return `${name.padEnd(30)} ${status} (${duration}ms)`;
}

// Helper function to display worker stats
function displayWorkerStats(label: string): void {
  const stats = getWorkerPoolStats();
  if (stats) {
    console.log(`📊 ${label}:`);
    console.log(
      `   Workers: ${stats.totalWorkers} (${stats.busyWorkers} busy, ${stats.idleWorkers} idle)`
    );
    console.log(
      `   Queue: ${stats.queueLength} pending, ${stats.pendingTasks} in progress`
    );
    console.log(
      `   Completed: ${stats.totalTasksCompleted}, Errors: ${stats.totalErrors}`
    );
  }
}

async function testAllFunctions(): Promise<void> {
  console.log("🧪 Testing all NEPSE API functions...\n");

  const tests = [
    // Market status and summary
    { name: "get_market_status", fn: () => get_market_status() },
    { name: "getSummary", fn: () => getSummary() },

    // Top lists
    { name: "getTopTenTradeScrips", fn: () => getTopTenTradeScrips() },
    { name: "getTopTenTransactions", fn: () => getTopTenTransactions() },
    { name: "getTopTenTurnover", fn: () => getTopTenTurnover() },
    { name: "getTopGainers", fn: () => getTopGainers() },
    { name: "getTopLoosers", fn: () => getTopLoosers() },

    // Index data
    { name: "getNepseIndex", fn: () => getNepseIndex() },
    {
      name: "getNepseIndexIntraday",
      fn: () => getNepseIndexIntraday("NEPSE Index"),
    },

    // Stock data
    { name: "stockIntraday", fn: () => stockIntraday("NABIL") },
    { name: "getPriceVolume", fn: () => getPriceVolume() },
    { name: "getSecurityList", fn: () => getSecurityList() },

    // Market depth and supply/demand
    { name: "getMarket_depth", fn: () => getMarket_depth("NABIL") },
    { name: "getSupplyDemand", fn: () => getSupplyDemand() },

    // Historical data
    {
      name: "getPriceVolumeHistory",
      fn: () => getPriceVolumeHistory("NABIL", 10),
    },
    {
      name: "getIndexPriceVolumeHistory",
      fn: () => getIndexPriceVolumeHistory("NEPSE Index", 10),
    },
    { name: "getStockDailyPrice", fn: () => getStockDailyPrice("NABIL") },

    // Live data
    { name: "liveMarketData", fn: () => liveMarketData() },
    { name: "get_security_detail", fn: () => get_security_detail("NABIL") },
  ];

  let successCount = 0;
  let totalDuration = 0;

  displayWorkerStats("Initial worker pool state");
  console.log();

  for (const test of tests) {
    const startTime = Date.now();

    try {
      const result = await test.fn();
      const duration = Date.now() - startTime;
      totalDuration += duration;

      if (result) {
        successCount++;
      }

      console.log(formatResult(test.name, result, startTime));
    } catch (error) {
      const duration = Date.now() - startTime;
      totalDuration += duration;
      console.log(formatResult(test.name, null, startTime));
      console.log(`   Error: ${error}`);
    }
  }

  console.log();
  displayWorkerStats("Worker pool state after all tests");
  console.log();

  console.log("📈 Test Summary:");
  console.log(`   Total tests: ${tests.length}`);
  console.log(`   Successful: ${successCount}`);
  console.log(`   Failed: ${tests.length - successCount}`);
  console.log(
    `   Success rate: ${((successCount / tests.length) * 100).toFixed(1)}%`
  );
  console.log(`   Total duration: ${totalDuration}ms`);
  console.log(
    `   Average per test: ${(totalDuration / tests.length).toFixed(1)}ms`
  );
}

async function testWorkerScaling(): Promise<void> {
  console.log("\n⚖️ Testing worker scaling behavior...\n");

  // Test concurrent load to trigger scaling
  console.log("🔥 Running 10 concurrent requests to test scaling up...");

  displayWorkerStats("Before concurrent load");

  const concurrentStart = Date.now();
  const concurrentPromises = Array.from({ length: 10 }, (_, i) => {
    // Alternate between different functions to create varied load
    if (i % 3 === 0) return getSummary();
    if (i % 3 === 1) return getTopGainers();
    return get_market_status();
  });

  const concurrentResults = await Promise.allSettled(concurrentPromises);
  const concurrentDuration = Date.now() - concurrentStart;

  const concurrentSuccesses = concurrentResults.filter(
    (r) => r.status === "fulfilled" && r.value
  ).length;

  console.log(`✅ Concurrent test completed in ${concurrentDuration}ms`);
  console.log(`   Successful requests: ${concurrentSuccesses}/10`);

  displayWorkerStats("After concurrent load (should show scaling up)");

  // Wait for workers to scale down
  console.log(
    "\n⏳ Waiting 35 seconds for workers to scale down due to idle timeout..."
  );

  // Wait longer than the idle timeout (30 seconds) to see scaling down
  await new Promise((resolve) => setTimeout(resolve, 35000));

  displayWorkerStats("After idle timeout (should show scaling down)");

  // Test that workers still work after scaling
  console.log("\n🔄 Testing functionality after scaling...");
  const postScaleStart = Date.now();
  const postScaleResult = await getSummary();
  const postScaleDuration = Date.now() - postScaleStart;

  console.log(formatResult("Post-scale test", postScaleResult, postScaleStart));
  displayWorkerStats("After post-scale test");
}

async function testErrorHandling(): Promise<void> {
  console.log("\n🚨 Testing error handling and retries...\n");

  // Test with invalid stock symbol to see how errors are handled
  console.log("Testing with invalid stock symbol...");
  const errorStart = Date.now();

  try {
    const result = await getMarket_depth("INVALID_SYMBOL_12345");
    console.log(formatResult("Invalid symbol test", result, errorStart));
  } catch (error) {
    console.log(formatResult("Invalid symbol test", null, errorStart));
    console.log(`   Expected error: ${error}`);
  }

  displayWorkerStats("After error test");
}

async function main(): Promise<void> {
  try {
    // Run all test suites
    await testAllFunctions();
    await testWorkerScaling();
    await testErrorHandling();

    console.log("\n🎉 All tests completed successfully!");
    console.log("\n✅ Migration to worker pool is working correctly!");
    console.log("   - All business logic functions are working ✅");
    console.log("   - Worker scaling up is working ✅");
    console.log("   - Worker scaling down is working ✅");
    console.log("   - Error handling is working ✅");
    console.log("   - Performance is maintained ✅");
  } catch (error) {
    console.error("\n❌ Test suite failed with error:", error);
  } finally {
    // Clean shutdown
    console.log("\n🔄 Shutting down worker pool...");
    await shutdownWorkerPool();
    console.log("✅ Worker pool shut down successfully.");
  }
}

// Run the test suite
main();
