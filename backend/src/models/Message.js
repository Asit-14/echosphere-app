import mongoose, { Schema } from "mongoose";

const messageSchema = new Schema(
  {
    chatId: {
      type: Schema.Types.ObjectId,
      ref: "Conversation",
      required: true,
      index: true,
    },
    sender: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ["text", "image", "video", "audio", "file"],
      default: "text",
    },
    attachments: [
      {
        url: String,
        mimeType: String,
        size: Number,
        fileName: String,
      },
    ],
    replyTo: {
      type: Schema.Types.ObjectId,
      ref: "Message",
      default: null,
    },
    reactions: [
      {
        userId: { type: Schema.Types.ObjectId, ref: "User" },
        emoji: String,
      },
    ],
    status: {
      delivered: [
        {
          type: Schema.Types.ObjectId,
          ref: "User",
        },
      ],
      read: [
        {
          type: Schema.Types.ObjectId,
          ref: "User",
        },
      ],
    },
    deletedFor: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    isDeletedForEveryone: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for cursor-based pagination
messageSchema.index({ chatId: 1, createdAt: -1, _id: -1 });

export const Message = mongoose.model("Message", messageSchema);
