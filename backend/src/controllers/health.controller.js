import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import mongoose from "mongoose";

const checkHealth = asyncHandler(async (req, res) => {
  const dbStatus = mongoose.connection.readyState;
  const statusMapping = {
    0: "disconnected",
    1: "connected",
    2: "connecting",
    3: "disconnecting",
  };

  const healthData = {
    status: "ok",
    timestamp: new Date(),
    services: {
      database: {
        status: statusMapping[dbStatus] || "unknown",
      },
      server: {
        uptime: process.uptime(),
        memoryUsage: process.memoryUsage(),
      },
    },
  };

  if (dbStatus !== 1) {
    healthData.status = "error";
    return res
      .status(503)
      .json(new ApiResponse(503, healthData, "Service Unavailable"));
  }

  return res
    .status(200)
    .json(new ApiResponse(200, healthData, "System is healthy"));
});

export { checkHealth };
