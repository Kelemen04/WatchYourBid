import argon2 from "argon2";
import { prisma } from "../db/client";
import type { LoginDTO, RegisterDTO } from "../dto/auth.dto";
import jwt from "jsonwebtoken";
import "dotenv/config";
import { generateAccessToken } from "../middlewares/auth.middleware";
import type { UserPayload } from "../types/express";

export const authService = {
  async register(data: RegisterDTO) {
    const existing = await prisma.user.findFirst({
      where: { username: data.username },
    });

    if (existing) {
      throw new Error("Username already exists!");
    }

    const hashedPassword = await argon2.hash(data.password);

    return await prisma.user.create({
      data: {
        firstName: data.firstName,
        lastName: data.lastName,
        username: data.username,
        password: hashedPassword,
        email: data.email,
      },
    });
  },

  async login(data: LoginDTO) {
    const existing = await prisma.user.findUnique({
      where: { username: data.username }
    });

    if (!existing) {
      throw new Error("User doesn't exist!");
    }

    const isPasswordValid = await argon2.verify(existing.password, data.password);
    if (!isPasswordValid) {
      throw new Error("Wrong password!");
    }

    const userPayload: UserPayload = { username: existing.username };

    const accessToken = generateAccessToken(userPayload);
    const refreshToken = jwt.sign(userPayload, `${process.env.REFRESH_TOKEN_SECRET}`, { expiresIn: '7d' });

    const expireDate = new Date();
    expireDate.setDate(expireDate.getDate() + 7);

    await prisma.session.create({
      data: {
        refreshToken: refreshToken,
        exipresAt: expireDate,
        userId: existing.id
      }
    });

    const { password, ...userWithoutPassword } = existing;
    return { accessToken, refreshToken, user: userWithoutPassword };
  },

  async refresh(token: string) {
    if (!token) throw new Error("No refresh token provided!");

    const session = await prisma.session.findFirst({
      where: { refreshToken: token }
    });

    if (!session || session.exipresAt < new Date()) {
        if (session) await prisma.session.delete({ where: { id: session.id } });
        throw new Error("Refresh token expired or invalid!");
    }

    try {
      const decoded = jwt.verify(token, `${process.env.REFRESH_TOKEN_SECRET}`) as UserPayload;

      const accessToken = generateAccessToken({ username: decoded.username });

      return { accessToken };
    } catch (e) {
      throw new Error("Invalid or expired refresh token!");
    }
  },

  async logout(token: string) {
    try {
        await prisma.session.deleteMany({
            where: { refreshToken: token }
        });
        return { message: "Logged out successfully" };
    } catch (e) {
        throw new Error("Logout failed");
    }
  }
};