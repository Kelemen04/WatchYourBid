import express from "express";
import type { AuctionType, Role, User, WatchCategory } from "../../../generated/prisma";
import type { AuctionFilterDTO } from "../../dto/auction.dto";
import 'multer';

// User authentication data
interface UserPayload {
  username: string;
  id: number;
  role: Role;
  iat?: number;
  exp?: number;
}

interface SocialUserPayload {
  id: string;
  provider?: string;
  displayName?: string;
  familyName?: string;
  givenName?: string;
  email?: string;
  photos?: string; 
}

// Extend Express Request types
declare global {
  namespace Express {
    interface Request {
      user?: UserPayload;
      socialUser?: SocialUserPayload;
      validatedId?: number;
      validatedCategory?: string;
      filters: AuctionFilterDTO;
      files: Express.Multer.File[];
      code?: string;
    }
  }
}