import bcrypt from "bcryptjs";
import crypto from "crypto";
import { cookies } from "next/headers";

const SECRET = () => process.env.AUTH_SECRET || "diwali-spin-win-dev-secret-change-in-production-32chars";
export const hashPassword = (p: string) => bcrypt.hash(p, 12);
export const verifyPassword = (p: string, h: string) => bcrypt.compare(p, h);

function sign(payload: string) { return crypto.createHmac("sha256", SECRET()).update(payload).digest("base64url"); }
export function createSessionToken(userId: string) {
  const payload = Buffer.from(JSON.stringify({ uid: userId, exp: Date.now() + 1000 * 60 * 60 * 24 * 30 })).toString("base64url");
  return `${payload}.${sign(payload)}`;
}
export function verifySessionToken(token?: string | null): string | null {
  if (!token) return null;
  const [payload, sig] = token.split(".");
  if (!payload || !sig || sign(payload) !== sig) return null;
  try { const d = JSON.parse(Buffer.from(payload, "base64url").toString()); if (d.exp < Date.now()) return null; return d.uid as string; } catch { return null; }
}
export async function getUserIdFromCookie() { const c = await cookies(); return verifySessionToken(c.get("diwali_auth")?.value); }
export async function setAuthCookie(userId: string) {
  const c = await cookies();
  c.set("diwali_auth", createSessionToken(userId), { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", path: "/", maxAge: 60 * 60 * 24 * 30 });
}
export async function clearAuthCookie() { const c = await cookies(); c.delete("diwali_auth"); }
export async function getSessionId(): Promise<string> {
  const c = await cookies(); let sid = c.get("diwali_session")?.value;
  if (!sid) { sid = crypto.randomUUID(); c.set("diwali_session", sid, { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", path: "/", maxAge: 60 * 60 * 24 * 30 }); }
  return sid;
}
export async function getOrReadSessionId(req: Request): Promise<{ sessionId: string; shouldSet: string | null }> {
  const cookie = req.headers.get("cookie") || "";
  const m = cookie.match(/diwali_session=([^;]+)/);
  if (m?.[1]) return { sessionId: decodeURIComponent(m[1]), shouldSet: null };
  const sid = crypto.randomUUID(); return { sessionId: sid, shouldSet: sid };
}
// simple in-memory rate limiter (per server instance; suitable for demo / Vercel edge warm instance)
const hits = new Map<string, number[]>();
export function rateLimit(key: string, limit = 20, windowMs = 60_000) {
  const now = Date.now(); const arr = (hits.get(key) || []).filter((t) => now - t < windowMs);
  arr.push(now); hits.set(key, arr); return arr.length <= limit;
}
export function clientIp(req: Request) { return req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown"; }

// ---- Admin panel auth (separate cookie from player sessions) ----
// Credentials come from env with a dev fallback of es / es@2312.
export const ADMIN_USERNAME = () => process.env.ADMIN_USERNAME || "es";
export const ADMIN_PASSWORD = () => process.env.ADMIN_PASSWORD || "es@2312";
export function checkAdminCreds(username: string, password: string) {
  return username === ADMIN_USERNAME() && password === ADMIN_PASSWORD();
}
export function createAdminToken() {
  const payload = Buffer.from(JSON.stringify({ adm: true, exp: Date.now() + 1000 * 60 * 60 * 8 })).toString("base64url");
  return `${payload}.${sign(payload)}`;
}
export function verifyAdminToken(token?: string | null): boolean {
  if (!token) return false;
  const [payload, sig] = token.split(".");
  if (!payload || !sig || sign(payload) !== sig) return false;
  try { const d = JSON.parse(Buffer.from(payload, "base64url").toString()); return d.adm === true && d.exp > Date.now(); } catch { return false; }
}
export async function isAdmin(): Promise<boolean> { const c = await cookies(); return verifyAdminToken(c.get("diwali_admin")?.value); }
export async function setAdminCookie() {
  const c = await cookies();
  c.set("diwali_admin", createAdminToken(), { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", path: "/", maxAge: 60 * 60 * 8 });
}
export async function clearAdminCookie() { const c = await cookies(); c.delete("diwali_admin"); }
