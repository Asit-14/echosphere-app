import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Conversation } from "../models/Conversation.js";
import { User } from "../models/User.js";

const createOrGetDirectChat = asyncHandler(async (req, res) => {
  const { receiverId } = req.body;
  

  let conversation = await Conversation.findOne({
    type: "private",
    $and: [
      { "participants.userId": req.user._id },
      { "participants.userId": receiverId }
    ]
  }).populate("participants.userId", "fullName username avatar status");

  if (!conversation) {
    conversation = await Conversation.create({
      type: "private",
      participants: [
        { userId: req.user._id },
        { userId: receiverId }
      ]
    });
    
    conversation = await conversation.populate("participants.userId", "fullName username avatar status");
  }

  return res.status(200).json(
    new ApiResponse(200, conversation, "Chat retrieved successfully")
  );
});

const getConversations = asyncHandler(async (req, res) => {
  const conversations = await Conversation.find({
    "participants.userId": req.user._id
  })
  .populate("participants.userId", "fullName username avatar status")
  .populate("lastMessage")
  .sort({ updatedAt: -1 });

  return res.status(200).json(
    new ApiResponse(200, conversations, "Conversations fetched successfully")
  );
});

export { createOrGetDirectChat, getConversations };
