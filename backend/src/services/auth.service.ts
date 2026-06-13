import argon2 from "argon2";
import { prisma } from "../db/client";
import type { ForgotPasswordDTO, LoginDTO, RegisterDTO, ResetPasswordDTO } from "../dto/auth.dto";
import jwt from "jsonwebtoken";
import "dotenv/config";
import { generateAccessToken, generateRefreshToken } from "../middlewares/auth.middleware";
import type { UserPayload } from "../types/express";
import nodemailer from "nodemailer";

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
        html: `
          <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h1 style="color: #111827; font-size: 24px;">Verify your email</h1>
            <p style="color: #4b5563; font-size: 16px; line-height: 1.5;">
              Thank you for registering! We're excited to have you on board. Please click the button below to verify your account and start your journey with WatchYourBid.
            </p>
            
            <table role="presentation" border="0" cellpadding="0" cellspacing="0" style="margin: 30px 0;">
              <tr>
                <td align="center" bgcolor="#fbbf24" style="border-radius: 8px;">
                  <a href="${verificationLink}" 
                    style="display: block; padding: 14px 28px; font-size: 16px; font-weight: bold; color: #ffffff; text-decoration: none; border-radius: 8px; border: 1px solid #fbbf24; background-color: #fbbf24;">
                    Verify My Account
                  </a>
                </td>
              </tr>
            </table>
            
            <p style="color: #9ca3af; font-size: 12px; margin-top: 40px;">
              If you didn't create an account, you can safely ignore this email.
            </p>
          </div>`
      });
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
      where: { refreshToken: token },
      include: { user: true }
    });

    if (!session || session.expiresAt < new Date()) {
      if (session) await prisma.session.delete({ where: { id: session.id } });
      throw new Error("Refresh token expired or invalid!");
    }

    try {
      const decoded = jwt.verify(token, `${process.env.REFRESH_TOKEN_SECRET}`) as UserPayload;

      const accessToken = generateAccessToken({ 
        username: session.user.username, 
        id: session.user.id, 
        role: session.user.role 
      });

      return { 
        accessToken, 
        user: {
          username: session.user.username,
          id: session.user.id,
          role: session.user.role
        }
      };
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
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #1f2937;">Verify your email</h1>
            <p style="color: #4b5563; font-size: 16px;">
              Thank you for registering! Please click the button below to verify your account:
            </p>
            
            <table role="presentation" border="0" cellpadding="0" cellspacing="0" style="margin: 30px 0;">
              <tr>
                <td align="center" bgcolor="#fbbf24" style="border-radius: 8px;">
                  <a href="${verificationLink}" 
                    style="display: block; padding: 14px 28px; font-family: sans-serif; font-size: 16px; font-weight: bold; color: #ffffff; text-decoration: none; border-radius: 8px; border: 1px solid #fbbf24;">
                    Verify My Account
                  </a>
                </td>
              </tr>
            </table>
            
            <p style="color: #9ca3af; font-size: 12px;">If you didn't create an account, you can safely ignore this email.</p>
          </div>`
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
        html: `
          <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h1 style="color: #111827; font-size: 24px;">Reset your password</h1>
            <p style="color: #4b5563; font-size: 16px; line-height: 1.5;">
              We received a request to reset your password. If you didn't make this request, you can safely ignore this email. Otherwise, click the button below to set a new password:
            </p>
            
            <table role="presentation" border="0" cellpadding="0" cellspacing="0" style="margin: 30px 0;">
              <tr>
                <td align="center" bgcolor="#fbbf24" style="border-radius: 8px;">
                  <a href="${forgotLink}" 
                    style="display: block; padding: 14px 28px; font-size: 16px; font-weight: bold; color: #ffffff; text-decoration: none; border-radius: 8px; border: 1px solid #fbbf24; background-color: #fbbf24;">
                    Reset Password
                  </a>
                </td>
              </tr>
            </table>
            
            <p style="color: #9ca3af; font-size: 12px; margin-top: 40px;">
              This link will expire in a short time for your security.
            </p>
          </div>`
      });
      
      console.log("Email sent for resetting password!")

      return { message: "Email sent successfully for resetting password!"}
    } catch(err) {
      console.error("Forgot password email sending failed: ", err);
      throw new Error(err instanceof Error ? err.message : "Forgot password email sending failed");
    }
  },
  async resetPassword(data: ResetPasswordDTO) {
    try{
      const decoded = jwt.verify(data.token, process.env.RESET_PASSWORD_TOKEN_SECRET as string) as { userId : number };
      
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