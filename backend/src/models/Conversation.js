import mongoose, { Schema } from "mongoose";

const participantSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    role: {
      type: String,
      enum: ["admin", "member"],
      default: "member",
    },
    unreadCount: {
      type: Number,
      default: 0,
    },
    joinedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false }
);

const conversationSchema = new Schema(
  {
    type: {
      type: String,
      enum: ["private", "group"],
      default: "private",
    },
    participants: [participantSchema],
    lastMessage: {
      type: Schema.Types.ObjectId,
      ref: "Message",
    },
    // Snapshot of last message for list view preview (encrypted)
    lastMessageSnapshot: {
      content: String,
      sender: { type: Schema.Types.ObjectId, ref: "User" },
      createdAt: Date,
    },
    groupName: {
      type: String,
      trim: true,
    },
    groupAvatar: {
      type: String,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  }
);

// Index to find private chats between two users quickly
conversationSchema.index({ "participants.userId": 1 });

export const Conversation = mongoose.model("Conversation", conversationSchema);
