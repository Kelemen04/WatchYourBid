import express from "express"
import { authenticateToken, validate } from "../middlewares/auth.middleware";
import { confirmPayment, createCheckoutSession, getAllTransactionHistory, getTransactionHistory, withdrawMoney } from "../controllers/transaction.controller";
import { UploadMoneySchema } from "../dto/transaction.dto";
import { verifyRoles } from "../middlewares/roleAuth.middleware";

const router = express.Router();

router.post('/create-checkout-session',authenticateToken(),validate(UploadMoneySchema), createCheckoutSession);
router.post('/confirm-payment', authenticateToken(), confirmPayment);
router.post('/withdraw', authenticateToken(), validate(UploadMoneySchema), withdrawMoney);
router.get('/all', authenticateToken(), verifyRoles("ADMIN"), getAllTransactionHistory)

export default router;