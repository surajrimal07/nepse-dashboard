import path from "node:path";
import { WorkerPool } from "../worker/workerPool";

async function testSequentialNaming() {
  console.log("🧪 Testing Sequential Worker and Task Naming...\n");

  const workerScriptPath = path.join(__dirname, "../worker/worker.ts");
  const pool = new WorkerPool(workerScriptPath, {
    minWorkers: 2,
    maxWorkers: 5,
    logger: {
      log: (message) => console.log(`📝 ${message}`),
      warn: (message) => console.warn(`⚠️  ${message}`),
      error: (message, error) => console.error(`❌ ${message}`, error),
    },
  });

  try {
    // Test 1: Check initial worker names
    console.log("1️⃣ Initial worker stats:");
    console.log(pool.getStats());

    // Test 2: Run some tasks to see sequential task IDs
    console.log("\n2️⃣ Running tasks to check sequential task IDs...");

    const tasks = [
      pool.runTask("get_market_status"),
      pool.runTask("getSummary"),
      pool.runTask("getTopGainers"),
      pool.runTask("getNepseIndex"),
      pool.runTask("getPriceVolume"),
    ];

    console.log("📊 Running 5 concurrent tasks...");

    // Wait a bit to see scaling
    await new Promise((resolve) => setTimeout(resolve, 1000));
    console.log("\n📈 Stats after starting tasks:");
    console.log(pool.getStats());

    // Wait for tasks to complete
    const results = await Promise.allSettled(tasks);

    console.log("\n✅ Task completion results:");
    results.forEach((result, index) => {
      if (result.status === "fulfilled") {
        console.log(`   Task ${index + 1}: ✓ Success`);
      } else {
        console.log(`   Task ${index + 1}: ✗ Failed - ${result.reason}`);
      }
    });

    // Test 3: Check final stats
    console.log("\n3️⃣ Final stats:");
    console.log(pool.getStats());

    // Test 4: Scale up and check worker names
    console.log("\n4️⃣ Testing worker scaling and naming...");
    const moreTasks = [];
    for (let i = 0; i < 10; i++) {
      moreTasks.push(pool.runTask("getSecurityList"));
    }

    await new Promise((resolve) => setTimeout(resolve, 500));
    console.log("📈 Stats after scaling up:");
    console.log(pool.getStats());

    await Promise.allSettled(moreTasks);
  } catch (error) {
    console.error("❌ Test failed:", error);
  } finally {
    console.log("\n🔄 Shutting down worker pool...");
    await pool.shutdown();
    console.log("✅ Test completed!");
  }
}

// Run the test
testSequentialNaming().catch(console.error);
