import { NextResponse } from "next/server";
import { db } from "@/db";
import { spinEntries, users } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { pickPrize } from "@/lib/prizes";
import { getOrReadSessionId } from "@/lib/auth";

// Unlimited spins: no IP rate limit, no per-session limit, no per-Instagram-profile limit.
export async function POST(req: Request) {
  let body: { referredBy?: string } = {};
  try { body = await req.json(); } catch {}

  const { sessionId, shouldSet } = await getOrReadSessionId(req);

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
    sessionId, instagramHandle: null, referredByUserId, prizeId: prize.id, prizeName: prize.name, prizeType: prize.type,
  }).returning();

  const res = NextResponse.json({ success: true, entry: { id: entry.id, prizeId: entry.prizeId, prizeName: entry.prizeName, prizeType: entry.prizeType, createdAt: entry.createdAt }, prize });
  if (shouldSet) res.cookies.set("diwali_session", shouldSet, { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", path: "/", maxAge: 60 * 60 * 24 * 30 });
  return res;
}

export async function GET(req: Request) {
  const { sessionId } = await getOrReadSessionId(req);
  const url = new URL(req.url); const sid = url.searchParams.get("sessionId");
  const target = sid || sessionId;
  const rows = await db.select().from(spinEntries).where(eq(spinEntries.sessionId, target)).orderBy(desc(spinEntries.createdAt)).limit(1);
  return NextResponse.json({ entry: rows[0] || null });
}
