import * as MessageService from "../../services/message.service.js";
import { Message } from "../../models/Message.js";

export const messageHandler = (io, socket) => {
  const sendMessage = async (payload, callback) => {
    const { content, chatId, attachments, tempId, type, replyTo } = payload;

    try {
      // Use Service for business logic (validation, persistence, block checks)
      const newMessage = await MessageService.createMessage({
        chatId,
        senderId: socket.user._id,
        content,
        type: type || (attachments?.length ? 'image' : 'text'),
        attachments,
        replyTo
      });

      // Populate for client display
      const populatedMessage = await newMessage.populate(
        "sender",
        "fullName username avatar email"
      );

      // Broadcast to everyone in the room EXCEPT sender (sender gets ack)
      socket.to(`chat:${chatId}`).emit("message:receive", populatedMessage);

      // Ack to sender
      if (callback) {
        callback({
          status: "ok",
          tempId,
          messageId: newMessage._id,
          data: populatedMessage,
        });
      }
    } catch (error) {
      console.error("Message send error:", error);
      if (callback) callback({ status: "error", error: error.message });
    }
  };

  const markDelivered = async ({ messageId }) => {
    try {
      // TODO: Move to MessageService.markAsDelivered
      const message = await Message.findByIdAndUpdate(
        messageId,
        { $addToSet: { "status.delivered": socket.user._id } },
        { new: true }
      );

      if (message) {
        io.to(`user:${message.sender}`).emit("message:delivered", {
          messageId,
          userId: socket.user._id,
        });
      }
    } catch (error) {
      console.error("Mark delivered error:", error);
    }
  };

  const markRead = async ({ messageId }) => {
    try {
      // TODO: Move to MessageService.markAsRead
      const message = await Message.findByIdAndUpdate(
        messageId,
        { $addToSet: { "status.read": socket.user._id, "status.delivered": socket.user._id } },
        { new: true }
      );

      if (message) {
        io.to(`user:${message.sender}`).emit("message:read", {
          messageId,
          userId: socket.user._id,
        });
      }
    } catch (error) {
      console.error("Mark read error:", error);
    }
  };

  socket.on("message:send", sendMessage);
  socket.on("message:delivered", markDelivered);
  socket.on("message:read", markRead);
};
