import express from 'express';
import { getMe, updateMe, registerBuyer, registerSeller, deleteMe, getUserById, uploadUserImage } from '../controllers/user.controller'
import { BuyerRegisterSchema , SellerRegisterSchema } from '../dto/user.dto';
import { authenticateToken, validate } from '../middlewares/auth.middleware';
import { verifyRoles } from '../middlewares/roleAuth.middleware';
import { validateId } from '../middlewares/auction.middleware';
import { upload } from '../middlewares/minio.middleware';

const router = express.Router();

router.get('/me', authenticateToken(), verifyRoles("USER"), getMe)
router.patch('/me', authenticateToken(), verifyRoles("USER"), updateMe)
router.delete('/me', authenticateToken(), deleteMe)

router.post('/me/register-buyer', authenticateToken(), upload.single("image"), validate(BuyerRegisterSchema), verifyRoles("USER"), registerBuyer)
router.post('/me/register-seller', authenticateToken(), upload.single("image"), validate(SellerRegisterSchema), verifyRoles("USER"), registerSeller)

router.post('/me/avatar', authenticateToken(), upload.single("image"), uploadUserImage)

router.get('/:id',validateId, getUserById)

export default router;