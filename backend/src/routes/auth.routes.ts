import express from 'express';
import { register, login } from '../controllers/auth.controller'
import { RegisterSchema , LoginSchema } from '../dto/auth.dto';
import { validate } from '../middlewares/auth.middleware';

const router = express.Router();

router.post('/register', validate(RegisterSchema), register);
router.post('/login', validate(LoginSchema), login);

export default router;