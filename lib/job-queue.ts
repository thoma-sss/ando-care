type JobStatus = "pending" | "processing" | "completed" | "failed";

interface Job<T = unknown> {
  id: string;
  data: T;
  status: JobStatus;
  attempts: number;
  maxAttempts: number;
  createdAt: Date;
  processedAt?: Date;
  error?: string;
}

interface JobQueueOptions {
  maxAttempts?: number;
  retryDelayMs?: number;
  processingTimeoutMs?: number;
}

type JobProcessor<T> = (data: T) => Promise<void>;

/**
 * Simple in-memory job queue with retry support
 * In production, replace with Redis/BullMQ
 */
export class JobQueue<T = unknown> {
  private queue: Map<string, Job<T>> = new Map();
  private processor: JobProcessor<T> | null = null;
  private isProcessing = false;
  private options: Required<JobQueueOptions>;

  constructor(options: JobQueueOptions = {}) {
    this.options = {
      maxAttempts: options.maxAttempts ?? 3,
      retryDelayMs: options.retryDelayMs ?? 5000,
      processingTimeoutMs: options.processingTimeoutMs ?? 60000,
    };
  }

  /**
   * Add a job to the queue
   */
  add(id: string, data: T): void {
    const job: Job<T> = {
      id,
      data,
      status: "pending",
      attempts: 0,
      maxAttempts: this.options.maxAttempts,
      createdAt: new Date(),
    };

    this.queue.set(id, job);
    this.processNext();
  }

  /**
   * Set the job processor function
   */
  setProcessor(processor: JobProcessor<T>): void {
    this.processor = processor;
  }

  /**
   * Process the next pending job
   */
  private async processNext(): Promise<void> {
    if (this.isProcessing || !this.processor) return;

    const pendingJob = Array.from(this.queue.values()).find(
      (job) => job.status === "pending"
    );

    if (!pendingJob) return;

    this.isProcessing = true;
    pendingJob.status = "processing";
    pendingJob.attempts++;

    try {
      await Promise.race([
        this.processor(pendingJob.data),
        new Promise((_, reject) =>
          setTimeout(
            () => reject(new Error("Job timeout")),
            this.options.processingTimeoutMs
          )
        ),
      ]);

      pendingJob.status = "completed";
      pendingJob.processedAt = new Date();

      // Remove completed jobs after a while
      setTimeout(() => {
        this.queue.delete(pendingJob.id);
      }, 60000);
    } catch (error) {
      pendingJob.error =
        error instanceof Error ? error.message : "Unknown error";

      if (pendingJob.attempts >= pendingJob.maxAttempts) {
        pendingJob.status = "failed";
        console.error(
          `Job ${pendingJob.id} failed after ${pendingJob.attempts} attempts:`,
          pendingJob.error
        );
      } else {
        pendingJob.status = "pending";
        console.warn(
          `Job ${pendingJob.id} failed (attempt ${pendingJob.attempts}/${pendingJob.maxAttempts}):`,
          pendingJob.error
        );

        // Schedule retry
        setTimeout(() => {
          this.processNext();
        }, this.options.retryDelayMs);
      }
    } finally {
      this.isProcessing = false;
      // Process next job
      setImmediate(() => this.processNext());
    }
  }

  /**
   * Get job status
   */
  getJob(id: string): Job<T> | undefined {
    return this.queue.get(id);
  }

  /**
   * Get queue statistics
   */
  getStats(): {
    pending: number;
    processing: number;
    completed: number;
    failed: number;
    total: number;
  } {
    const jobs = Array.from(this.queue.values());
    return {
      pending: jobs.filter((j) => j.status === "pending").length,
      processing: jobs.filter((j) => j.status === "processing").length,
      completed: jobs.filter((j) => j.status === "completed").length,
      failed: jobs.filter((j) => j.status === "failed").length,
      total: jobs.length,
    };
  }
}

// Singleton instance for activity processing
export interface ActivityJobData {
  activityId: number;
  athleteId: number;
  eventTime: number;
}

export const activityQueue = new JobQueue<ActivityJobData>({
  maxAttempts: 3,
  retryDelayMs: 10000,
  processingTimeoutMs: 120000,
});

