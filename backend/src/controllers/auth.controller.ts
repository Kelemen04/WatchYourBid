import type { Request, Response } from "express";
import { authService } from "../services/auth.service";
import type { RegisterDTO , LoginDTO } from "../dto/auth.dto";

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
    const user = await authService.login(body);
    res.status(201).json({ message: "Login successful!", accessToken: user.accessToken, refreshToken: user.refreshToken, user: user.user});
  } catch(e) {
    return res.status(400).json({ error: e instanceof Error ? e.message : "Unknown error" });
  }
}

export async function logout(req: Request, res: Response) {
  const token = req.body.token;
  try {
    await authService.logout(token)
    res.status(201).json({ message: "Logout successful!"})
  } catch (e) {
     return res.status(400).json({ error: e instanceof Error ? e.message : "Unknown error" });
  }
}

export async function refresh(req: Request, res: Response) {
  const refreshToken = req.body.token;

  try {
    const refresh = await authService.refresh(refreshToken);
    res.status(200).json({ message: "Token refreshed!", accessToken: refresh.accessToken });
  } catch(e) {
    return res.status(400).json({ error: e instanceof Error ? e.message : "Unknown error" });
  }
}