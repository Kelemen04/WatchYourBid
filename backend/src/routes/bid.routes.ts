import express from "express";
import { authenticateToken,validate } from "../middlewares/auth.middleware";
import { AutoBidSchema, PlaceBidSchema, PlacePromotingBidSchema } from "../dto/bids.dto";
import { buyNow, placeAutoBid, placeBid, placePromotingBid } from "../controllers/bid.controller";

const router = express.Router({ mergeParams: true });

router.post('/bid',authenticateToken(),validate(PlaceBidSchema),placeBid);
router.post('/autobid',authenticateToken(),validate(AutoBidSchema),placeAutoBid);
router.post('/buy-now', authenticateToken(), buyNow);

export default router;