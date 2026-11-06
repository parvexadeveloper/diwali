import { NextResponse } from "next/server";
import { db } from "@/db";
import { users, shareEvents, spinEntries } from "@/db/schema";
import { eq, count, sql } from "drizzle-orm";
import { getUserIdFromCookie } from "@/lib/auth";

export async function POST(req: Request) {
  const uid = await getUserIdFromCookie();
  if (!uid) return NextResponse.json({ error: "Please sign in first." }, { status: 401 });
  const b = await req.json().catch(() => ({}));
  const action = String(b.action || "share");
  const [user] = await db.select().from(users).where(eq(users.id, uid)).limit(1);
  if (!user) return NextResponse.json({ error: "User not found." }, { status: 404 });

  if (action === "share") {
    await db.insert(shareEvents).values({ userId: uid, channel: String(b.channel || "whatsapp").slice(0, 30) });
    await db.update(users).set({ shareCount: sql`${users.shareCount} + 1`, updatedAt: new Date() }).where(eq(users.id, uid));
    const [c] = await db.select({ c: count() }).from(shareEvents).where(eq(shareEvents.userId, uid));
    return NextResponse.json({ success: true, shareCount: Number(c?.c || 0) });
  }
  if (action === "confirm") {
    const [c] = await db.select({ c: count() }).from(shareEvents).where(eq(shareEvents.userId, uid));
    if (Number(c?.c || 0) < 1) return NextResponse.json({ error: "Please share your link on WhatsApp first, then confirm." }, { status: 400 });
    const [ref] = await db.select({ c: count() }).from(spinEntries).where(eq(spinEntries.referredByUserId, uid));
    const friendsPlayed = Number(ref?.c || 0);
    const ready = friendsPlayed >= 2;
    await db.update(users).set({ orderConfirmed: true, orderStatus: ready ? "READY_TO_DELIVER" : "CONFIRMED_WAITING_FRIENDS", updatedAt: new Date() }).where(eq(users.id, uid));
    return NextResponse.json({ success: true, orderConfirmed: true, friendsPlayed, ready, message: "Your order is confirmed once your two friends played this game we will deliver the product. Thanks for participating! 🪔 Happy Diwali!" });
  }
  return NextResponse.json({ error: "Invalid action" }, { status: 400 });
}
