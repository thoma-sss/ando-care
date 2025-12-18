import crypto from "crypto";

const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 16;
const AUTH_TAG_LENGTH = 16;

/**
 * Encrypts a string using AES-256-GCM
 * @param text - The plaintext to encrypt
 * @param key - Base64 encoded 32-byte key
 * @returns Encrypted string in format: iv:authTag:encryptedData (all hex encoded)
 */
export function encrypt(text: string, key?: string): string {
  const encryptionKey = key || process.env.APP_ENCRYPTION_KEY;
  
  if (!encryptionKey) {
    throw new Error("APP_ENCRYPTION_KEY environment variable is required");
  }

  const keyBuffer = Buffer.from(encryptionKey, "base64");
  
  if (keyBuffer.length !== 32) {
    throw new Error("Encryption key must be 32 bytes (256 bits)");
  }

  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, keyBuffer, iv);
  
  let encrypted = cipher.update(text, "utf8", "hex");
  encrypted += cipher.final("hex");
  
  const authTag = cipher.getAuthTag();
  
  return `${iv.toString("hex")}:${authTag.toString("hex")}:${encrypted}`;
}

/**
 * Decrypts a string that was encrypted with encrypt()
 * @param encryptedData - The encrypted string in format: iv:authTag:encryptedData
 * @param key - Base64 encoded 32-byte key
 * @returns Decrypted plaintext string
 */
export function decrypt(encryptedData: string, key?: string): string {
  const encryptionKey = key || process.env.APP_ENCRYPTION_KEY;
  
  if (!encryptionKey) {
    throw new Error("APP_ENCRYPTION_KEY environment variable is required");
  }

  const keyBuffer = Buffer.from(encryptionKey, "base64");
  
  if (keyBuffer.length !== 32) {
    throw new Error("Encryption key must be 32 bytes (256 bits)");
  }

  const [ivHex, authTagHex, encryptedHex] = encryptedData.split(":");
  
  if (!ivHex || !authTagHex || !encryptedHex) {
    throw new Error("Invalid encrypted data format");
  }

  const iv = Buffer.from(ivHex, "hex");
  const authTag = Buffer.from(authTagHex, "hex");
  
  const decipher = crypto.createDecipheriv(ALGORITHM, keyBuffer, iv);
  decipher.setAuthTag(authTag);
  
  let decrypted = decipher.update(encryptedHex, "hex", "utf8");
  decrypted += decipher.final("utf8");
  
  return decrypted;
}

/**
 * Generates a new random encryption key
 * @returns Base64 encoded 32-byte key
 */
export function generateEncryptionKey(): string {
  return crypto.randomBytes(32).toString("base64");
}

