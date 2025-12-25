import { Conversation } from "../models/Conversation.js";
import { User } from "../models/User.js";
import { ApiError } from "../utils/ApiError.js";

export const getUserConversations = async (userId) => {
  const conversations = await Conversation.find({
    "participants.userId": userId,
  })
    .sort({ updatedAt: -1 })
    .populate("participants.userId", "fullName username avatar isOnline lastSeen")
    .populate("lastMessage"); // We might not need full populate if we use snapshot

  return conversations;
};

export const createPrivateConversation = async (userId, targetUserId) => {
  if (userId === targetUserId) {
    throw new ApiError(400, "Cannot create chat with yourself");
  }

  // Check if exists
  const existing = await Conversation.findOne({
    type: "private",
    "participants.userId": { $all: [userId, targetUserId] },
  });

  if (existing) return existing;

  const conversation = await Conversation.create({
    type: "private",
    participants: [
      { userId, role: "member" },
      { userId: targetUserId, role: "member" },
    ],
    createdBy: userId,
  });

  return conversation;
};

export const createGroupConversation = async (userId, name, participantIds = []) => {
  const uniqueIds = [...new Set([userId, ...participantIds])];
  
  const participants = uniqueIds.map((id) => ({
    userId: id,
    role: id === userId ? "admin" : "member",
  }));

  const conversation = await Conversation.create({
    type: "group",
    groupName: name,
    participants,
    createdBy: userId,
  });

  return conversation;
};

export const addParticipant = async (chatId, adminId, newUserId) => {
  const conversation = await Conversation.findById(chatId);
  if (!conversation) throw new ApiError(404, "Chat not found");

  if (conversation.type !== "group") {
    throw new ApiError(400, "Cannot add participants to private chat");
  }

  // Check admin
  const admin = conversation.participants.find(
    (p) => p.userId.toString() === adminId.toString() && p.role === "admin"
  );
  if (!admin) throw new ApiError(403, "Only admins can add participants");

  // Check if already member
  const exists = conversation.participants.find(
    (p) => p.userId.toString() === newUserId.toString()
  );
  if (exists) throw new ApiError(400, "User already in group");

  conversation.participants.push({ userId: newUserId, role: "member" });
  await conversation.save();

  return conversation;
};

export const removeParticipant = async (chatId, adminId, targetUserId) => {
  const conversation = await Conversation.findById(chatId);
  if (!conversation) throw new ApiError(404, "Chat not found");

  if (conversation.type !== "group") {
    throw new ApiError(400, "Cannot remove participants from private chat");
  }

  // Check admin
  const admin = conversation.participants.find(
    (p) => p.userId.toString() === adminId.toString() && p.role === "admin"
  );
  if (!admin) throw new ApiError(403, "Only admins can remove participants");

  conversation.participants = conversation.participants.filter(
    (p) => p.userId.toString() !== targetUserId.toString()
  );
  await conversation.save();

  return conversation;
};

export const resetUnreadCount = async (chatId, userId) => {
  await Conversation.updateOne(
    { _id: chatId, "participants.userId": userId },
    { $set: { "participants.$.unreadCount": 0 } }
  );
};
