import "dotenv/config";

// Redis server connection settings
export const connection = {
  host: process.env.REDIS_HOST || "localhost", 
  port: Number(process.env.REDIS_PORT) || 6379    
};

