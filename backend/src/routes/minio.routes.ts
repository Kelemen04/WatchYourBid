import express from 'express';
import { createAuction, uploadAuctionImages } from '../controllers/auction.controller';
import { upload } from '../middlewares/minio.middleware';
import { registerBuyer, registerSeller, uploadUserImage } from '../controllers/user.controller';
import { authenticateToken } from '../middlewares/auth.middleware';

const router = express.Router();

router.post('/auction/:id/upload',authenticateToken(), upload.array("images"), uploadAuctionImages);

router.post('/me/upload-avatar', authenticateToken(), upload.single("image"), uploadUserImage)

export default router;