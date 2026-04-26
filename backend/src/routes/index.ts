import express from 'express'
import user from './user.routes'
import auth from './auth.routes'
import auction from './auction.routes'

export const router = express.Router()

router.use("/users",user);
router.use("/auth",auth);
router.use("/auction",auction);