import { Router } from "express";
import {
  getSubscribedChannels,
  toggleSubscription,
  getUserChannelSubscribers,
} from "../controllers/subscription.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.use(verifyJWT); // Apply verifyJWT middleware to all routes in this file

router.route("/").post(toggleSubscription).get(getSubscribedChannels);
router.route("/my-subscriber").get(getUserChannelSubscribers);

export default router;
