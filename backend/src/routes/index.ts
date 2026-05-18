import express from 'express'
import user from './user.routes'
import auth from './auth.routes'
import auction from './auction.routes'
import bid from './bid.routes'
import review from './review.routes'
import transaction from './transaction.routes'

export const router = express.Router()

router.use("/user",user);
router.use("/auth",auth);
router.use("/auction",auction);
router.use("/auction/:id",bid);
router.use("/review",review);
router.use("/transaction",transaction);