import { createServer } from "http";
import connectDB from "./loaders/db.js";
import { app } from "./loaders/express.js";
import { initSocket, getIO } from "./loaders/socket.js";
import { logger } from "./utils/logger.js";
import { env } from "./config/env.js";

const httpServer = createServer(app);

// Initialize Socket.IO
initSocket(httpServer);

connectDB()
  .then(() => {
    httpServer.listen(env.PORT, () => {
      logger.info(`⚙️ Server is running at port : ${env.PORT}`);
    });
  })
  .catch((err) => {
    logger.error("MONGO db connection failed !!! ", err);
    process.exit(1);
  });

// Graceful Shutdown
const gracefulShutdown = () => {
  logger.info("Received kill signal, shutting down gracefully");
  
  httpServer.close(() => {
    logger.info("Closed out remaining HTTP connections");
    
    // Close Socket.IO
    try {
        const io = getIO();
        io.close(() => {
            logger.info("Socket.IO server closed");
        });
    } catch (e) {
        // Socket might not be initialized
    }

    // Close Database
    mongoose.connection.close(false, () => {
      logger.info("MongoDB connection closed");
      process.exit(0);
    });
  });

  setTimeout(() => {
    logger.error("Could not close connections in time, forcefully shutting down");
    process.exit(1);
  }, 10000);
};

process.on("SIGTERM", gracefulShutdown);
process.on("SIGINT", gracefulShutdown);
