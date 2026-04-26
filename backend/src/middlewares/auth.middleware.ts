import type { Request, Response,NextFunction } from "express";
import type { ZodType } from "zod";
import "dotenv/config";
import jwt from "jsonwebtoken";
import type { UserPayload } from "../types/express";

export function validate(schema: ZodType){
    return (req: Request, res: Response, next: NextFunction) => {
        const result = schema.safeParse(req.body);

        if(!result.success){    
            res.status(400).json({error: result.error.format()});
            return;
        }
        req.body = result.data;

        next();
    }
}

export function authenticateToken(){
    return (req : Request,res : Response, next: NextFunction) => {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1];

        if(token == null){
            return res.sendStatus(401);
        }

        jwt.verify(token,process.env.ACCESS_TOKEN_SECRET as string, (err,user) => {
            if(err){
                return res.status(403).json({ error: "error"})
            }
            req.user = user as UserPayload;

            next();
        });
    }
}

export function generateAccessToken(user: UserPayload){
    return jwt.sign(user, `${process.env.ACCESS_TOKEN_SECRET}`, { expiresIn: '15m' })
}

export function generateRefreshToken(user: UserPayload){
    return jwt.sign(user, `${process.env.REFRESH_TOKEN_SECRET}`, { expiresIn: '7d' })
}
