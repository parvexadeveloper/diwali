import { NextResponse } from "next/server";
import { db } from "@/db";
import { spinEntries, users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { pickPrize, normalizeHandle, validateHandle } from "@/lib/prizes";
import { getOrReadSessionId, rateLimit, clientIp } from "@/lib/auth";

export async function POST(req: Request) {
  if (!rateLimit(`spin:${clientIp(req)}`, 12, 60_000)) return NextResponse.json({ error: "Too many attempts. Please wait a minute." }, { status: 429 });
  let body: { instagramHandle?: string; referredBy?: string } = {};
  try { body = await req.json(); } catch {}
  const handleRaw = (body.instagramHandle || "").trim();
  const handle = handleRaw ? normalizeHandle(handleRaw) : "";
  if (handle && !validateHandle(handle)) return NextResponse.json({ error: "Enter a valid Instagram username (letters, numbers, . or _ , 2–30 chars)." }, { status: 400 });

  const { sessionId, shouldSet } = await getOrReadSessionId(req);

  // One spin per browser/session — NO IP restriction as requested
  const bySession = await db.select().from(spinEntries).where(eq(spinEntries.sessionId, sessionId)).limit(1);
  //if (bySession[0]) return NextResponse.json({ error: "You have already spun the wheel in this browser. One spin per profile!", alreadySpun: true, entry: bySession[0] }, { status: 409 });
/*
  // One spin per Instagram profile
  if (handle) {
    const existing = await db.select().from(spinEntries).where(eq(spinEntries.instagramHandle, handle)).limit(1);
    if (existing[0]) return NextResponse.json({ error: `@${handle} has already played. Only one spin per Instagram profile!`, alreadySpun: true }, { status: 409 });
    const existingUser = await db.select().from(users).where(eq(users.instagramHandle, handle)).limit(1);
    if (existingUser[0]) return NextResponse.json({ error: `@${handle} has already played. Only one spin per Instagram profile!`, alreadySpun: true }, { status: 409 });
  }
*/
  // Resolve referrer (link contains id of the user who shared)
  let referredByUserId: string | null = null;
  const ref = (body.referredBy || "").trim();
  if (ref) {
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(ref);
    const found = isUuid
      ? await db.select().from(users).where(eq(users.id, ref)).limit(1)
      : await db.select().from(users).where(eq(users.referralCode, ref)).limit(1);
    if (found[0]) referredByUserId = found[0].id;
  }

  const prize = pickPrize(); // SERVER-SIDE ONLY — never trust client
  const [entry] = await db.insert(spinEntries).values({
    sessionId, instagramHandle: handle || null, referredByUserId, prizeId: prize.id, prizeName: prize.name, prizeType: prize.type,
  }).returning();

  const res = NextResponse.json({ success: true, entry: { id: entry.id, prizeId: entry.prizeId, prizeName: entry.prizeName, prizeType: entry.prizeType, createdAt: entry.createdAt }, prize });
  if (shouldSet) res.cookies.set("diwali_session", shouldSet, { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", path: "/", maxAge: 60 * 60 * 24 * 30 });
  return res;
}

export async function GET(req: Request) {
  const { sessionId } = await getOrReadSessionId(req);
  const url = new URL(req.url); const sid = url.searchParams.get("sessionId");
  const target = sid || sessionId;
  const rows = await db.select().from(spinEntries).where(eq(spinEntries.sessionId, target)).limit(1);
  return NextResponse.json({ entry: rows[0] || null });
}
