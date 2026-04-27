import "dotenv/config";

export const connection = {
  host: process.env.BULLMQ_HOST || "localhost", 
  port: Number(process.env.BULLMQ_PORT) || 6379    
};

