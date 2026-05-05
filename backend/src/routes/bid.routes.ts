import express from "express";
import { authenticateToken,validate } from "../middlewares/auth.middleware";
import { AutoBidSchema, PlaceBidSchema } from "../dto/bids.dto";
import { placeAutoBid, placeBid } from "../controllers/bid.controller";

const router = express.Router({ mergeParams: true });

router.post('/bid',authenticateToken(),validate(PlaceBidSchema),placeBid);
router.post('/autobid',authenticateToken(),validate(AutoBidSchema),placeAutoBid);

export default router;