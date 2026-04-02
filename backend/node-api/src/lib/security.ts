import crypto from "node:crypto";

const IV_LENGTH = 16;

export function encryptField(value: string, keyHex: string): string {
  const iv = crypto.randomBytes(IV_LENGTH);
  const key = Buffer.from(keyHex, "hex");
  const cipher = crypto.createCipheriv("aes-256-gcm", key, iv);
  const encrypted = Buffer.concat([cipher.update(value, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return Buffer.concat([iv, tag, encrypted]).toString("base64");
}

export function decryptField(payload: string, keyHex: string): string {
  const input = Buffer.from(payload, "base64");
  const iv = input.subarray(0, IV_LENGTH);
  const tag = input.subarray(IV_LENGTH, IV_LENGTH + 16);
  const encrypted = input.subarray(IV_LENGTH + 16);
  const key = Buffer.from(keyHex, "hex");
  const decipher = crypto.createDecipheriv("aes-256-gcm", key, iv);
  decipher.setAuthTag(tag);
  return Buffer.concat([decipher.update(encrypted), decipher.final()]).toString("utf8");
}

export function sha256(value: string): string {
  return crypto.createHash("sha256").update(value).digest("hex");
}

