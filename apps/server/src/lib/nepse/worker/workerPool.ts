import { isDevelopment } from 'env';

// Logger interface for better logging control
interface Logger {
  log: (message: string) => void;
  warn: (message: string) => void;
  error: (message: string, error?: unknown) => void;
}

// Default logger implementation
const defaultLogger: Logger = {
  log: () => {
    /* Silent by default */
  },
  warn: () => {
    /* Silent by default */
  },
  error: () => {
    /* Silent by default */
  },
};

// Type definitions for better type safety
export interface WorkerTask {
  taskId: string;
  action: string;
  payload?: unknown;
  timestamp: number;
}

export interface WorkerResponse {
  taskId: string;
  result?: unknown;
  error?: string;
  success: boolean;
}

interface PendingTask {
  taskId: string;
  resolve: (data: unknown) => void;
  reject: (error: Error) => void;
  timestamp: number;
  retryCount: number;
  action: string;
  payload?: unknown;
  timeoutId?: NodeJS.Timeout;
}

interface WorkerWrapper {
  id: string;
  worker: globalThis.Worker;
  busy: boolean;
  lastUsed: number;
  taskCount: number;
  errorCount: number;
  activeTask: string | null;
}

export interface WorkerPoolOptions {
  minWorkers?: number;
  maxWorkers?: number;
  idleTimeout?: number;
  taskTimeout?: number;
  maxRetries?: number;
  scalingThreshold?: number;
  logger?: Logger;
}

// Regex for parsing worker IDs
const WORKER_ID_REGEX = /^worker-(\d+)$/;

export class WorkerPool {
  private workers: Map<string, WorkerWrapper> = new Map();
  private taskQueue: PendingTask[] = [];
  private pendingTasks: Map<string, PendingTask> = new Map();
  private logger: Logger;

  // Configuration
  private readonly minWorkers: number;
  private readonly maxWorkers: number;
  private readonly idleTimeout: number;
  private readonly taskTimeout: number;
  private readonly maxRetries: number;
  private readonly scalingThreshold: number;
  // State tracking
  private taskIdCounter = 0;
  private workerIdCounter = 0;
  private availableWorkerIds: Set<number> = new Set(); // Track available worker IDs for reuse
  private cleanupInterval: NodeJS.Timeout | null = null;
  private isShuttingDown = false;

  constructor(options: WorkerPoolOptions = {}) {
    this.logger = options.logger ?? defaultLogger;
    this.minWorkers = options.minWorkers ?? 1;
    this.maxWorkers = options.maxWorkers ?? 10;
    this.idleTimeout = options.idleTimeout ?? 30_000; // 30 seconds
    this.taskTimeout = options.taskTimeout ?? 60_000; // 60 seconds
    this.maxRetries = options.maxRetries ?? 3;
    this.scalingThreshold = options.scalingThreshold ?? 0.6; // Scale when 60% busy

    // Initialize minimum workers
    this.initializeWorkers();

    // Start cleanup interval
    this.startCleanupInterval();
  }

  private initializeWorkers(): void {
    for (let i = 0; i < this.minWorkers; i++) {
      this.spawnWorker();
    }
  }
  private generateTaskId(): string {
    return `task-${++this.taskIdCounter}`;
  }

  private generateWorkerId(): string {
    // Reuse available IDs first, then assign new ones
    let workerId: number;
    if (this.availableWorkerIds.size > 0) {
      workerId = Math.min(...this.availableWorkerIds);
      this.availableWorkerIds.delete(workerId);
    } else {
      workerId = ++this.workerIdCounter;
    }
    return `worker-${workerId}`;
  }
  private spawnWorker(): WorkerWrapper {
    const workerId = this.generateWorkerId();
    const worker = new Worker(
      new URL(isDevelopment ? './worker.ts' : './worker.js', import.meta.url)
        .href
    );

    const wrapper: WorkerWrapper = {
      id: workerId,
      worker,
      busy: false,
      lastUsed: Date.now(),
      taskCount: 0,
      errorCount: 0,
      activeTask: null,
    };

    // Handle worker messages
    worker.onmessage = (event) => {
      this.handleWorkerMessage(workerId, event.data);
    };

    // Handle worker errors
    worker.onerror = (error) => {
      this.logger.error(`Worker ${workerId} error:`, error);
      this.handleWorkerError(workerId);
    };

    // Handle worker close
    worker.addEventListener('close', () => {
      this.logger.log(`Worker ${workerId} closed`);
      this.workers.delete(workerId);
    });

    this.workers.set(workerId, wrapper);
    this.logger.log(
      `Spawned worker ${workerId}. Total workers: ${this.workers.size}`
    );

    return wrapper;
  }

