import type { NextFunction, Request, Response } from "express";
import { authService } from "../services/auth.service";
import { type RegisterDTO , type LoginDTO, type ForgotPasswordDTO, type ResetPasswordDTO, type SocialLoginDTO } from "../dto/auth.dto";
import passport from "passport";
import { email } from "zod";
import { profile } from "console";

const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
  maxAge: 7 * 24 * 60 * 60 * 1000,
};

export async function register(req: Request, res: Response) {
  const body = req.body as RegisterDTO;
  try {
    const user = await authService.register(body);
    res.status(201).json({ username: user.user.username });
  } catch(e) {
    return res.status(400).json({ error: e instanceof Error ? e.message : "Unknown error" });
  }
}

export async function login(req: Request, res: Response) {
  const body = req.body as LoginDTO;
  try {
    const result = await authService.login(body);
    
    res.cookie('refreshToken', result.refreshToken, cookieOptions);

    res.status(200).json({ 
      message: "Login successful!", 
      accessToken: result.accessToken, 
      username: result.user.username, 
      role: result.user.role, 
      id: result.user.id 
    });
  } catch(e) {
    return res.status(400).json({ error: e instanceof Error ? e.message : "Unknown error" });
  }
}

export function googleAuth(req: Request, res: Response, next: NextFunction ) {
  passport.authenticate('google', {scope: ['profile', 'email']})(req, res, next);
}

export async function googleAuthRedirect(req: Request, res: Response ) {
  const user = {
    id: req.socialUser?.id as string,
    provider: req.socialUser?.provider as string,
    displayName: req.socialUser?.displayName as string,
    email: req.socialUser?.email || undefined ,
    familyName: req.socialUser?.familyName as string,
    givenName: req.socialUser?.givenName as string,
    profilePicture: req.socialUser?.photos as string
  };

  try {
    const result = await authService.socialAuthRegister(user);
    res.cookie('refreshToken', result.refreshToken, cookieOptions);
    
    return res.redirect('http://localhost:80/home');
  } catch(e) {
    return res.redirect('http://localhost:8000/api/auth/login');
  }
}

export async function logout(req: Request, res: Response) {
  const refreshToken = req.cookies.refreshToken;
  try {
    if (refreshToken) {
      await authService.logout(refreshToken);
    }

    res.clearCookie('refreshToken', cookieOptions);

    res.status(200).json({ message: "Logout successful!" });
  } catch (e) {
    res.clearCookie('refreshToken', cookieOptions);
    return res.status(400).json({ error: e instanceof Error ? e.message : "Unknown error" });
  }
}

export async function refresh(req: Request, res: Response) {
  const refreshToken = req.cookies.refreshToken;

  try {
    const result = await authService.refresh(refreshToken);

    res.status(200).json({ 
      accessToken: result.accessToken,
      username: result.user.username,
      role: result.user.role,
      id: result.user.id
    });
  } catch(e) {
    res.clearCookie('refreshToken', cookieOptions);
    return res.status(401).json({ error: e instanceof Error ? e.message : "Session expired" });
  }
}

export async function verifyEmail(req: Request, res: Response) {
  const token = req.query.token as string;

  try{
    await authService.verifyEmail(token);
    res.redirect('http://localhost:8080/login?verified=true')
  }  catch(e) {
    return res.status(400).json({ error: e instanceof Error ? e.message : "Unknown error" });
  }
}

export async function resendEmailVerification(req: Request, res: Response) {
  const body = req.body as LoginDTO;

  try{
    const resendEmailVerification = await authService.resendEmailVerification(body);
    res.status(200).json(resendEmailVerification)
  }  catch(e) {
    return res.status(400).json({ error: e instanceof Error ? e.message : "Unknown error" });
  }
}

export async function forgotPassword(req: Request, res: Response) {
  const body = req.body as ForgotPasswordDTO;

  try{
    const forgotPassword = await authService.forgotPassword(body);
    res.status(200).json(forgotPassword);
  }  catch(e) {
    return res.status(400).json({ error: e instanceof Error ? e.message : "Unknown error" });
  }
}

export async function resetPassword(req: Request, res: Response) {
  const body = req.body as ResetPasswordDTO;

  try{
    const resetPassword = await authService.resetPassword(body);
    res.status(200).json(resetPassword);
  } catch(e){
    return res.status(400).json({ error: e instanceof Error ? e.message : "Unknown error" });
  }
}