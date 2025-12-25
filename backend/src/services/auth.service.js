import { User } from "../models/User.js";
import { ApiError } from "../utils/ApiError.js";
import speakeasy from "speakeasy";
import qrcode from "qrcode";
import crypto from "crypto";

export const generateAccessAndRefreshTokens = async (userId, sessionData = {}) => {
  const user = await User.findById(userId);
  const accessToken = user.generateAccessToken();
  const refreshToken = user.generateRefreshToken();

  // Hash the refresh token for storage
  const refreshTokenHash = crypto
    .createHash("sha256")
    .update(refreshToken)
    .digest("hex");

  // Calculate expiry date for the session (7 days from now)
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

  // Add to user sessions
  user.sessions.push({
    refreshTokenHash,
    expiresAt,
    ...sessionData,
  });

  await user.save({ validateBeforeSave: false });

  return { accessToken, refreshToken };
};

export const registerUser = async ({ email, username, password, fullName, ip, deviceId }) => {
  const existedUser = await User.findOne({
    $or: [{ username }, { email }],
  });

  if (existedUser) {
    throw new ApiError(409, "User with email or username already exists");
  }

  const user = await User.create({
    fullName,
    email,
    password,
    username: username.toLowerCase(),
  });

  const createdUser = await User.findById(user._id).select(
    "-password -sessions -twoFASecret"
  );

  if (!createdUser) {
    throw new ApiError(500, "Something went wrong while registering the user");
  }

  const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(
    user._id,
    { ip, deviceId }
  );

  return { user: createdUser, accessToken, refreshToken };
};

export const loginUser = async ({ email, username, password, otp, ip, deviceId }) => {
  if (!username && !email) {
    throw new ApiError(400, "Username or email is required");
  }

  const user = await User.findOne({
    $or: [{ username }, { email }],
  }).select("+twoFASecret");

  if (!user) {
    throw new ApiError(404, "User does not exist");
  }

  const isPasswordValid = await user.isPasswordCorrect(password);

  if (!isPasswordValid) {
    throw new ApiError(401, "Invalid user credentials");
  }

  // 2FA Check
  if (user.isTwoFAEnabled) {
    if (!otp) {
      throw new ApiError(403, "2FA code required", ["2FA_REQUIRED"]);
    }

    const verified = speakeasy.totp.verify({
      secret: user.twoFASecret,
      encoding: "base32",
      token: otp,
    });

    if (!verified) {
      throw new ApiError(401, "Invalid 2FA code");
    }
  }

  const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(
    user._id,
    { ip, deviceId }
  );

  const loggedInUser = await User.findById(user._id).select(
    "-password -sessions -twoFASecret"
  );

  return { user: loggedInUser, accessToken, refreshToken };
};

export const logoutUser = async (userId, refreshToken) => {
  if (!refreshToken) return;

  const refreshTokenHash = crypto
    .createHash("sha256")
    .update(refreshToken)
    .digest("hex");

  await User.findByIdAndUpdate(
    userId,
    {
      $pull: {
        sessions: { refreshTokenHash: refreshTokenHash },
      },
    },
    { new: true }
  );
};

export const refreshAccessToken = async (incomingRefreshToken, ip, deviceId) => {
  if (!incomingRefreshToken) {
    throw new ApiError(401, "Unauthorized request");
  }

  const incomingTokenHash = crypto
    .createHash("sha256")
    .update(incomingRefreshToken)
    .digest("hex");

  const user = await User.findOne({
    "sessions.refreshTokenHash": incomingTokenHash,
  });

  if (!user) {
    throw new ApiError(401, "Invalid refresh token");
  }

  // Find the specific session
  const session = user.sessions.find(
    (s) => s.refreshTokenHash === incomingTokenHash
  );

  if (!session) {
    throw new ApiError(401, "Session not found");
  }

  // Check expiry
  if (new Date() > session.expiresAt) {
    // Remove expired session
    user.sessions = user.sessions.filter(
      (s) => s.refreshTokenHash !== incomingTokenHash
    );
    await user.save({ validateBeforeSave: false });
    throw new ApiError(401, "Refresh token expired");
  }

  // Rotate tokens
  // Remove old session
  user.sessions = user.sessions.filter(
    (s) => s.refreshTokenHash !== incomingTokenHash
  );
  
  // Generate new tokens and session
  const accessToken = user.generateAccessToken();
  const newRefreshToken = user.generateRefreshToken();
  const newRefreshTokenHash = crypto
    .createHash("sha256")
    .update(newRefreshToken)
    .digest("hex");
    
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

  user.sessions.push({
    refreshTokenHash: newRefreshTokenHash,
    expiresAt,
    ip: ip || session.ip,
    deviceId: deviceId || session.deviceId,
  });

  await user.save({ validateBeforeSave: false });

  return { accessToken, refreshToken: newRefreshToken };
};

export const generate2FASecret = async (userId) => {
  const user = await User.findById(userId);
  
  if (user.isTwoFAEnabled) {
    throw new ApiError(400, "2FA is already enabled");
  }

  const secret = speakeasy.generateSecret({
    name: `ChatApp:${user.email}`,
  });

  // Temporarily store secret or just return it? 
  // Usually we don't save it to the user model until they verify it.
  // But for simplicity, we can return it and client sends it back with the code to verify.
  // OR we save it but keep isTwoFAEnabled = false until verified.
  
  user.twoFASecret = secret.base32;
  await user.save({ validateBeforeSave: false });

  const qrCodeUrl = await qrcode.toDataURL(secret.otpauth_url);

  return { secret: secret.base32, qrCodeUrl };
};

export const verifyAndEnable2FA = async (userId, token) => {
  const user = await User.findById(userId).select("+twoFASecret");
  
  if (!user.twoFASecret) {
    throw new ApiError(400, "2FA setup not initiated");
  }

  const verified = speakeasy.totp.verify({
    secret: user.twoFASecret,
    encoding: "base32",
    token: token,
  });

  if (verified) {
    user.isTwoFAEnabled = true;
    await user.save({ validateBeforeSave: false });
    return true;
  } else {
    return false;
  }
};

export const disable2FA = async (userId, password) => {
    const user = await User.findById(userId);
    const isPasswordValid = await user.isPasswordCorrect(password);
    
    if (!isPasswordValid) {
        throw new ApiError(401, "Invalid password");
    }

    user.isTwoFAEnabled = false;
    user.twoFASecret = undefined;
    await user.save({ validateBeforeSave: false });
    return true;
}
