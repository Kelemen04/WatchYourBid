import express from "express";
import type { AuctionType, Role, User, WatchCategory } from "../../../generated/prisma";
import type { AuctionFilterDTO } from "../../dto/auction.dto";
import 'multer';

interface UserPayload {
  username: string;
  id: number;
  role: Role
  iat?: number;
  exp?: number;
}

declare global {
  namespace Express {
    interface Request {
      user?: UserPayload;
      validatedId?: number;
      validatedCategory?: string;
      filters: AuctionFilterDTO;
      files: Express.Multer.File[];
    }
  }
}
