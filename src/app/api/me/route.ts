import { NextResponse } from "next/server";
import { db } from "@/db";
import { users, spinEntries, shippingAddresses, shareEvents } from "@/db/schema";
import { eq, count } from "drizzle-orm";
import { getUserIdFromCookie } from "@/lib/auth";
import { getPrize } from "@/lib/prizes";

export async function GET() {
  const uid = await getUserIdFromCookie();
  if (!uid) return NextResponse.json({ user: null }, { status: 401 });
  const [user] = await db.select().from(users).where(eq(users.id, uid)).limit(1);
  if (!user) return NextResponse.json({ user: null }, { status: 401 });
  let prize = null, address = null;
  if (user.spinEntryId) {
    const [e] = await db.select().from(spinEntries).where(eq(spinEntries.id, user.spinEntryId)).limit(1);
    if (e) prize = { ...getPrize(e.prizeId), prizeId: e.prizeId, prizeName: e.prizeName, prizeType: e.prizeType, entryId: e.id, createdAt: e.createdAt };
    const [a] = await db.select().from(shippingAddresses).where(eq(shippingAddresses.spinEntryId, user.spinEntryId)).limit(1);
    if (a) address = a;
  }
  const [refCount] = await db.select({ c: count() }).from(spinEntries).where(eq(spinEntries.referredByUserId, user.id));
  const [shareC] = await db.select({ c: count() }).from(shareEvents).where(eq(shareEvents.userId, user.id));
  const friendsPlayed = Number(refCount?.c || 0);
  const orderReady = friendsPlayed >= 2;
  return NextResponse.json({
    user: { id: user.id, email: user.email, instagramHandle: user.instagramHandle, referralCode: user.referralCode, spinEntryId: user.spinEntryId, orderConfirmed: user.orderConfirmed, orderStatus: orderReady ? "READY_TO_DELIVER" : user.orderStatus, shareCount: Number(shareC?.c || user.shareCount || 0), createdAt: user.createdAt },
    prize, address, friendsPlayed, friendsNeeded: 2, orderReady,
  });
}
