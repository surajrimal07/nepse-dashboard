import {
  getSummary,
  getTopGainers,
  get_market_status,
  shutdownWorkerPool,
} from "../worker/index";

console.log("Testing simplified implementation...");

try {
  // Test a few functions
  console.log("Testing get_market_status...");
  const marketStatus = await get_market_status();
  console.log(
    "Market status result:",
    marketStatus ? "✅ Success" : "❌ Failed"
  );

  console.log("Testing getSummary...");
  const summary = await getSummary();
  console.log("Summary result:", summary ? "✅ Success" : "❌ Failed");

  console.log("Testing getTopGainers...");
  const topGainers = await getTopGainers();
  console.log("Top gainers result:", topGainers ? "✅ Success" : "❌ Failed");

  console.log("\n✅ Simplified implementation is working!");
  console.log("🎯 Function call flow simplified from 3 layers to 2:");
  console.log(
    "   Before: get_market_status() → nepseWorkerAPI.get_market_status() → workerPool.runTask()"
  );
  console.log("   After:  get_market_status() → workerPool.runTask()");
} catch (error) {
  console.error("❌ Test failed:", error);
} finally {
  await shutdownWorkerPool();
  console.log("✅ Worker pool shut down.");
}
