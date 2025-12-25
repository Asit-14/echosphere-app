import { Message } from "../models/Message.js";
import { Conversation } from "../models/Conversation.js";
import { User } from "../models/User.js";
import { ApiError } from "../utils/ApiError.js";

export const createMessage = async ({
  chatId,
  senderId,
  content,
  type = "text",
  attachments = [],
  replyTo = null,
}) => {
  // 0. Spam Heuristic (Mock)
  // In a real system, we would analyze metadata or rate of messages
  if (attachments.length > 10) {
    throw new ApiError(400, "Too many attachments (Spam detected)");
  }

  const conversation = await Conversation.findById(chatId);
  if (!conversation) {
    throw new ApiError(404, "Conversation not found");
  }

  // Verify sender is participant
  const isParticipant = conversation.participants.some(
    (p) => p.userId.toString() === senderId.toString()
  );
  if (!isParticipant) {
    throw new ApiError(403, "Sender is not a participant of this conversation");
  }

  // 1. Block Check
  // If private chat, check if sender is blocked by the other user
  if (conversation.type === "private") {
    const otherParticipant = conversation.participants.find(
      (p) => p.userId.toString() !== senderId.toString()
    );
    
    if (otherParticipant) {
      const targetUser = await User.findById(otherParticipant.userId).select("blockedUsers");
      if (targetUser?.blockedUsers?.includes(senderId)) {
        throw new ApiError(403, "You are blocked by this user");
      }
    }
  }

  // TODO: Message Queue Hook
  // Offload heavy tasks like link previews, media processing, or push notifications
  // await messageQueue.add('processMessage', { chatId, senderId, ... });

  const message = await Message.create({
    chatId,
    sender: senderId,
    content,
    type,
    attachments,
    replyTo,
    status: {
      delivered: [],
      read: [],
    },
  });

  // Update conversation last message and increment unread counts for others
  const updateOps = {
    lastMessage: message._id,
    lastMessageSnapshot: {
      content,
      sender: senderId,
      createdAt: message.createdAt,
    },
  };

  // Increment unread count for all participants except sender
  // Note: This is a simple increment. In a high-scale system, we might use a separate Unread model or Redis.
  // For now, we update the array in place.
  // We can't easily use $inc on array elements by condition in one go without arrayFilters (which is fine).
  
  await Conversation.updateOne(
    { _id: chatId },
    {
      $set: updateOps,
      $inc: { "participants.$[elem].unreadCount": 1 },
    },
    {
      arrayFilters: [{ "elem.userId": { $ne: senderId } }],
    }
  );

  return message;
};

export const listMessages = async ({
  chatId,
  userId,
  limit = 20,
  cursor = null, // cursor is the createdAt timestamp of the last item
}) => {
  // Ensure user is participant
  const conversation = await Conversation.findOne({
    _id: chatId,
    "participants.userId": userId,
  });

  if (!conversation) {
    throw new ApiError(403, "Access denied");
  }

  const query = {
    chatId,
    deletedFor: { $ne: userId }, // Don't show messages deleted for this user
    isDeletedForEveryone: false,
  };

  if (cursor) {
    query.createdAt = { $lt: new Date(cursor) };
  }

  const messages = await Message.find(query)
    .sort({ createdAt: -1 })
    .limit(parseInt(limit))
    .populate("sender", "fullName username avatar")
    .populate("replyTo", "sender content type"); // Populate reply info

  // Check if there are more
  const nextCursor =
    messages.length === parseInt(limit)
      ? messages[messages.length - 1].createdAt
      : null;

  return {
    messages: messages.reverse(), // Return in chronological order for UI
    nextCursor,
  };
};

export const markMessageDelivered = async (messageId, userId) => {
  return await Message.findByIdAndUpdate(
    messageId,
    { $addToSet: { "status.delivered": userId } },
    { new: true }
  );
};

export const markMessageRead = async (messageId, userId) => {
  return await Message.findByIdAndUpdate(
    messageId,
    { $addToSet: { "status.read": userId, "status.delivered": userId } },
    { new: true }
  );
};

export const deleteMessageForUser = async (messageId, userId) => {
  return await Message.findByIdAndUpdate(
    messageId,
    { $addToSet: { deletedFor: userId } },
    { new: true }
  );
};

export const deleteMessageForEveryone = async (messageId, userId) => {
  const message = await Message.findById(messageId);
  if (!message) throw new ApiError(404, "Message not found");

  if (message.sender.toString() !== userId.toString()) {
    throw new ApiError(403, "You can only delete your own messages");
  }

  // Check time limit (e.g., 15 mins) if needed
  // const timeDiff = Date.now() - message.createdAt;
  // if (timeDiff > 15 * 60 * 1000) throw new ApiError(400, "Too late to delete");

  message.isDeletedForEveryone = true;
  message.content = ""; // Clear content
  message.attachments = [];
  return await message.save();
};
