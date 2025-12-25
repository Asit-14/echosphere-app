import { rateLimit } from "express-rate-limit";

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 20, // Limit each IP to 20 requests per `window` (here, per 15 minutes) for auth routes
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: "Too many login attempts from this IP, please try again after 15 minutes",
});
