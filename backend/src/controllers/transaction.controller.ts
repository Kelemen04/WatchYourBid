import type { Request, Response } from "express";
import { AllTransactionResponseSchema, GetTransactionsNumberSchema, TransactionResponseSchema, type UploadMoneyDTO } from "../dto/transaction.dto";
import { transactionService } from "../services/transaction.service";
import z from "zod";

export async function createCheckoutSession(req: Request, res: Response) {
  const userId = req.user?.id as number;
  const body = req.body as UploadMoneyDTO;
  try {
    const transactionSession = await transactionService.createCheckoutSession(userId,body);
    res.status(201).json(transactionSession);
  } catch(e) {
    return res.status(400).json({ error: e instanceof Error ? e.message : "Unknown error" });
  }
}

export async function confirmPayment(req: Request, res: Response) {
    const sessionId = req.body.sessionId;

    if (!sessionId) {
        return res.status(400).json({ error: "Missing sessionId" });
    }

    try {
        const result = await transactionService.confirmPayment(sessionId);
        return res.status(200).json(result);
    } catch (e) {
        return res.status(400).json({ error: e instanceof Error ? e.message : "Unknown error" });
    }
}

export async function withdrawMoney(req: Request, res: Response) {
    const userId = req.user?.id as number;
    const data = req.body as UploadMoneyDTO;

    try {
        const result = await transactionService.withdrawMoney(userId,data);
        return res.status(200).json(result);
    } catch (e) {
        return res.status(400).json({ error: e instanceof Error ? e.message : "Unknown error" });
    }
}

export async function getTransactionHistory(req: Request, res: Response) {
    const userId = req.user?.id as number;
    try {
        const validationResult = GetTransactionsNumberSchema.safeParse(req.query);
        
        if (!validationResult.success) {
          return res.status(400).json({ error: validationResult.error.issues[0]?.message || "Invalid input!" });
        }
        
        const { take,skip } = validationResult.data;

        const result = await transactionService.getTransactionHistory(userId, skip, take);
        const cleanResponse = z.array(TransactionResponseSchema).parse(result);
        return res.status(200).json(cleanResponse);
    } catch (e) {
        return res.status(400).json({ error: e instanceof Error ? e.message : "Unknown error" });
    }
}

export async function getAllTransactionHistory(req: Request, res: Response) {
    try {
        const validationResult = GetTransactionsNumberSchema.safeParse(req.query);
        
        if (!validationResult.success) {
          return res.status(400).json({ error: validationResult.error.issues[0]?.message || "Invalid input!" });
        }
        
        const { take,skip } = validationResult.data;

        const result = await transactionService.getAllTransactionHistory(skip,take);
        const cleanResponse = z.array(AllTransactionResponseSchema).parse(result);
        return res.status(200).json(cleanResponse);
    } catch (e) {
        return res.status(400).json({ error: e instanceof Error ? e.message : "Unknown error" });
    }
}