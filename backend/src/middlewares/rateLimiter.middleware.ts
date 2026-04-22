import type { Request, Response,NextFunction } from "express";
import Redis from 'ioredis';

const redis = new Redis();

export function rateLimiter(){
    return async (req: Request, res: Response, next: NextFunction) => {
        try{
            const ip = req.ip;
            const key = `rate-limit:${ip}`;

            const limit = 100;
            const windowTime = 15 * 60;

            const requests = await redis.incr(key);

            if (requests === 1) {
                await redis.expire(key, windowTime);
            }

            if (requests > limit) {
                return res.status(429).json({ message: 'Too many requests, try again later.' });
            }

            next();
        }catch(err){
            console.error("Rate limiter error: " + err);
                
            next();
        }
    }
}