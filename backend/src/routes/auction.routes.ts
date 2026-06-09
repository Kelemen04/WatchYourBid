import express from "express";
import { authenticateToken,optionalAuthenticateToken,validate } from "../middlewares/auth.middleware";
import { CreateAuctionSchema, UpdateAuctionSchema } from "../dto/auction.dto";
import { addToWatchList, approveAuction, cancelAuctionByStaff, createAuction, deleteAuction, deleteAuctionFromWatchList, getAllAuctions, getAuctionByCategory, getAuctionByFilters, getAuctionById, getHomeAuctions, getPendingAuctions, getUserAuctions, getWatchList, updateAuction, uploadAuctionImages } from "../controllers/auction.controller";
import { incrementClick, validateCategory, validateId } from "../middlewares/auction.middleware";
import { ReviewSchema } from "../dto/review.dto";
import { createReview } from "../controllers/review.controller";
import { PlacePromotingBidSchema } from "../dto/bids.dto";
import { getAuctionBids, placePromotingBid } from "../controllers/bid.controller";
import { upload } from "../middlewares/minio.middleware";
import { verifyRoles } from "../middlewares/roleAuth.middleware";

const router = express.Router();

router.get('/pending', authenticateToken(), verifyRoles("MODERATOR"), getPendingAuctions);
router.post('/',authenticateToken(),validate(CreateAuctionSchema),createAuction);
router.put('/:id',authenticateToken(),validate(UpdateAuctionSchema),validateId, updateAuction);

router.get('/me', authenticateToken(), getUserAuctions);

router.get('/',optionalAuthenticateToken(), getAuctionByFilters)
router.get('/home',optionalAuthenticateToken(), getHomeAuctions)
router.get('/watchlist', authenticateToken(), getWatchList)
router.get('/all', authenticateToken(), verifyRoles("MODERATOR"), getAllAuctions);
router.get('/category/:categoryName',optionalAuthenticateToken(), validateCategory,getAuctionByCategory);
router.delete('/watchlist/:id', authenticateToken(), deleteAuctionFromWatchList)
router.delete('/:id',authenticateToken(),validateId,deleteAuction);
router.post('/watchlist', authenticateToken(), addToWatchList)

router.patch('/:id/approve', authenticateToken(), verifyRoles("MODERATOR"), approveAuction);
router.patch('/:id/cancel', authenticateToken(), verifyRoles("MODERATOR"), cancelAuctionByStaff);
router.post('/:id/upload', authenticateToken(), upload.array("images"), uploadAuctionImages);

router.post('/:id/review/',authenticateToken(), validate(ReviewSchema),createReview);

router.post('/:id/promote',authenticateToken(),validate(PlacePromotingBidSchema),placePromotingBid);

router.get('/:id',optionalAuthenticateToken(),validateId,incrementClick,getAuctionById);

export default router;