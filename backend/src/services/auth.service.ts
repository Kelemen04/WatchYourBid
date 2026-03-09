import argon2 from "argon2";
import { prisma } from "../db/client";
import type { LoginDTO, RegisterDTO } from "../dto/auth.dto";
import { is } from "zod/locales";

export const authService = {
  async register(data: RegisterDTO) {

    const existing = await prisma.user.findFirst({
      where: { username: data.username },
    });

    if (existing) {
      throw new Error("Username already exists!");
    }

    const hashedPassword = await argon2.hash(data.password);

    const user = await prisma.user.create({
      data: {
        firstName: data.firstName,
        lastName: data.lastName,
        username: data.username,
        password: hashedPassword,
        email: data.email,
      },
    });

    return user;
  },

  async login (data: LoginDTO){
    const existing = await prisma.user.findUnique({
      where: { email: data.email }
    });

    if(!existing){
      throw new Error("User doesn't exist!");
    }

    const isPasswordValid = await argon2.verify(existing.password,data.password);

    if(!isPasswordValid){
      throw new Error("Wrong password!");
    }

    return existing;
  }
}