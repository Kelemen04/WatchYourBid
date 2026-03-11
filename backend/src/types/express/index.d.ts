import express from "express";
import type { User } from "../../../generated/prisma";

interface UserPayload {
  username: string;
  iat?: number;
  exp?: number;
}

declare global {
  namespace Express {
    interface Request {
      user?: UserPayload;
    }
  }
}
