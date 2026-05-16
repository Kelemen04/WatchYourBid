import express from "express"
import { authenticateToken, validate } from "../middlewares/auth.middleware";
import { verifyRoles } from "../middlewares/roleAuth.middleware";
import { confirmPayment, createCheckoutSession, getTransactionHistory, withdrawMoney } from "../controllers/transaction.controller";
import { UploadMoneySchema } from "../dto/transaction.dto";

const router = express.Router();

router.post('/create-checkout-session',authenticateToken(),validate(UploadMoneySchema), createCheckoutSession);
router.post('/confirm-payment', authenticateToken(), confirmPayment);
router.post('/withdraw', authenticateToken(), validate(UploadMoneySchema), withdrawMoney);
router.get('/history', authenticateToken(), getTransactionHistory);

export default router;