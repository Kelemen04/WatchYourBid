import express from 'express';
import { register, login, refresh, logout, verifyEmail, resendEmailVerification, forgotPassword, resetPassword } from '../controllers/auth.controller'
import { RegisterSchema , LoginSchema } from '../dto/auth.dto';
import { validate } from '../middlewares/auth.middleware';

const router = express.Router();

router.post('/register', validate(RegisterSchema), register);
router.post('/login', validate(LoginSchema), login);
router.post('/refresh', refresh)
router.post('/logout',logout)
router.get('/verify-email',verifyEmail)
router.post('/resend-email-verification',resendEmailVerification)
router.post('/forgot-password',forgotPassword)
router.post('/reset-password',resetPassword)

export default router;