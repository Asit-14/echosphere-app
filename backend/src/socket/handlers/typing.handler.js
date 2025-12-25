export const typingHandler = (io, socket) => {
  const startTyping = (chatId) => {
    socket.to(`chat:${chatId}`).emit("typing:start", {
      chatId,
      userId: socket.user._id,
      username: socket.user.username,
    });
  };

  const stopTyping = (chatId) => {
    socket.to(`chat:${chatId}`).emit("typing:stop", {
      chatId,
      userId: socket.user._id,
    });
  };

  socket.on("typing:start", startTyping);
  socket.on("typing:stop", stopTyping);
};
