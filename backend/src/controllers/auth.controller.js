import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import * as authService from "../services/auth.service.js";
import { env } from "../config/env.js";

const options = {
  httpOnly: true,
  secure: env.NODE_ENV === "production",
  sameSite: env.NODE_ENV === "production" ? "None" : "Lax",
};

const registerUser = asyncHandler(async (req, res) => {
  const { fullName, email, username, password } = req.body;
  const ip = req.ip;
  const deviceId = req.headers["user-agent"];

  console.log("Register Request:", { fullName, email, username, ip });

  if ([fullName, email, username, password].some((field) => !field || field.trim() === "")) {
    throw new ApiError(400, "All fields are required");
  }

  const { user, accessToken, refreshToken } = await authService.registerUser({
    fullName,
    email,
    username,
    password,
    ip,
    deviceId,
  });

  return res
    .status(201)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(new ApiResponse(200, { user, accessToken, refreshToken }, "User registered successfully"));
});

const loginUser = asyncHandler(async (req, res) => {
  const { email, username, password, otp } = req.body;
  const ip = req.ip;
  const deviceId = req.headers["user-agent"]; 

  const { user, accessToken, refreshToken } = await authService.loginUser({
    email,
    username,
    password,
    otp,
    ip,
    deviceId,
  });

  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(
        200,
        {
          user,
          accessToken,
          refreshToken,
        },
        "User logged in successfully"
      )
    );
});

const logoutUser = asyncHandler(async (req, res) => {
  await authService.logoutUser(
    req.user._id,
    req.cookies?.refreshToken || req.body.refreshToken
  );

  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "User logged out"));
});

const refreshAccessToken = asyncHandler(async (req, res) => {
  const incomingRefreshToken =
    req.cookies.refreshToken || req.body.refreshToken;
  const ip = req.ip;
  const deviceId = req.headers["user-agent"];

  const { accessToken, refreshToken } = await authService.refreshAccessToken(
    incomingRefreshToken,
    ip,
    deviceId
  );

  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(
        200,
        { accessToken, refreshToken },
        "Access token refreshed"
      )
    );
});

const setup2FA = asyncHandler(async (req, res) => {
  const { secret, qrCodeUrl } = await authService.generate2FASecret(req.user._id);

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { secret, qrCodeUrl },
        "2FA secret generated. Scan QR code and verify."
      )
    );
});

const verify2FA = asyncHandler(async (req, res) => {
  const { token } = req.body;
  
  if (!token) {
      throw new ApiError(400, "Token is required");
  }

  const isVerified = await authService.verifyAndEnable2FA(req.user._id, token);

  if (!isVerified) {
    throw new ApiError(400, "Invalid 2FA token");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "2FA enabled successfully"));
});

const disable2FA = asyncHandler(async (req, res) => {
    const { password } = req.body;
    if (!password) {
        throw new ApiError(400, "Password is required to disable 2FA");
    }

    await authService.disable2FA(req.user._id, password);

    return res.status(200).json(new ApiResponse(200, {}, "2FA disabled successfully"));
});

const getCurrentUser = asyncHandler(async (req, res) => {
  return res
    .status(200)
    .json(new ApiResponse(200, req.user, "Current user fetched successfully"));
});

const handleOAuthCallback = asyncHandler(async (req, res) => {
  const user = req.user;
  const ip = req.ip;
  const deviceId = req.headers["user-agent"];

  const { accessToken, refreshToken } = await authService.generateAccessAndRefreshTokens(
    user._id,
    { ip, deviceId }
  );

  // Redirect to frontend with tokens
  // In production, consider using a secure cookie or a temporary code exchange
  const redirectUrl = `${env.CLIENT_URL}/auth/callback?accessToken=${accessToken}&refreshToken=${refreshToken}`;
  
  res.redirect(redirectUrl);
});

export {
  registerUser,
  loginUser,
  logoutUser,
  refreshAccessToken,
  setup2FA,
  verify2FA,
  disable2FA,
  getCurrentUser,
  handleOAuthCallback,
};
