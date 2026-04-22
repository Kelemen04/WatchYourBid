import argon2 from "argon2";
import { prisma } from "../db/client";
import type { ForgotPasswordDTO, LoginDTO, RegisterDTO, ResetPasswordDTO } from "../dto/auth.dto";
import jwt from "jsonwebtoken";
import "dotenv/config";
import { generateAccessToken, generateRefreshToken } from "../middlewares/auth.middleware";
import type { UserPayload } from "../types/express";
import nodemailer from "nodemailer";
import type { forgotPassword } from "../controllers/auth.controller";

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465,
  secure: true,
  auth: {
    user: process.env.EMAIL,
    pass: process.env.APP_PASSWORD
  }
})

export const authService = {
  async register(data: RegisterDTO) {
    const existing = await prisma.user.findFirst({
      where: {
        OR: [
          { username: data.username },
          { email: data.email }
        ] 
      },
    });

    if (existing) {
      throw new Error("Username or email already exists!");
    }

    const hashedPassword = await argon2.hash(data.password);

    const user = await prisma.user.create({
      data: {
        username: data.username,
        password: hashedPassword,
        email: data.email,
      },
    });

    const verificationToken = jwt.sign({ userId: user.id }, process.env.EMAIL_TOKEN_SECRET as string, { expiresIn: '24h' });

    const verificationLink = `http://localhost:8000/api/auth/verify-email?token=${verificationToken}`;
    
    try {
      await transporter.sendMail({
        to: data.email,
        subject: "Email verification for WatchYourBid app",
        html: `<h1>Verify your email</h1>
              <p>Thank you for registering! Please click the button below to verify your account:</p>
              <a href="${verificationLink}" style="background: #fbbf24; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
                Verify My Account
              </a>`
      })
      console.log("Email sent!")
    } catch (error) {
      console.error("Email error:", error);
    }

    const { password, ...userWithoutPassword } = user;
    return { user: userWithoutPassword };
  },

  async login(data: LoginDTO) {
    const existing = await prisma.user.findUnique({
      where: { username: data.username }
    });

    if (!existing) {
      throw new Error("User doesn't exist!");
    }

    if(!existing.emailVerified) {
      throw new Error("Verify your email before logging in!")
    }

    const isPasswordValid = await argon2.verify(existing.password, data.password);
    if (!isPasswordValid) {
      throw new Error("Wrong password!");
    }

    const userPayload: UserPayload = { username: existing.username, id: existing.id, role: existing.role };

    const accessToken = generateAccessToken(userPayload);
    const refreshToken = generateRefreshToken(userPayload);

    const expireDate = new Date();
    expireDate.setDate(expireDate.getDate() + 7);

    await prisma.session.create({
      data: {
        refreshToken: refreshToken,
        expiresAt: expireDate,
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

    if (!session || session.expiresAt < new Date()) {
        if (session) await prisma.session.delete({ where: { id: session.id } });
        throw new Error("Refresh token expired or invalid!");
    }

    try {
      const decoded = jwt.verify(token, `${process.env.REFRESH_TOKEN_SECRET}`) as UserPayload;

      const accessToken = generateAccessToken({ username: decoded.username, id: decoded.id, role: decoded.role });

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
  },

  async verifyEmail(token: string) {
    try{
      const decoded = jwt.verify(token, process.env.EMAIL_TOKEN_SECRET as string) as { userId: number };

      await prisma.user.update({
        where: { id: decoded.userId },
        data: { emailVerified: true }
      });

      return { message: "Email verification successful!"}
    } catch(e) {
      throw new Error("Email verification failed");
    }
  },

  async resendEmailVerification(data: LoginDTO) {
    try{
      const existing = await prisma.user.findUnique({
        where: { username: data.username }
      });

      if (!existing) {
        throw new Error("User doesn't exist!");
      }

      if (existing.emailVerified) {
        throw new Error("Email is already verified!");
      }

      const verificationToken = jwt.sign({ userId: existing.id }, process.env.EMAIL_TOKEN_SECRET as string, { expiresIn: '24h' });

      const verificationLink = `http://localhost:8000/api/auth/verify-email?token=${verificationToken}`;
    
      await transporter.sendMail({
        to: existing.email,
        subject: "Email verification for WatchYourBid app",
        html: `<h1>Verify your email</h1>
              <p>Thank you for registering! Please click the button below to verify your account:</p>
              <a href="${verificationLink}" style="background: #fbbf24; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
                Verify My Account
              </a>`
      })
      
      console.log("Email resent!")

      return { message: "Email verification resent successfully!"}
    } catch(err) {
      console.error("Email verification resending failed: ", err);
      throw new Error(err instanceof Error ? err.message : "Failed to resend verification email");
    }
  },
  async forgotPassword(data: ForgotPasswordDTO) {
    try{
      const existing = await prisma.user.findUnique({
        where: { email: data.email }
      });

      if (!existing) {
        throw new Error("User doesn't exist!");
      }

      const forgotToken = jwt.sign({ userId: existing.id }, process.env.RESET_PASSWORD_TOKEN_SECRET as string, { expiresIn: '1h' });

      const forgotLink = `http://localhost:8080/reset-password?token=${forgotToken}`;
    
      await transporter.sendMail({
        to: existing.email,
        subject: "Password reset",
        html: `<h1>Reset your password</h1>
              <p>Please click the button below to reset your password:</p>
              <a href="${forgotLink}" style="background: #fbbf24; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
                Reset password
              </a>`
      })
      
      console.log("Email sent for resetting password!")

      return { message: "Email sent successfully for resetting password!"}
    } catch(err) {
      console.error("Forgot password email sending failed: ", err);
      throw new Error(err instanceof Error ? err.message : "Forgot password email sending failed");
    }
  },
  async resetPassword(data: ResetPasswordDTO) {
    const decoded = jwt.verify(data.token, process.env.RESET_PASSWORD_TOKEN_SECRET as string) as { userId : number };
  
    try{
      const existing = await prisma.user.findUnique({
        where: { id: decoded.userId }
      });

      if (!existing) {
        throw new Error("User doesn't exist!");
      }

      const hashedPassword = await argon2.hash(data.newPassword);

      const user = await prisma.user.update({
        where: { id: existing.id},
        data: { password: hashedPassword }
      })
      
      console.log("Password resetting successfull!")

      return { message: "Password reset successfully!"}
    } catch(err) {
      console.error("Resetting password failed: ", err);
      throw new Error(err instanceof Error ? err.message : "Resetting password failed");
    }
  }
};