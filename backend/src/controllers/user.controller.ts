import type { Request, Response } from "express";
import type { BuyerRegisterDTO, SellerRegisterDTO } from "../dto/user.dto";
import { userService } from "../services/user.services";
import { minioService } from "../services/minio.service";

export async function getMe(req: Request, res: Response) {
  const userId = req.user?.id as number;

  try {
    const me = await userService.getMe(userId);
    res.status(200).json(me);
  } catch (e) {
    return res.status(400).json({ error: e instanceof Error ? e.message : "Unknown error" });
  }
}

export async function getUserById(req: Request, res: Response) {
  const userId = req.validatedId as number;

  try {
    const me = await userService.getUserById(userId);
    res.status(200).json(me);
  } catch (e) {
    return res.status(400).json({ error: e instanceof Error ? e.message : "Unknown error" });
  }
}

export async function updateMe(req: Request, res: Response) {
  const userId = req.user?.id as number;
  const body = req.body;

  try {
    const me = await userService.updateMe(body, userId);
    res.status(200).json(me);
  } catch (e) {
    return res.status(400).json({ error: e instanceof Error ? e.message : "Unknown error" });
  }
}

export async function deleteMe(req: Request, res: Response) {
  const userId = req.user?.id as number;

  try {
    const me = await userService.deleteMe(userId);
    res.clearCookie("refresh_token");
    res.status(200).json(me);
  } catch (e) {
    return res.status(400).json({ error: e instanceof Error ? e.message : "Unknown error" });
  }
}

export async function registerBuyer(req: Request, res: Response) {
  const body = req.body as BuyerRegisterDTO;
  const userId = req.user?.id as number;
  const image = req.file;

  try {
    if(image){
      const uploadImage = await minioService.uploadUserProfilePicture(userId,image);

      body.profilePicture = uploadImage.url;
    }

    let user = await userService.registerBuyer(body, userId);
    res.status(200).json({ message: "Buyer registered successfully", user });
  } catch (e) {
    return res.status(400).json({ error: e instanceof Error ? e.message : "Unknown error" });
  }
}

export async function registerSeller(req: Request, res: Response) {
  const body = req.body as SellerRegisterDTO;
  const userId = req.user?.id as number;
  const image = req.file;

  try {
    if(image){
      const uploadImage = await minioService.uploadUserProfilePicture(userId,image);

      body.profilePicture = uploadImage.url;
    }

    let user = await userService.registerSeller(body, userId);
    res.status(200).json({ message: "Seller registered successfully", user });
  } catch (e) {
    return res.status(400).json({ error: e instanceof Error ? e.message : "Unknown error" });
  }
}

export async function updateBuyer(req: Request, res: Response) {
    try {
        const result = await userService.updateBuyer(req.body, req.user?.id as number);
        res.status(200).json({ message: "Buyer profile updated successfully", user: result });
    } catch (err: any) {
        res.status(400).json({ error: err.message });
    }
}

export async function updateSeller(req: Request, res: Response) {
    try {
        const result = await userService.updateSeller(req.body, req.user?.id as number);
        res.status(200).json({ message: "Seller profile updated successfully", user: result });
    } catch (err: any) {
        res.status(400).json({ error: err.message });
    }
}

export async function uploadUserImage(req: Request, res: Response) {
  const userId = req.user?.id as number;
  
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No images provided" });
    }
  
    const file = req.file as Express.Multer.File;
    const updatedUser = await userService.uploadUserFile(userId, file);
  
    res.status(200).json({ message: "Image uploaded successfully", user: updatedUser });
  } catch (err) {
    res.status(400).json({ error: err instanceof Error ? err.message : "Unknown error" });
  }
}

export async function getAllUsers(req: Request, res: Response) {
    const skip = Number(req.query.skip) || 0;
    const take = Number(req.query.take) || 20;

    try {
        const users = await userService.getAllUsers(skip, take);
        res.status(200).json(users);
    } catch (e) {
        res.status(400).json({ error: e instanceof Error ? e.message : "Error" });
    }
}

export async function verifyUser(req: Request, res: Response) {
    const userId = Number(req.params.id);
    const { status } = req.body; 

    try {
        const updated = await userService.verifyUser(userId, status);
        return res.status(200).json({ message: "Status updated", user: updated });
    } catch (e) {
        return res.status(400).json({ error: e instanceof Error ? e.message : "Error" });
    }
}

export async function updateUserRole(req: Request, res: Response) {
    const targetUserId = Number(req.params.id);
    const { newRole } = req.body;
    const requesterRole = req.user?.role as string;

    try {
        const user = await userService.updateRole(targetUserId, newRole, requesterRole);
        return res.status(200).json({ message: "Role updated", user });
    } catch (e) {
        return res.status(403).json({ error: e instanceof Error ? e.message : "Forbidden" });
    }
}