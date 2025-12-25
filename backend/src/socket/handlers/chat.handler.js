export const chatHandler = (io, socket) => {
  const joinChat = (chatId) => {
    socket.join(`chat:${chatId}`);
    // console.log(`User ${socket.user._id} joined chat ${chatId}`);
  };

  const leaveChat = (chatId) => {
    socket.leave(`chat:${chatId}`);
    // console.log(`User ${socket.user._id} left chat ${chatId}`);
  };

  socket.on("chat:join", joinChat);
  socket.on("chat:leave", leaveChat);
};
