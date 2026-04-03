import { randomBytes, scryptSync, timingSafeEqual } from "crypto";

const KEY_LENGTH = 64;
const PREFIX = "scrypt";

export function hashPassword(password: string): string {
  const salt = randomBytes(16).toString("hex");
  const derivedKey = scryptSync(password, salt, KEY_LENGTH).toString("hex");
  return `${PREFIX}:${salt}:${derivedKey}`;
}

export function verifyPassword(password: string, storedHash: string): boolean {
  const [prefix, salt, expectedKey] = storedHash.split(":");
  if (prefix !== PREFIX || !salt || !expectedKey) {
    return false;
  }

  const actualKey = scryptSync(password, salt, KEY_LENGTH);
  const expectedBuffer = Buffer.from(expectedKey, "hex");

  if (actualKey.length !== expectedBuffer.length) {
    return false;
  }

  return timingSafeEqual(actualKey, expectedBuffer);
}
