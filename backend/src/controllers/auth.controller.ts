import type { Request, Response } from "express";
import { authService } from "../services/auth.service";
import { type RegisterDTO , type LoginDTO, type ForgotPasswordDTO, ResetPassword, type ResetPasswordDTO } from "../dto/auth.dto";

export async function register(req: Request, res: Response) {
  const body = req.body as RegisterDTO;

  try {
    console.log("ITI");
    const user = await authService.register(body);
    res.status(201).json({ username: user.user.username });
  } catch(e) {
    return res.status(400).json({ error: e instanceof Error ? e.message : "Unknown error" });
  }
}

export async function login(req: Request, res: Response) {
  const body = req.body as LoginDTO;

  try {
    const user = await authService.login(body);
    res.cookie('refreshToken', user.refreshToken ,{ httpOnly: true, maxAge: 7 * 24 * 60 * 60 * 1000 });
    res.status(200).json({ message: "Login successful!", accessToken: user.accessToken, username: user.user.username, role: user.user.role, id: user.user.id });
  } catch(e) {
    return res.status(400).json({ error: e instanceof Error ? e.message : "Unknown error" });
  }
}

export async function logout(req: Request, res: Response) {
  const refreshToken = req.cookies.refreshToken;
  try {
    if( refreshToken ){
      await authService.logout(refreshToken)
    }

    res.clearCookie('refreshToken', {
      httpOnly: true,
    });

    res.status(201).json({ message: "Logout successful!"})
  } catch (e) {
    res.clearCookie('refreshToken');
     return res.status(400).json({ error: e instanceof Error ? e.message : "Unknown error" });
  }
}

export async function refresh(req: Request, res: Response) {
  const refreshToken = req.cookies.refreshToken;

  try {
    const refresh = await authService.refresh(refreshToken);
    res.status(200).json({ message: "Token refreshed!", accessToken: refresh.accessToken });
  } catch(e) {
    res.clearCookie('refreshToken')
    return res.status(400).json({ error: e instanceof Error ? e.message : "Unknown error" });
  }
}

export async function verifyEmail(req: Request, res: Response) {
  const token = req.query.token as string;

  try{
    const result = await authService.verifyEmail(token);
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
    console.log("CONT")
    const resetPassword = await authService.resetPassword(body);
    res.status(200).json(resetPassword);
  } catch(e){
    return res.status(400).json({ error: e instanceof Error ? e.message : "Unknown error" });
  }
}