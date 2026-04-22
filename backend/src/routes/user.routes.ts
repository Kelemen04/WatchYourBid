import express from 'express';
import { getMe, updateMe, registerBuyer, registerSeller } from '../controllers/user.controller'
import { BuyerRegisterSchema , SellerRegisterSchema } from '../dto/user.dto';
import { authenticateToken, validate } from '../middlewares/auth.middleware';
import { verifyRoles } from '../middlewares/roleAuth.middleware';

const router = express.Router();

router.get('/me', authenticateToken(), verifyRoles("USER"), getMe)
router.patch('/me', authenticateToken(), verifyRoles("USER"), updateMe)

router.post('/me/register-buyer', authenticateToken(), validate(BuyerRegisterSchema), verifyRoles("USER"), registerBuyer)
router.post('/me/register-seller', authenticateToken(), validate(SellerRegisterSchema), verifyRoles("USER"), registerSeller)

export default router;