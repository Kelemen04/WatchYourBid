import type { Request , Response } from "express";
import type { BuyerRegisterDTO, SellerRegisterDTO } from "../dto/user.dto";
import { userService } from "../services/user.services";

export async function getMe(req: Request, res: Response) {
  const userId = req.user?.id as number;

  try{
    const me = await userService.getMe(userId);
    res.status(200).json(me);
  } catch (e) {
    return res.status(400).json({ error: e instanceof Error ? e.message : "Unknown error" });
  }
}

export async function updateMe(req: Request, res: Response) {
  const userId = req.user?.id as number;
  const body = req.body;

  try{
    const me = await userService.updateMe(body,userId);
    res.status(200).json(me);
  } catch (e) {
    return res.status(400).json({ error: e instanceof Error ? e.message : "Unknown error" });
  }
}

export async function registerBuyer(req: Request, res: Response) {
  const body = req.body as BuyerRegisterDTO;
  const userId = req.user?.id as number;

  try{
    let registerBuyer = await userService.registerBuyer(body,userId);

    if(req.file){
      const file = req.file as Express.Multer.File;
      registerBuyer = await userService.uploadUserFiles(registerBuyer.id, file)
    }

    res.status(200).json({message: "Buyer registered successfully", buyer: registerBuyer})
  } catch(e) {
    return res.status(400).json({ error: e instanceof Error ? e.message : "Unknown error" });
  }
}

export async function registerSeller(req: Request, res: Response) {
  const body = req.body as SellerRegisterDTO;
  const userId = req.user?.id as number;
  try{
    let registerSeller = await userService.registerSeller(body,userId);

    if(req.files){
      const file = req.file as Express.Multer.File;
      registerSeller = await userService.uploadUserFiles(registerSeller.id, file)
    }

    res.status(200).json({message: "Seller registered successfully", seller: registerSeller})
  } catch(e) {
    return res.status(400).json({ error: e instanceof Error ? e.message : "Unknown error" });
  }
}