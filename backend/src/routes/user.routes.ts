import express from 'express';
import { getMe, updateMe, registerBuyer, registerSeller } from '../controllers/user.controller'
import { BuyerRegisterSchema , SellerRegisterSchema } from '../dto/user.dto';
import { authenticateToken, validate } from '../middlewares/auth.middleware';

const router = express.Router();

router.get('/me', authenticateToken(), getMe)
router.patch('/me', authenticateToken(), updateMe)

router.post('/me/register-buyer', authenticateToken(), validate(BuyerRegisterSchema), registerBuyer)
router.post('/me/register-seller', authenticateToken(), validate(SellerRegisterSchema), registerSeller)

export default router;