import type { Request, Response, NextFunction } from "express";
import type { ZodType } from "zod";
import "dotenv/config";
import jwt from "jsonwebtoken";
import type { UserPayload } from "../types/express";

// Validate request body against Zod schema
export function validate(schema: ZodType) {
    return (req: Request, res: Response, next: NextFunction) => {
        const result = schema.safeParse(req.body);

        if (!result.success) {    
            res.status(400).json({ error: result.error.format() });
            return;
        }
        
        req.body = result.data;
        next();
    };
}

// Enforce JWT authentication
export function authenticateToken() {
    return (req: Request, res: Response, next: NextFunction) => {
        const authHeader = req.headers['authorization'];
        let token = authHeader && authHeader.split(' ')[1];

        // Fallback to cookies
        if (!token && req.cookies) {
            token = req.cookies.accessToken || req.cookies.refreshToken; 
        }

        if (token == null) {
            return res.sendStatus(401);
        }

        jwt.verify(token, process.env.ACCESS_TOKEN_SECRET as string, (err, user) => {
            if (err) {
                return res.status(403).json({ error: "Invalid token" });
            }
            req.user = user as UserPayload;
            next();
        });
    };
}

// Optional authentication
export function optionalAuthenticateToken() {
    return (req: Request, res: Response, next: NextFunction) => {
        const authHeader = req.headers['authorization'];
        let token = authHeader && authHeader.split(' ')[1];

        if (!token && req.cookies) {
            token = req.cookies.accessToken || req.cookies.refreshToken; 
        }

        if (token == null) {
            return next();
        }

        jwt.verify(token, process.env.ACCESS_TOKEN_SECRET as string, (err, user) => {
            if (!err) {
                req.user = user as UserPayload;
            }
            next();
        });
    };
}

// Generate JWT tokens
export function generateAccessToken(user: UserPayload) {
    return jwt.sign(user, process.env.ACCESS_TOKEN_SECRET as string, { expiresIn: '15m' });
}

export function generateRefreshToken(user: UserPayload) {
    return jwt.sign(user, process.env.REFRESH_TOKEN_SECRET as string, { expiresIn: '7d' });
}