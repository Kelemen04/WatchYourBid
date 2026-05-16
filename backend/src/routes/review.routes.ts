import express from "express"
import { authenticateToken, validate } from "../middlewares/auth.middleware";
import { ReviewSchema } from "../dto/review.dto";
import { verifyRoles } from "../middlewares/roleAuth.middleware";
import { createReview, deleteReview } from "../controllers/review.controller";

const router = express.Router();

router.delete('/:id',authenticateToken(), verifyRoles("MODERATOR"), deleteReview);

export default router;