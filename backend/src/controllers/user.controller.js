import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { User } from "../models/User.js";
import { getIO } from "../loaders/socket.js";

const getAllUsers = asyncHandler(async (req, res) => {
  const users = await User.find({
    _id: { $ne: req.user._id }, 
  }).select("-password -sessions -twoFASecret");

  return res
    .status(200)
    .json(new ApiResponse(200, users, "Users fetched successfully"));
});

const updateProfile = asyncHandler(async (req, res) => {
  const { fullName, bio, status, avatar } = req.body;

  const user = await User.findByIdAndUpdate(
    req.user._id,
    {
      $set: {
        fullName,
      
        status,
        avatar
      },
    },
    { new: true }
  ).select("-password -sessions -twoFASecret");

  
  const io = getIO();
  io.emit("user:updated", user);

  return res
    .status(200)
    .json(new ApiResponse(200, user, "Profile updated successfully"));
});

const uploadAvatar = asyncHandler(async (req, res) => {
  if (!req.file) {
    throw new ApiError(400, "No file uploaded");
  }

  // Convert buffer to base64 data URI
  const b64 = Buffer.from(req.file.buffer).toString("base64");
  const dataURI = `data:${req.file.mimetype};base64,${b64}`;

  const user = await User.findByIdAndUpdate(
    req.user._id,
    {
      $set: {
        avatar: dataURI,
      },
    },
    { new: true }
  ).select("-password");

  const io = getIO();
  io.emit("user:updated", user);

  return res
    .status(200)
    .json(new ApiResponse(200, { user, avatar: dataURI }, "Avatar updated successfully"));
});

const updatePrivacy = asyncHandler(async (req, res) => {
  const { readReceipts, lastSeen } = req.body;

  const update = {};
  if (readReceipts !== undefined) update["privacy.readReceipts"] = readReceipts;
  if (lastSeen !== undefined) update["privacy.lastSeen"] = lastSeen;

  const user = await User.findByIdAndUpdate(
    req.user._id,
    { $set: update },
    { new: true }
  ).select("-password");

  return res
    .status(200)
    .json(new ApiResponse(200, user, "Privacy settings updated"));
});

const deleteAccount = asyncHandler(async (req, res) => {
  
  await User.findByIdAndDelete(req.user._id);
  
  
  
  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Account deleted successfully"));
});

export { getAllUsers, updateProfile, uploadAvatar, updatePrivacy, deleteAccount };
