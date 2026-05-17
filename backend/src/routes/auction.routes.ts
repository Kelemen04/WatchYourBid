import express from "express";
import { authenticateToken,validate } from "../middlewares/auth.middleware";
import { CreateAuctionSchema, UpdateAuctionSchema } from "../dto/auction.dto";
import { addToWatchList, createAuction, deleteAuction, deleteAuctionFromWatchList, getAuctionByCategory, getAuctionByFilters, getAuctionById, getHomeAuctions, getUserAuctions, getWatchList, updateAuction, uploadAuctionImages } from "../controllers/auction.controller";
import { incrementClick, validateCategory, validateId } from "../middlewares/auction.middleware";
import { ReviewSchema } from "../dto/review.dto";
import { createReview } from "../controllers/review.controller";
import { PlacePromotingBidSchema } from "../dto/bids.dto";
import { placePromotingBid } from "../controllers/bid.controller";
import { upload } from "../middlewares/minio.middleware";

const router = express.Router();

router.post('/',authenticateToken(),validate(CreateAuctionSchema),createAuction);
router.put('/:id',authenticateToken(),validate(UpdateAuctionSchema),validateId, updateAuction);

router.get('/auctions/me', authenticateToken(), getUserAuctions);

router.get('/', getAuctionByFilters)
router.get('/home', getHomeAuctions)
router.get('/watchlist', authenticateToken(), getWatchList)
router.get('/:id',validateId,incrementClick,getAuctionById);
router.get('/category/:categoryName',validateCategory,getAuctionByCategory);
router.delete('/watchlist/:id', authenticateToken(), deleteAuctionFromWatchList)
router.delete('/:id',authenticateToken(),validateId,deleteAuction);
router.post('/watchlist', authenticateToken(), addToWatchList)

router.post('/:id/upload', authenticateToken(), upload.array("images"), uploadAuctionImages);

router.post('/:id/review/',authenticateToken(), validate(ReviewSchema),createReview);

router.post('/:id/promote',authenticateToken(),validate(PlacePromotingBidSchema),placePromotingBid);

export default router;