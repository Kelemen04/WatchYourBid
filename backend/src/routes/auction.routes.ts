import express from "express";
import { authenticateToken,validate } from "../middlewares/auth.middleware";
import { CreateAuctionSchema, UpdateAuctionSchema } from "../dto/auction.dto";
import { createAuction, deleteAuction, getAuctionByCategory, getAuctionByFilters, getAuctionById, getHomeAuctions, updateAuction } from "../controllers/auction.controller";
import { incrementClick, validateCategory, validateId } from "../middlewares/auction.middleware";

const router = express.Router();

router.post('/',authenticateToken,validate(CreateAuctionSchema),createAuction);
router.put('/:id',authenticateToken,validate(UpdateAuctionSchema),validateId, updateAuction);
router.delete('/:id',authenticateToken,validateId,deleteAuction);

router.get('/', getAuctionByFilters)
router.get('/home', getHomeAuctions)
router.get('/:id',validateId,incrementClick,getAuctionById);
router.get('/category/:categoryName',validateCategory,getAuctionByCategory);

export default router;