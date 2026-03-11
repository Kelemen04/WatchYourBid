import express from 'express';
import { register, login, getMe, refresh } from '../controllers/auth.controller'
import { RegisterSchema , LoginSchema } from '../dto/auth.dto';
import { authenticateToken, validate } from '../middlewares/auth.middleware';

const router = express.Router();

router.post('/register', validate(RegisterSchema), register);
router.post('/login', validate(LoginSchema), login);
router.post('/refresh', refresh)
router.post('/me', authenticateToken(), getMe)

export default router;