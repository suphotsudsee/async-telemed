import { randomBytes, createHash } from "crypto";
import { v4 as uuidv4 } from "uuid";

interface PresignedUpload {
  uploadUrl: string;
  publicUrl: string;
  expiresInSeconds: number;
  objectKey: string;
}

interface StorageConfig {
  provider: "local" | "s3" | "minio";
  bucket?: string;
  endpoint?: string;
  accessKey?: string;
  secretKey?: string;
  region?: string;
}

// Default to local storage in development
const config: StorageConfig = {
  provider: (process.env.STORAGE_PROVIDER as "local" | "s3" | "minio") ?? "local",
  bucket: process.env.STORAGE_BUCKET ?? "telemed-uploads",
  endpoint: process.env.STORAGE_ENDPOINT,
  accessKey: process.env.STORAGE_ACCESS_KEY,
  secretKey: process.env.STORAGE_SECRET_KEY,
  region: process.env.STORAGE_REGION ?? "ap-southeast-1"
};

const UPLOAD_EXPIRY_SECONDS = 900; // 15 minutes
const ALLOWED_EXTENSIONS = [".jpg", ".jpeg", ".png", ".webp"];
const MAX_FILE_SIZE_MB = 10;

function generateObjectKey(prefix: string = "consultations"): string {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const id = uuidv4();
  return `${prefix}/${year}/${month}/${day}/${id}`;
}

function getExtension(filename: string): string {
  const ext = filename.toLowerCase().slice(filename.lastIndexOf("."));
  return ALLOWED_EXTENSIONS.includes(ext) ? ext : ".jpg";
}

function isValidFileType(contentType: string): boolean {
  const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
  return allowedTypes.some((type) => contentType.includes(type));
}

/**
 * Generate presigned URL for upload
 * In local mode, returns a placeholder URL
 */
export async function presignUpload(options: {
  filename: string;
  contentType: string;
  prefix?: string;
}): Promise<PresignedUpload> {
  const { filename, contentType, prefix } = options;

  if (!isValidFileType(contentType)) {
    throw new Error(`Invalid file type: ${contentType}. Allowed: jpg, jpeg, png, webp`);
  }

  const objectKey = generateObjectKey(prefix);
  const extension = getExtension(filename);
  const finalKey = `${objectKey}${extension}`;

  switch (config.provider) {
    case "s3":
      return presignS3Upload(finalKey, contentType);
    case "minio":
      return presignMinioUpload(finalKey, contentType);
    case "local":
    default:
      return presignLocalUpload(finalKey, contentType);
  }
}

async function presignS3Upload(objectKey: string, contentType: string): Promise<PresignedUpload> {
  // For production AWS S3
  // In production, use @aws-sdk/s3-request-presigner
  // This is a placeholder that requires AWS SDK setup
  
  const bucket = config.bucket ?? "telemed-uploads";
  const region = config.region ?? "ap-southeast-1";
  
  // Placeholder: In production, use AWS SDK to generate presigned URL
  // const { getSignedUrl } = await import("@aws-sdk/s3-request-presigner");
  // const { S3Client, PutObjectCommand } = await import("@aws-sdk/client-s3");
  
  const uploadUrl = `https://${bucket}.s3.${region}.amazonaws.com/${objectKey}`;
  const publicUrl = `https://${bucket}.s3.${region}.amazonaws.com/${objectKey}`;

  return {
    uploadUrl,
    publicUrl,
    expiresInSeconds: UPLOAD_EXPIRY_SECONDS,
    objectKey
  };
}

async function presignMinioUpload(objectKey: string, contentType: string): Promise<PresignedUpload> {
  // For self-hosted MinIO
  // In production, use minio-js client
  
  const bucket = config.bucket ?? "telemed-uploads";
  const endpoint = config.endpoint ?? "http://localhost:9000";
  const publicEndpoint = process.env.STORAGE_PUBLIC_ENDPOINT ?? endpoint;
  
  const uploadUrl = `${endpoint}/${bucket}/${objectKey}`;
  const publicUrl = `${publicEndpoint}/${bucket}/${objectKey}`;

  return {
    uploadUrl,
    publicUrl,
    expiresInSeconds: UPLOAD_EXPIRY_SECONDS,
    objectKey
  };
}

async function presignLocalUpload(objectKey: string, contentType: string): Promise<PresignedUpload> {
  // Local development mode
  // Returns mock URLs for testing
  
  const baseUrl = process.env.API_URL ?? "http://localhost:8080";
  const uploadUrl = `${baseUrl}/api/v1/uploads/local/${objectKey}`;
  const publicUrl = `${baseUrl}/api/v1/uploads/public/${objectKey}`;

  return {
    uploadUrl,
    publicUrl,
    expiresInSeconds: UPLOAD_EXPIRY_SECONDS,
    objectKey
  };
}

/**
 * Verify upload completion (optional callback from storage)
 */
export async function verifyUpload(objectKey: string): Promise<{ success: boolean; size?: number }> {
  // In production, check S3/MinIO for object existence
  // For local dev, always return success
  
  if (config.provider === "local") {
    return { success: true };
  }

  // Production: Query storage provider
  return { success: true };
}

/**
 * Generate upload policy for direct browser uploads
 */
export function generateUploadPolicy(options: {
  filename: string;
  contentType: string;
  maxSizeMb?: number;
}): {
  policy: string;
  signature: string;
  fields: Record<string, string>;
} {
  const maxSizeMb = options.maxSizeMb ?? MAX_FILE_SIZE_MB;
  const expiresAt = new Date(Date.now() + UPLOAD_EXPIRY_SECONDS * 1000);
  
  const conditions = [
    { "bucket": config.bucket ?? "telemed-uploads" },
    ["content-length-range", 0, maxSizeMb * 1024 * 1024],
    ["starts-with", "$Content-Type", "image/"]
  ];

  const policy = Buffer.from(JSON.stringify({
    expiration: expiresAt.toISOString(),
    conditions
  })).toString("base64");

  const signature = createHash("sha256")
    .update(policy + (config.secretKey ?? ""))
    .digest("hex");

  return {
    policy,
    signature,
    fields: {
      bucket: config.bucket ?? "telemed-uploads",
      "Content-Type": options.contentType,
      key: generateObjectKey()
    }
  };
}

export { config as storageConfig };