  private handleWorkerMessage(workerId: string, message: WorkerResponse): void {
    const worker = this.workers.get(workerId);
    if (!worker) {
      return;
    }

    const pendingTask = this.pendingTasks.get(message.taskId);
    if (!pendingTask) {
      this.logger.warn(`Received response for unknown task: ${message.taskId}`);
      return;
    }

    // Clear timeout
    if (pendingTask.timeoutId) {
      clearTimeout(pendingTask.timeoutId);
    }

    // Mark worker as available
    worker.busy = false;
    worker.lastUsed = Date.now();
    worker.activeTask = null;
    worker.taskCount++;

    // Remove from pending tasks
    this.pendingTasks.delete(message.taskId);

    // Resolve or reject the task
    if (message.success && message.error === undefined) {
      pendingTask.resolve(message.result);
    } else {
      worker.errorCount++;
      const error = new Error(message.error || 'Worker task failed');

      // Retry logic
      if (pendingTask.retryCount < this.maxRetries) {
        this.logger.warn(
          `Retrying task ${message.taskId}, attempt ${
            pendingTask.retryCount + 1
          }`
        );
        pendingTask.retryCount++;
        this.taskQueue.unshift(pendingTask); // Add to front of queue for immediate retry
        this.processQueue();
      } else {
        pendingTask.reject(error);
      }
    }

    // Process next task in queue
    this.processQueue();
  }

  private handleWorkerError(workerId: string): void {
    const worker = this.workers.get(workerId);
    if (!worker) {
      return;
    }

    worker.errorCount++;

    // If worker has active task, retry it
    if (worker.activeTask) {
      const pendingTask = this.pendingTasks.get(worker.activeTask);
      if (pendingTask && pendingTask.retryCount < this.maxRetries) {
        this.logger.warn(`Worker error, retrying task ${worker.activeTask}`);
        pendingTask.retryCount++;
        this.taskQueue.unshift(pendingTask);
        this.pendingTasks.delete(worker.activeTask);
      }
    }

    // Mark worker as available and clear active task
    worker.busy = false;
    worker.activeTask = null;

    // If worker has too many errors, terminate it
    if (worker.errorCount > 5) {
      this.logger.warn(
        `Terminating worker ${workerId} due to excessive errors`
      );
      this.terminateWorker(workerId);
    }

    this.processQueue();
  }

  private getAvailableWorker(): WorkerWrapper | null {
    for (const worker of this.workers.values()) {
      if (!(worker.busy || this.isShuttingDown)) {
        return worker;
      }
    }
    return null;
  }

  private shouldScaleUp(): boolean {
    if (this.workers.size >= this.maxWorkers) {
      return false;
    }

    const busyWorkers = Array.from(this.workers.values()).filter(
      (w) => w.busy
    ).length;
    const busyRatio = busyWorkers / this.workers.size;

    return busyRatio >= this.scalingThreshold && this.taskQueue.length > 0;
  }

  private processQueue(): void {
    if (this.isShuttingDown || this.taskQueue.length === 0) {
      return;
    }

    // Process as many tasks as we have available workers
    while (this.taskQueue.length > 0) {
      let availableWorker = this.getAvailableWorker();

      // Scale up if needed and possible
      if (!availableWorker && this.shouldScaleUp()) {
        this.logger.log(
          `Scaling up: spawning new worker. Queue length: ${this.taskQueue.length}`
        );
        availableWorker = this.spawnWorker();
      }

      if (!availableWorker) {
        break; // No available workers, wait for one to become free
      }

      const task = this.taskQueue.shift();
      if (!task) {
        break;
      }

      this.assignTaskToWorker(availableWorker, task);
    }
  }

  private assignTaskToWorker(worker: WorkerWrapper, task: PendingTask): void {
    worker.busy = true;
    worker.lastUsed = Date.now();
    worker.activeTask = task.taskId;

    // Set task timeout
    const timeoutId = setTimeout(() => {
      this.handleTaskTimeout(task.taskId);
    }, this.taskTimeout);

    // Store the timeout ID in the task for cleanup
    task.timeoutId = timeoutId;

    // Send task to worker
    const workerTask: WorkerTask = {
      taskId: task.taskId,
      action: task.action,
      payload: task.payload,
      timestamp: Date.now(),
    };

    worker.worker.postMessage(workerTask);
    this.logger.log(`Assigned task ${task.taskId} to worker ${worker.id}`);
  }

  private handleTaskTimeout(taskId: string): void {
    const task = this.pendingTasks.get(taskId);
    if (!task) {
      return;
    }

    this.logger.warn(`Task ${taskId} timed out`);

    // Find and reset the worker
    for (const worker of this.workers.values()) {
      if (worker.activeTask === taskId) {
        worker.busy = false;
        worker.activeTask = null;
        worker.errorCount++;
        break;
      }
    } // Remove from pending and retry if possible
    this.pendingTasks.delete(taskId);
    if (task.retryCount < this.maxRetries) {
      task.retryCount++;

      // Generate new task ID for retry to avoid conflicts with stale responses
      const oldTaskId = task.taskId;
      const newTaskId = this.generateTaskId();
      task.taskId = newTaskId;

      this.logger.log(
        `Retrying task ${oldTaskId} as ${newTaskId}, attempt ${task.retryCount}`
      );

      // Re-add to pending tasks with new ID
      this.pendingTasks.set(newTaskId, task);
      this.taskQueue.unshift(task);
      this.processQueue();
    } else {
      task.reject(
        new Error(`Task ${taskId} timed out after ${this.maxRetries} retries`)
      );
    }
  }

