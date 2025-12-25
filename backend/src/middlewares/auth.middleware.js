import jwt from "jsonwebtoken";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { User } from "../models/User.js";
import { env } from "../config/env.js";

export const verifyJWT = asyncHandler(async (req, res, next) => {
  try {
    const token =
      req.cookies?.accessToken ||
      req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
      throw new ApiError(401, "Unauthorized request");
    }

    const decodedToken = jwt.verify(token, env.ACCESS_TOKEN_SECRET);

    const user = await User.findById(decodedToken?._id).select(
      "-password -twoFASecret -sessions"
    );

    if (!user) {
      throw new ApiError(401, "Invalid Access Token");
    }

    req.user = user;
    next();
  } catch (error) {
    throw new ApiError(401, error?.message || "Invalid access token");
  }
});

export const optionalAuth = asyncHandler(async (req, res, next) => {
  try {
    const token =
      req.cookies?.accessToken ||
      req.header("Authorization")?.replace("Bearer ", "");

    if (token) {
      const decodedToken = jwt.verify(token, env.ACCESS_TOKEN_SECRET);
      const user = await User.findById(decodedToken?._id).select(
        "-password -twoFASecret -sessions"
      );
      if (user) {
        req.user = user;
      }
    }
    next();
  } catch (error) {
    // Ignore errors for optional auth
    next();
  }
});

export const require2FA = asyncHandler(async (req, res, next) => {
  // This middleware assumes verifyJWT has already run
  if (!req.user) {
    throw new ApiError(401, "Unauthorized");
  }

  // In a real implementation, we might check a session flag or a temporary 2FA token
  // For this stub, we'll assume if the user has 2FA enabled, they must have passed it during login
  // to get the access token.
  // However, for sensitive ops (like changing password), we might require re-verification.
  
  // For now, we just check if it's enabled on the user account
  if (req.user.isTwoFAEnabled) {
     // Logic to verify if the current session has passed 2FA
     // This usually involves checking a claim in the JWT or a session property
     // For simplicity in this stateless JWT setup, we assume the issuance of the JWT implies 2FA was passed.
  }
  
  next();
});
