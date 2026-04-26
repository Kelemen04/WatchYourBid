import express from "express";
import type { Role, User } from "../../../generated/prisma";

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
    }
  }
}
