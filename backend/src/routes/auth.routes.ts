import express from 'express';
import { register, login, getMe, refresh } from '../controllers/auth.controller'
import { RegisterSchema , LoginSchema , BuyerRegisterSchema , SellerRegisterSchema } from '../dto/auth.dto';
import { authenticateToken, validate } from '../middlewares/auth.middleware';

const router = express.Router();

router.post('/register', validate(RegisterSchema), register);
router.post('/login', validate(LoginSchema), login);
router.post('/refresh', refresh)
router.get('/me', authenticateToken(), getMe)
router.patch('/me', authenticateToken(), getMe)

router.post('/me/register-buyer', validate(BuyerRegisterSchema))
router.post('/me/register-seller', validate(SellerRegisterSchema))

export default router;