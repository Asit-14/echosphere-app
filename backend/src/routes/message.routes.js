import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/upload.middleware.js";
import { getMessages, deleteMessage, uploadAttachments } from "../controllers/message.controller.js";

const router = Router();

router.use(verifyJWT);

router.route("/attachments").post(upload.array("files", 5), uploadAttachments);
router.route("/:chatId").get(getMessages);
router.route("/:messageId").delete(deleteMessage);

export default router;
