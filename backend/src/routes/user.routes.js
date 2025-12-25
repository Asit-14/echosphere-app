import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { uploadMemory } from "../middlewares/upload.middleware.js";
import { 
  getAllUsers, 
  updateProfile, 
  uploadAvatar, 
  updatePrivacy,
  deleteAccount
} from "../controllers/user.controller.js";

const router = Router();

router.use(verifyJWT);

router.route("/").get(getAllUsers);
router.route("/profile").put(updateProfile);
router.route("/avatar").post(uploadMemory.single("avatar"), uploadAvatar);
router.route("/privacy").put(updatePrivacy);
router.route("/account").delete(deleteAccount);

export default router;
