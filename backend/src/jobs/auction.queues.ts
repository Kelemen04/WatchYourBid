import { Queue } from "bullmq";
import { connection } from "../db/connect";

// Auction background task queue
export const auctionTasks = new Queue("auction-tasks", { 
    connection, 
    defaultJobOptions: {
      removeOnComplete: true, // Cleanup successful jobs
      removeOnFail: { count: 1000 }, // Keep last 1000 failed jobs
      attempts: 3, // Retry attempts
      backoff: {
        type: 'exponential',
        delay: 1000,
      },
    }    
});

// Promotion background task queue
export const promotingTasks = new Queue("promoting-tasks", { 
    connection, 
    defaultJobOptions: {
      removeOnComplete: true,
      removeOnFail: { count: 1000 },
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 1000,
      },
    }    
});