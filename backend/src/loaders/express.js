import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import mongoSanitize from "express-mongo-sanitize";
import { rateLimit } from "express-rate-limit";
import { v4 as uuidv4 } from "uuid";
import path from "path";
import { stream } from "../utils/logger.js";
import { env } from "../config/env.js";

const app = express();

// Static files
app.use('/uploads', express.static(path.join(process.cwd(), 'public/uploads')));
app.use(express.static("public"));

// Security & Request ID
app.use((req, res, next) => {
  req.id = uuidv4();
  res.setHeader("X-Request-ID", req.id);
  next();
});

app.use(helmet({
  contentSecurityPolicy: false, // Simplified for dev/demo; configure strictly in prod
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// CORS
const origin = env.CORS_ORIGIN.includes(",")
  ? env.CORS_ORIGIN.split(",").map((o) => o.trim())
  : env.CORS_ORIGIN;

app.use(cors({
  origin,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'device-id', 'ip']
}));

// Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 100,
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(limiter);

// Body Parsing & Sanitization
app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(cookieParser());
app.use(mongoSanitize());

// Logging
app.use(morgan(
  ':remote-addr - :remote-user [:date[clf]] ":method :url HTTP/:http-version" :status :res[content-length] - :response-time ms',
  { stream }
));

// HTTPS Redirect (Prod)
if (env.NODE_ENV === "production") {
  app.use((req, res, next) => {
    if (req.header("x-forwarded-proto") !== "https") {
      res.redirect(`https://${req.header("host")}${req.url}`);
    } else {
      next();
    }
  });
}

import { ApiError } from "../utils/ApiError.js";
import { errorHandler } from "../middlewares/errorHandler.js";

// Routes
import healthRouter from "../api/routes/health.routes.js";
import authRouter from "../routes/auth.routes.js";
import userRouter from "../routes/user.routes.js";
import chatRouter from "../routes/chat.routes.js";
import messageRouter from "../routes/message.routes.js";

// Root Route
app.get("/", (req, res) => {
  res.status(200).json({
    status: "success",
    message: "EchoSphere API is running",
    timestamp: new Date().toISOString()
  });
});

app.use("/api/health", healthRouter);
app.use("/api/v1/health", healthRouter);
app.use("/api/v1/auth", authRouter);
app.use("/api/v1/users", userRouter);
app.use("/api/v1/chats", chatRouter);
app.use("/api/v1/messages", messageRouter);

// 404 Handler
app.use((req, res, next) => {
  next(new ApiError(404, "Not Found"));
});

// Global Error Handler
app.use(errorHandler);

export { app };
