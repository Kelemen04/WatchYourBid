import express from 'express';
import { register, login, refresh, logout } from '../controllers/auth.controller'
import { RegisterSchema , LoginSchema } from '../dto/auth.dto';
import { validate } from '../middlewares/auth.middleware';

const router = express.Router();

router.post('/register', validate(RegisterSchema), register);
router.post('/login', validate(LoginSchema), login);
router.post('/refresh', refresh)
router.post('/logout',logout)

export default router;