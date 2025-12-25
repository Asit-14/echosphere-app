import crypto from "crypto";

// Mock S3 Service
export const uploadToCloud = async (file) => {
  // Simulate upload delay
  await new Promise((resolve) => setTimeout(resolve, 500));

  // Generate a mock URL
  const fileHash = crypto.randomBytes(16).toString("hex");
  const extension = file.originalname.split(".").pop();
  const fileName = `${fileHash}.${extension}`;
  
  // In production, this would be an S3 URL or CloudFront URL
  // For local dev, we might serve from a static folder or just return a mock
  const url = `https://mock-storage.echosphere.com/${fileName}`;

  return {
    url,
    key: fileName,
    bucket: "echosphere-uploads",
  };
};

export const getSignedUrl = (key) => {
    // Mock signed URL generation
    return `https://mock-storage.echosphere.com/${key}?token=mock-signed-token`;
}
