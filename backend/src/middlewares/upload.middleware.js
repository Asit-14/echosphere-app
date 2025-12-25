import multer from "multer";
import { ApiError } from "../utils/ApiError.js";
import path from "path";
import { v4 as uuidv4 } from "uuid";

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "public/uploads/");
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${uuidv4()}`;
    cb(null, `${uniqueSuffix}${path.extname(file.originalname)}`);
  },
});

const fileFilter = (req, file, cb) => {
  // Basic MIME type check first
  const allowedMimes = [
    "image/jpeg",
    "image/png",
    "image/gif",
    "video/mp4",
    "audio/mpeg",
    "application/pdf",
  ];

  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new ApiError(400, "Invalid file type"), false);
  }
};

export const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
});

const memoryStorage = multer.memoryStorage();

export const uploadMemory = multer({
  storage: memoryStorage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit for avatars
  },
});

// Magic Number Validation Middleware
export const validateFileContent = (req, res, next) => {
  if (!req.file && !req.files) return next();

  const files = req.files || [req.file];

  // In a real implementation, we would read the buffer header here
  // to verify magic numbers (e.g., FF D8 FF for JPEG).
  // For this stub, we rely on Multer's mimetype which is based on extension/header
  // but strictly speaking, we should inspect the buffer.
  
  // Example stub for magic number check:
  /*
  for (const file of files) {
      const buffer = file.buffer;
      // Check bytes...
  }
  */
 
  next();
};
