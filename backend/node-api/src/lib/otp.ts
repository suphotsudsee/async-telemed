import { randomInt } from "crypto";

interface OtpRequest {
  requestId: string;
  thaiId: string;
  phone: string;
  code: string;
  createdAt: Date;
  expiresAt: Date;
}

// In-memory OTP store for demo (replace with Redis in production)
const otpStore = new Map<string, OtpRequest>();

const OTP_EXPIRY_SECONDS = 300; // 5 minutes
const OTP_LENGTH = 6;

function generateOtp(): string {
  let code = "";
  for (let i = 0; i < OTP_LENGTH; i++) {
    code += randomInt(0, 10).toString();
  }
  return code;
}

function normalizePhone(phone: string): string {
  // Remove non-digits
  return phone.replace(/\D/g, "");
}

function maskPhone(phone: string): string {
  const normalized = normalizePhone(phone);
  if (normalized.length < 4) return phone;
  const visible = normalized.slice(-4);
  return "xxx-xxx-" + visible;
}

export interface RequestOtpResult {
  requestId: string;
  expiresInSeconds: number;
  maskedPhone: string;
  code?: string; // Only returned in demo mode
}

export interface VerifyOtpResult {
  success: boolean;
  message: string;
}

/**
 * Request OTP for Thai ID verification
 * In production, integrate with SMS provider (Twilio, Thai SMS gateway, etc.)
 */
export async function requestOtp(thaiId: string, phone: string): Promise<RequestOtpResult> {
  const normalizedPhone = normalizePhone(phone);
  const code = generateOtp();
  const requestId = `otp-${Date.now()}-${randomInt(1000, 9999)}`;
  const now = new Date();
  const expiresAt = new Date(now.getTime() + OTP_EXPIRY_SECONDS * 1000);

  const otpRequest: OtpRequest = {
    requestId,
    thaiId,
    phone: normalizedPhone,
    code,
    createdAt: now,
    expiresAt
  };

  // Store OTP
  otpStore.set(requestId, otpRequest);

  // In demo mode, always return code for testing
  // In production, remove code from response and send via SMS
  const isDemo = process.env.OTP_MODE === "demo" || !process.env.SMS_PROVIDER_URL;

  if (!isDemo) {
    // Production: Send SMS
    try {
      await sendSms(normalizedPhone, `Your TeleMed verification code is: ${code}`);
    } catch (error) {
      console.error("Failed to send OTP SMS:", error);
      // Fall back to demo mode
      return {
        requestId,
        expiresInSeconds: OTP_EXPIRY_SECONDS,
        maskedPhone: maskPhone(normalizedPhone),
        code // Demo fallback
      };
    }
  }

  return {
    requestId,
    expiresInSeconds: OTP_EXPIRY_SECONDS,
    maskedPhone: maskPhone(normalizedPhone),
    ...(isDemo ? { code } : {}) // Only include code in demo mode
  };
}

/**
 * Verify OTP code
 */
export async function verifyOtp(thaiId: string, code: string): Promise<VerifyOtpResult> {
  // Find matching OTP request
  for (const [requestId, request] of otpStore.entries()) {
    if (request.thaiId === thaiId) {
      // Check if expired
      if (new Date() > request.expiresAt) {
        otpStore.delete(requestId);
        return {
          success: false,
          message: "OTP has expired. Please request a new one."
        };
      }

      // Check code match
      if (request.code === code) {
        otpStore.delete(requestId);
        return {
          success: true,
          message: "Verification successful."
        };
      }
    }
  }

  // Demo mode: accept "123456" for any Thai ID
  const isDemo = process.env.OTP_MODE === "demo" || !process.env.SMS_PROVIDER_URL;
  if (isDemo && code === "123456") {
    return {
      success: true,
      message: "Demo verification successful."
    };
  }

  return {
    success: false,
    message: "Invalid OTP code."
  };
}

/**
 * Clean up expired OTPs (call periodically)
 */
export function cleanupExpiredOtps(): number {
  const now = new Date();
  let cleaned = 0;

  for (const [requestId, request] of otpStore.entries()) {
    if (request.expiresAt < now) {
      otpStore.delete(requestId);
      cleaned++;
    }
  }

  return cleaned;
}

/**
 * Send SMS via configured provider
 */
async function sendSms(phone: string, message: string): Promise<void> {
  const providerUrl = process.env.SMS_PROVIDER_URL;
  const providerKey = process.env.SMS_PROVIDER_KEY;

  if (!providerUrl || !providerKey) {
    throw new Error("SMS provider not configured");
  }

  const response = await fetch(providerUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${providerKey}`
    },
    body: JSON.stringify({
      to: phone,
      message
    })
  });

  if (!response.ok) {
    throw new Error(`SMS provider error: ${response.status}`);
  }
}

// Periodic cleanup (every 5 minutes)
if (process.env.NODE_ENV !== "test") {
  setInterval(cleanupExpiredOtps, 5 * 60 * 1000);
}