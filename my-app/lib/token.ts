import { randomBytes } from "crypto";

export function makeConfirmToken() {
  // 32 bytes -> base64url (43 chars), URL-safe
  return randomBytes(32).toString("base64url");
}

export function ttlHours(): number {
  const n = Number(process.env.CONFIRM_TTL_HOURS || 24);
  return Number.isFinite(n) && n > 0 ? n : 24;
}