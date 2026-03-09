import type { Request, Response } from "express";
import { authService } from "../services/auth.service";
import type { RegisterDTO , LoginDTO } from "../dto/auth.dto";

export async function register(req: Request, res: Response) {
  const body = req.body as RegisterDTO;

  try {
    const user = await authService.register(body);
     res.status(201).json({ id: user.id, username: user.username });
  } catch(e) {
  return res.status(400).json({ error: e instanceof Error ? e.message : "Unknown error" });
}
}

export async function login(req: Request, res: Response) {
  const body = req.body as LoginDTO;

  try {
    const user = await authService.login(body);
     res.status(201).json({ message: "Login successful!" });
  } catch(e) {
  return res.status(400).json({ error: e instanceof Error ? e.message : "Unknown error" });
}
}