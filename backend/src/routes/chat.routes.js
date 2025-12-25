import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { createOrGetDirectChat, getConversations } from "../controllers/chat.controller.js";

const router = Router();

router.use(verifyJWT);

router.route("/").get(getConversations);
router.route("/c").post(createOrGetDirectChat);

export default router;
