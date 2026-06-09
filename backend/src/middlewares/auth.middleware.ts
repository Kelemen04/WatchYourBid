import type { Request, Response,NextFunction } from "express";
import type { ZodType } from "zod";
import "dotenv/config";
import jwt from "jsonwebtoken";
import type { UserPayload } from "../types/express";

export function validate(schema: ZodType){
    return (req: Request, res: Response, next: NextFunction) => {
        console.log("VAL")
        const result = schema.safeParse(req.body);
        console.log("VAL")

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
        let token = authHeader && authHeader.split(' ')[1];
        console.log(token)

        if (!token && req.cookies) {
            token = req.cookies.accessToken || req.cookies.refreshToken; 
        }

        console.log("Érkezett token:", token);

        if(token == null){
            return res.sendStatus(401);
        }

        jwt.verify(token,process.env.ACCESS_TOKEN_SECRET as string, (err,user) => {
            if(err){
                console.error("JWT Ellenőrzési hiba:", err.name, err.message);
                return res.status(403).json({ error: "error"})
            }
            req.user = user as UserPayload;

            next();
        });
    }
}

export function optionalAuthenticateToken(){
    return (req : Request, res : Response, next: NextFunction) => {
        const authHeader = req.headers['authorization'];
        let token = authHeader && authHeader.split(' ')[1];

        if (!token && req.cookies) {
            token = req.cookies.accessToken || req.cookies.refreshToken; 
        }

        if(token == null){
            return next();
        }

        jwt.verify(token, process.env.ACCESS_TOKEN_SECRET as string, (err, user) => {
            if(!err){
                req.user = user as UserPayload;
            }
            
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
