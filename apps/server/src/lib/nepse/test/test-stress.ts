#!/usr/bin/env bun
import {
  getNepseIndex,
  getPriceVolume,
  getSummary,
  getTopGainers,
  getTopLoosers,
  getWorkerPoolStats,
  get_market_status,
  shutdownWorkerPool,
} from "../worker/index";

console.log("🚀 Starting NEPSE API stress test - 50 calls per second...\n");

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
    console.log(
      `   Success Rate: ${
        stats.totalTasksCompleted > 0
          ? (
              ((stats.totalTasksCompleted - stats.totalErrors) /
                stats.totalTasksCompleted) *
              100
            ).toFixed(1)
          : 0
      }%`
    );
  }
}

// Array of test functions to rotate through
const testFunctions = [
  { name: "get_market_status", fn: get_market_status },
  { name: "getSummary", fn: getSummary },
  { name: "getTopGainers", fn: getTopGainers },
  { name: "getTopLoosers", fn: getTopLoosers },
  { name: "getNepseIndex", fn: getNepseIndex },
  { name: "getPriceVolume", fn: getPriceVolume },
];

interface StressTestResult {
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  totalDuration: number;
  averageResponseTime: number;
  requestsPerSecond: number;
  errors: string[];
  rateLimitHit: boolean;
}

async function runStressTest(
  requestsPerSecond: number,
  durationSeconds: number
): Promise<StressTestResult> {
  const totalRequests = requestsPerSecond * durationSeconds;
  const interval = 1000 / requestsPerSecond; // milliseconds between requests

  console.log("🔥 Starting stress test:");
  console.log(`   Target: ${requestsPerSecond} requests/second`);
  console.log(`   Duration: ${durationSeconds} seconds`);
  console.log(`   Total requests: ${totalRequests}`);
  console.log(`   Interval: ${interval.toFixed(1)}ms between requests\n`);

  const results: Array<{
    success: boolean;
    duration: number;
    error?: string;
    function: string;
  }> = [];

  const errors: string[] = [];
  let rateLimitHit = false;

  const startTime = Date.now();

  // Create all requests with precise timing
  const promises: Promise<void>[] = [];

  for (let i = 0; i < totalRequests; i++) {
    const delay = i * interval;
    const testFunc = testFunctions[i % testFunctions.length];

    const promise = new Promise<void>((resolve) => {
      setTimeout(async () => {
        const requestStart = Date.now();

        try {
          const result = await testFunc.fn();
          const requestDuration = Date.now() - requestStart;

          results.push({
            success: !!result,
            duration: requestDuration,
            function: testFunc.name,
          });

          // Check for potential rate limiting (very fast responses might indicate caching or limiting)
          if (requestDuration < 5) {
            console.log(
              `⚠️  Very fast response (${requestDuration}ms) for ${testFunc.name} - possible caching or rate limiting`
            );
          }
        } catch (error) {
          const requestDuration = Date.now() - requestStart;
          const errorMessage =
            error instanceof Error ? error.message : String(error);

          results.push({
            success: false,
            duration: requestDuration,
            error: errorMessage,
            function: testFunc.name,
          });

          errors.push(`${testFunc.name}: ${errorMessage}`);

          // Check for rate limiting errors
          if (
            errorMessage.includes("429") ||
            errorMessage.includes("rate limit") ||
            errorMessage.includes("too many requests")
          ) {
            rateLimitHit = true;
            console.log(`🚨 Rate limit detected: ${errorMessage}`);
          }
        }

        resolve();
      }, delay);
    });

    promises.push(promise);
  }

  // Progress monitoring
  const progressInterval = setInterval(() => {
    const completed = results.length;
    const progress = ((completed / totalRequests) * 100).toFixed(1);
    console.log(
      `⏳ Progress: ${completed}/${totalRequests} (${progress}%) - ${Math.round(
        completed / ((Date.now() - startTime) / 1000)
      )} req/s`
    );
    displayWorkerStats("Current worker state");
    console.log();
  }, 2000);

  // Wait for all requests to complete
  await Promise.all(promises);
  clearInterval(progressInterval);

  const totalDuration = Date.now() - startTime;
  const successfulRequests = results.filter((r) => r.success).length;
  const failedRequests = results.filter((r) => !r.success).length;
  const averageResponseTime =
    results.reduce((sum, r) => sum + r.duration, 0) / results.length;
  const actualRequestsPerSecond = results.length / (totalDuration / 1000);

  return {
    totalRequests: results.length,
    successfulRequests,
    failedRequests,
    totalDuration,
    averageResponseTime,
    requestsPerSecond: actualRequestsPerSecond,
    errors: [...new Set(errors)], // Remove duplicates
    rateLimitHit,
  };
}

