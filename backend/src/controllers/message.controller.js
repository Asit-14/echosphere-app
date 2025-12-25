import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Message } from "../models/Message.js";
import { Conversation } from "../models/Conversation.js";
import { getIO } from "../loaders/socket.js";

const getMessages = asyncHandler(async (req, res) => {
  const { chatId } = req.params;
  const { page = 1, limit = 50 } = req.query;

  const conversation = await Conversation.findById(chatId);
  if (!conversation) {
    throw new ApiError(404, "Chat not found");
  }

  const isParticipant = conversation.participants.some(
    (p) => p.userId.toString() === req.user._id.toString()
  );

  if (!isParticipant) {
    throw new ApiError(403, "Not authorized to view this chat");
  }

  const messages = await Message.find({
    chatId,
    deletedFor: { $ne: req.user._id },
  })
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(parseInt(limit))
    .populate("sender", "fullName username avatar");

  const sortedMessages = messages.reverse();

  return res
    .status(200)
    .json(new ApiResponse(200, sortedMessages, "Messages fetched successfully"));
});

const deleteMessage = asyncHandler(async (req, res) => {
  const { messageId } = req.params;
  const { deleteForEveryone } = req.body; 

  const message = await Message.findById(messageId);
  if (!message) {
    throw new ApiError(404, "Message not found");
  }


  const isSender = message.sender.toString() === req.user._id.toString();

  if (deleteForEveryone) {
    if (!isSender) {
      throw new ApiError(403, "You can only delete your own messages for everyone");
    }

    message.isDeletedForEveryone = true;
    await message.save();

    const io = getIO();
    io.to(`chat:${message.chatId}`).emit("message:deleted", {
      messageId,
      chatId: message.chatId,
      type: "everyone"
    });

  } else {

    if (!message.deletedFor.includes(req.user._id)) {
      message.deletedFor.push(req.user._id);
      await message.save();
    }
    const io = getIO();
    io.to(`user:${req.user._id}`).emit("message:deleted", {
      messageId,
      chatId: message.chatId,
      type: "me"
    });
  }

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Message deleted successfully"));
});

const uploadAttachments = asyncHandler(async (req, res) => {
  if (!req.files || req.files.length === 0) {
    throw new ApiError(400, "No files uploaded");
  }

  const attachments = req.files.map((file) => ({
    url: `/uploads/${file.filename}`,
    mimeType: file.mimetype,
    size: file.size,
    fileName: file.originalname,
  }));

  return res
    .status(200)
    .json(new ApiResponse(200, { attachments }, "Files uploaded successfully"));
});

export { getMessages, deleteMessage, uploadAttachments };
