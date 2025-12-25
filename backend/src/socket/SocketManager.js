import { Server } from "socket.io";
import { socketAuth } from "../middlewares/socketAuth.middleware.js";
import { chatHandler } from "./handlers/chat.handler.js";
import { messageHandler } from "./handlers/message.handler.js";
import { typingHandler } from "./handlers/typing.handler.js";
import { User } from "../models/User.js";
import { env } from "../config/env.js";

// import { createAdapter } from "@socket.io/redis-adapter";
// import { createClient } from "redis";

export class SocketManager {
  constructor(httpServer) {
    const origin = env.CORS_ORIGIN.includes(",")
      ? env.CORS_ORIGIN.split(",").map((o) => o.trim())
      : env.CORS_ORIGIN;

    this.io = new Server(httpServer, {
      cors: {
        origin,
        credentials: true,
      },
    });

    // Redis Adapter Setup (Commented for future scaling)
    /*
    const pubClient = createClient({ url: "redis://localhost:6379" });
    const subClient = pubClient.duplicate();
    Promise.all([pubClient.connect(), subClient.connect()]).then(() => {
      this.io.adapter(createAdapter(pubClient, subClient));
    });
    */

    // Middleware
    this.io.use(socketAuth);

    this.io.on("connection", this.handleConnection);
  }

  handleConnection = async (socket) => {
    const userId = socket.user._id;
    // console.log(`User connected: ${userId} (${socket.id})`);

    // 1. Update User Status
    await User.findByIdAndUpdate(userId, {
      isOnline: true,
      status: "online",
    });

    // 2. Join Personal Room
    socket.join(`user:${userId}`);

    // 3. Register Handlers
    chatHandler(this.io, socket);
    messageHandler(this.io, socket);
    typingHandler(this.io, socket);

    // 4. Handle Disconnect
    socket.on("disconnecting", () => {
      // Broadcast offline status to all rooms the user is part of (chats)
      for (const room of socket.rooms) {
        if (room !== socket.id && room.startsWith("chat:")) {
          socket.to(room).emit("presence:update", {
            userId,
            status: "offline",
            lastSeen: new Date(),
          });
        }
      }
    });

    socket.on("disconnect", async () => {
      // console.log(`User disconnected: ${userId}`);
      await User.findByIdAndUpdate(userId, {
        isOnline: false,
        status: "offline",
        lastSeen: new Date(),
      });
    });
  };
}
