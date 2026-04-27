import { Queue } from "bullmq";
import { connection } from "../db/connect";

export const auctionTasks = new Queue("auction-tasks", { 
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