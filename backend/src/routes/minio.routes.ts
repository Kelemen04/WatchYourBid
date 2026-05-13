import express from 'express';
import { createAuction } from '../controllers/auction.controller';
import { upload } from '../middlewares/minio.middleware';
import { registerBuyer, registerSeller } from '../controllers/user.controller';

const router = express.Router();

router.post('/auctions', upload.array("images"), createAuction);

router.post('/me/register-buyer', upload.single("image"), registerBuyer)
router.post('/me/register-seller', upload.single("image"), registerSeller)

export default router;