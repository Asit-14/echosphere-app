import { Router } from "express";
import {
  loginUser,
  logoutUser,
  registerUser,
  refreshAccessToken,
  getCurrentUser,
  setup2FA,
  verify2FA,
  disable2FA,
} from "../controllers/auth.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { authLimiter } from "../middlewares/rateLimiter.js";

const router = Router();

router.route("/register").post(authLimiter, registerUser);
router.route("/login").post(authLimiter, loginUser);

// Secured routes
router.route("/logout").post(verifyJWT, logoutUser);
router.route("/refresh-token").post(refreshAccessToken); // Rate limit handled by general api limiter or specific one if needed
router.route("/me").get(verifyJWT, getCurrentUser);

// 2FA routes
router.route("/2fa/setup").post(verifyJWT, setup2FA);
router.route("/2fa/verify").post(verifyJWT, verify2FA);
router.route("/2fa/disable").post(verifyJWT, disable2FA);

export default router;
