import { SocketManager } from "../socket/SocketManager.js";

let socketManager;

export const initSocket = (httpServer) => {
  socketManager = new SocketManager(httpServer);
  return socketManager;
};

export const getIO = () => {
  if (!socketManager) {
    throw new Error("Socket.io not initialized!");
  }
  return socketManager.io;
};
