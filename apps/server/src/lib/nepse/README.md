# NEPSE Worker Pool System

A highly efficient, auto-scaling worker pool implementation for handling NEPSE API requests with built-in rate limiting, error handling, and retry logic.

## Key Features

### 🚀 **Auto-Scaling (1-5 Workers)**
- Starts with 1 worker minimum
- Scales up to 5 workers maximum based on demand
- Automatically scales down idle workers after 30 seconds
- Configurable scaling threshold (default: 80% busy workers)

### ⚡ **High Performance**
- Concurrent request processing across multiple workers
- Each worker maintains its own TokenManager instance
- No blocking between workers - true parallelization
- Optimized queue management with priority retry logic

### 🛡️ **Robust Error Handling**
- Automatic retry with exponential backoff
- Worker failure recovery and replacement
- Task timeout handling (default: 60 seconds)
- Stale task cleanup to prevent memory leaks

### 📊 **Monitoring & Observability**
- Real-time worker pool statistics
- Task completion tracking
- Error rate monitoring
- Queue length monitoring

## Architecture

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Main Thread   │    │   Worker Pool    │    │   Worker 1-5    │
│                 │───▶│                  │───▶│  TokenManager   │
│ NepseWorkerAPI  │    │  Auto-scaling    │    │  Instance       │
│                 │◀───│  Load balancing  │◀───│                 │
└─────────────────┘    └──────────────────┘    └─────────────────┘
```

## Usage

### Basic Usage

```typescript
import { nepseWorkerAPI } from './nepseWorkerAPI';

// Simple API calls - automatically load balanced
const token = await nepseWorkerAPI.getAccessToken();
const securities = await nepseWorkerAPI.getSecurityBrief();
const payloadId = await nepseWorkerAPI.getPOSTPayloadID();
```

### Custom Configuration

```typescript
import { NepseWorkerAPI } from './nepseWorkerAPI';

const api = new NepseWorkerAPI({
  minWorkers: 2,        // Start with 2 workers
  maxWorkers: 4,        // Scale up to 4 workers max
  taskTimeout: 45000,   // 45 second timeout
  maxRetries: 2,        // Retry failed tasks 2 times
  scalingThreshold: 0.6 // Scale up when 60% busy
});

const token = await api.getAccessToken();
```

### Handling High Concurrency

```typescript
// Handle 100 concurrent requests efficiently
const requests = Array.from({ length: 100 }, () =>
  nepseWorkerAPI.getAccessToken()
);

// Workers will auto-scale to handle load
const tokens = await Promise.all(requests);
```

### Monitoring Performance

```typescript
const stats = nepseWorkerAPI.getStats();
/*
{
  totalWorkers: 3,
  busyWorkers: 2,
  idleWorkers: 1,
  queueLength: 5,
  pendingTasks: 8,
  totalTasksCompleted: 247,
  totalErrors: 2
}
*/
```

## Available Methods

| Method | Description | Return Type |
|--------|-------------|-------------|
| `getAccessToken()` | Get a valid access token | `Promise<string>` |
| `getSecurityBrief()` | Get list of all securities | `Promise<unknown[]>` |
| `getPOSTPayloadID()` | Get POST payload ID | `Promise<number>` |
| `getPOSTPayloadIDForFloorSheet()` | Get floor sheet payload ID | `Promise<number>` |
| `getSecuritySymbolIdMap()` | Get symbol-to-ID mapping | `Promise<Record<string, number>>` |
| `getMarketStatus()` | Get current market status | `Promise<unknown>` |
| `getMarketId()` | Get market ID | `Promise<number \| null>` |
| `getSalts()` | Get salt values | `Promise<number[] \| null>` |
| `getStats()` | Get worker pool statistics | `Object` |
| `shutdown()` | Gracefully shutdown pool | `Promise<void>` |

## Configuration Options

```typescript
interface WorkerPoolOptions {
  minWorkers?: number;        // Minimum workers (default: 1)
  maxWorkers?: number;        // Maximum workers (default: 5)
  idleTimeout?: number;       // Idle timeout in ms (default: 30000)
  taskTimeout?: number;       // Task timeout in ms (default: 60000)
  maxRetries?: number;        // Max retry attempts (default: 3)
  scalingThreshold?: number;  // Scale threshold 0-1 (default: 0.8)
  logger?: Logger;           // Custom logger implementation
}
```

## Error Handling

The system includes comprehensive error handling:

- **Task Failures**: Automatic retry with exponential backoff
- **Worker Crashes**: Automatic worker replacement
- **Timeouts**: Configurable task timeouts with retry
- **Rate Limiting**: Built-in respect for NEPSE API limits
- **Memory Leaks**: Automatic cleanup of stale tasks

## Performance Benefits

### Before (Single Token)
```
Request Rate: 2 requests/second
Concurrent Users: Limited by single token
Bottleneck: TokenManager instance
```

### After (Worker Pool)
```
Request Rate: Up to 10 requests/second (5 workers × 2 req/sec)
Concurrent Users: Hundreds supported
Bottleneck: Eliminated through parallelization
```

## Production Considerations

### Graceful Shutdown
```typescript
process.on('SIGINT', async () => {
  await nepseWorkerAPI.shutdown();
  process.exit(0);
});
```

### Custom Logging
```typescript
const api = new NepseWorkerAPI({
  logger: {
    log: (msg) => logger.info(msg),
    warn: (msg) => logger.warn(msg),
    error: (msg, err) => logger.error(msg, err)
  }
});
```

### Health Monitoring
```typescript
setInterval(() => {
  const stats = nepseWorkerAPI.getStats();
  if (stats.totalErrors > 10) {
    // Alert monitoring system
  }
}, 30000);
```

## Implementation Details

- **Worker Isolation**: Each worker runs in a separate Bun Worker thread
- **Memory Efficient**: Automatic cleanup and worker termination
- **Type Safe**: Full TypeScript support with proper type definitions
- **Bun Optimized**: Uses Bun's native Worker API for best performance
- **Zero Dependencies**: No external dependencies beyond Bun runtime

## Files Structure

```
src/lib/nepse/
├── worker.ts              # Worker thread implementation
├── workerPool.ts          # Core worker pool logic
├── nepseWorkerAPI.ts      # High-level API wrapper
├── token-manager.ts       # Token management (existing)
└── README.md             # This documentation
```

## Migration from Single Token

Replace direct TokenManager usage:

```typescript
// Before
const manager = await TokenManager.getInstance();
const token = await manager.getAccessToken();

// After
const token = await nepseWorkerAPI.getAccessToken();
```

The worker pool maintains the same API interface while providing automatic scaling and improved performance.