  private startCleanupInterval(): void {
    this.cleanupInterval = setInterval(() => {
      this.cleanupIdleWorkers();
      this.cleanupStaleTask();
    }, 10_000); // Cleanup every 10 seconds
  }

  private cleanupIdleWorkers(): void {
    if (this.workers.size <= this.minWorkers) {
      return;
    }

    const now = Date.now();
    const workersToRemove: string[] = [];

    for (const [workerId, worker] of this.workers) {
      if (!worker.busy && now - worker.lastUsed > this.idleTimeout) {
        workersToRemove.push(workerId);
      }
    }

    // Remove excess idle workers, but keep minimum
    const canRemove = Math.min(
      workersToRemove.length,
      this.workers.size - this.minWorkers
    );

    for (let i = 0; i < canRemove; i++) {
      this.terminateWorker(workersToRemove[i]);
    }
  }

  private cleanupStaleTask(): void {
    const now = Date.now();
    const staleTasks: string[] = [];

    for (const [taskId, task] of this.pendingTasks) {
      if (now - task.timestamp > this.taskTimeout * 2) {
        staleTasks.push(taskId);
      }
    }

    for (const taskId of staleTasks) {
      const task = this.pendingTasks.get(taskId);
      if (task) {
        this.pendingTasks.delete(taskId);
        task.reject(new Error(`Task ${taskId} became stale`));
      }
    }
  }
  private terminateWorker(workerId: string): void {
    const worker = this.workers.get(workerId);
    if (!worker) {
      return;
    }

    this.logger.log(`Terminating worker ${workerId}`); // Extract worker number from ID for reuse
    const workerMatch = workerId.match(WORKER_ID_REGEX);
    if (workerMatch) {
      const workerNumber = Number.parseInt(workerMatch[1], 10);
      this.availableWorkerIds.add(workerNumber);
    }

    // If worker has active task, handle it
    if (worker.activeTask) {
      const task = this.pendingTasks.get(worker.activeTask);
      if (task && task.retryCount < this.maxRetries) {
        task.retryCount++;
        this.logger.log(
          `Retrying task ${task.taskId} due to worker termination, attempt ${task.retryCount}`
        );

        // Generate new task ID for retry
        const newTaskId = this.generateTaskId();
        task.taskId = newTaskId;

        // Re-add to pending tasks with new ID
        this.pendingTasks.set(newTaskId, task);
        this.taskQueue.unshift(task);
      }
      this.pendingTasks.delete(worker.activeTask);
    }

    worker.worker.terminate();
    this.workers.delete(workerId);

    this.logger.log(
      `Worker ${workerId} terminated. Remaining workers: ${this.workers.size}`
    );
  }

  // Public API
  runTask(action: string, payload?: unknown): Promise<unknown> {
    if (this.isShuttingDown) {
      throw new Error('Worker pool is shutting down');
    }

    return new Promise((resolve, reject) => {
      const taskId = this.generateTaskId();
      const task: PendingTask = {
        taskId,
        resolve,
        reject,
        timestamp: Date.now(),
        retryCount: 0,
        action,
        payload,
      };

      this.pendingTasks.set(taskId, task);
      this.taskQueue.push(task);

      this.processQueue();
    });
  }

  getStats() {
    const workers = Array.from(this.workers.values());
    return {
      totalWorkers: workers.length,
      busyWorkers: workers.filter((w) => w.busy).length,
      idleWorkers: workers.filter((w) => !w.busy).length,
      queueLength: this.taskQueue.length,
      pendingTasks: this.pendingTasks.size,
      totalTasksCompleted: workers.reduce((sum, w) => sum + w.taskCount, 0),
      totalErrors: workers.reduce((sum, w) => sum + w.errorCount, 0),
    };
  }

  async shutdown(): Promise<void> {
    this.logger.log('Shutting down worker pool...');
    this.isShuttingDown = true;

    // Clear cleanup interval
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }

    // Reject all pending tasks
    for (const task of this.pendingTasks.values()) {
      task.reject(new Error('Worker pool is shutting down'));
    }
    this.pendingTasks.clear();
    this.taskQueue.length = 0;

    // Terminate all workers
    const terminationPromises = Array.from(this.workers.keys()).map(
      (workerId) => {
        return new Promise<void>((resolve) => {
          const worker = this.workers.get(workerId);
          if (worker) {
            worker.worker.addEventListener('close', () => resolve());
            worker.worker.terminate();
          } else {
            resolve();
          }
        });
      }
    );

    await Promise.all(terminationPromises);
    this.workers.clear();
    this.logger.log('Worker pool shutdown complete');
  }
}