async function analyzeResults(result: StressTestResult): Promise<void> {
  console.log("\n📈 Stress Test Results:");
  console.log(`   Total Requests: ${result.totalRequests}`);
  console.log(
    `   Successful: ${result.successfulRequests} (${(
      (result.successfulRequests / result.totalRequests) *
      100
    ).toFixed(1)}%)`
  );
  console.log(
    `   Failed: ${result.failedRequests} (${(
      (result.failedRequests / result.totalRequests) *
      100
    ).toFixed(1)}%)`
  );
  console.log(
    `   Total Duration: ${(result.totalDuration / 1000).toFixed(1)}s`
  );
  console.log(
    `   Average Response Time: ${result.averageResponseTime.toFixed(1)}ms`
  );
  console.log(
    `   Actual Throughput: ${result.requestsPerSecond.toFixed(
      1
    )} requests/second`
  );
  console.log(`   Rate Limit Hit: ${result.rateLimitHit ? "🚨 YES" : "✅ NO"}`);

  displayWorkerStats("Final worker state");

  if (result.errors.length > 0) {
    console.log(`\n🚨 Unique Errors (${result.errors.length}):`);
    result.errors.slice(0, 10).forEach((error, i) => {
      console.log(`   ${i + 1}. ${error}`);
    });
    if (result.errors.length > 10) {
      console.log(`   ... and ${result.errors.length - 10} more errors`);
    }
  }

  // Performance analysis
  console.log("\n🎯 Performance Analysis:");
  if (result.requestsPerSecond >= 45) {
    console.log(
      `   ✅ Excellent: Achieved ${result.requestsPerSecond.toFixed(
        1
      )}/50 target req/s`
    );
  } else if (result.requestsPerSecond >= 30) {
    console.log(
      `   ⚠️  Good: Achieved ${result.requestsPerSecond.toFixed(
        1
      )}/50 target req/s`
    );
  } else {
    console.log(
      `   ❌ Poor: Only achieved ${result.requestsPerSecond.toFixed(
        1
      )}/50 target req/s`
    );
  }

  if (result.averageResponseTime < 100) {
    console.log(
      `   ✅ Fast Response: ${result.averageResponseTime.toFixed(1)}ms average`
    );
  } else if (result.averageResponseTime < 500) {
    console.log(
      `   ⚠️  Moderate Response: ${result.averageResponseTime.toFixed(
        1
      )}ms average`
    );
  } else {
    console.log(
      `   ❌ Slow Response: ${result.averageResponseTime.toFixed(1)}ms average`
    );
  }

  const successRate = (result.successfulRequests / result.totalRequests) * 100;
  if (successRate >= 95) {
    console.log(
      `   ✅ High Reliability: ${successRate.toFixed(1)}% success rate`
    );
  } else if (successRate >= 80) {
    console.log(
      `   ⚠️  Moderate Reliability: ${successRate.toFixed(1)}% success rate`
    );
  } else {
    console.log(
      `   ❌ Low Reliability: ${successRate.toFixed(1)}% success rate`
    );
  }

  // Rate limiting analysis
  if (result.rateLimitHit) {
    console.log("\n🚨 Rate Limiting Detected:");
    console.log("   The upstream NEPSE API has rate limiting in place");
    console.log("   Consider implementing request throttling or caching");
  } else {
    console.log("\n✅ No Rate Limiting Detected:");
    console.log(
      `   The upstream NEPSE API handled ${result.requestsPerSecond.toFixed(
        1
      )} req/s successfully`
    );
  }
}

async function testDifferentLoadLevels(): Promise<void> {
  console.log(
    "🧪 Testing different load levels to find optimal throughput...\n"
  );

  const loadLevels = [10, 25, 50, 75]; // requests per second
  const testDuration = 10; // seconds per test

  for (const rps of loadLevels) {
    console.log(`\n${"=".repeat(60)}`);
    console.log(
      `🔥 Testing ${rps} requests per second for ${testDuration} seconds`
    );
    console.log(`${"=".repeat(60)}`);

    const result = await runStressTest(rps, testDuration);
    await analyzeResults(result);

    // Wait between tests to let the system recover
    if (rps !== loadLevels[loadLevels.length - 1]) {
      console.log("\n⏳ Waiting 5 seconds before next test...");
      await new Promise((resolve) => setTimeout(resolve, 5000));
    }
  }
}

async function main(): Promise<void> {
  try {
    displayWorkerStats("Initial worker pool state");
    console.log();

    // Run the comprehensive load test
    await testDifferentLoadLevels();

    console.log(`\n${"=".repeat(60)}`);
    console.log("🎉 Stress testing completed!");
    console.log(`${"=".repeat(60)}`);
  } catch (error) {
    console.error("\n❌ Stress test failed with error:", error);
  } finally {
    // Clean shutdown
    console.log("\n🔄 Shutting down worker pool...");
    await shutdownWorkerPool();
    console.log("✅ Worker pool shut down successfully.");
  }
}

// Run the stress test
main();
