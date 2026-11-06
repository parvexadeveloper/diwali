import { NextResponse } from "next/server";
import { db } from "@/db";
import { spinEntries, users, shippingAddresses } from "@/db/schema";
import { count, ne, desc } from "drizzle-orm";
export const dynamic = "force-dynamic";
export async function GET() {
  try {
    const [s] = await db.select({ c: count() }).from(spinEntries);
    const [w] = await db.select({ c: count() }).from(spinEntries).where(ne(spinEntries.prizeType, "none"));
    const [u] = await db.select({ c: count() }).from(users);
    const [a] = await db.select({ c: count() }).from(shippingAddresses);
    const recent = await db.select({ prizeName: spinEntries.prizeName, prizeType: spinEntries.prizeType, instagramHandle: spinEntries.instagramHandle, createdAt: spinEntries.createdAt }).from(spinEntries).orderBy(desc(spinEntries.createdAt)).limit(8);
    return NextResponse.json({ totalSpins: Number(s?.c || 0), winners: Number(w?.c || 0), players: Number(u?.c || 0), orders: Number(a?.c || 0), recent: recent.map(r => ({ prizeName: r.prizeName, prizeType: r.prizeType, handle: r.instagramHandle ? `@${r.instagramHandle}` : "Guest player", createdAt: r.createdAt })) });
  } catch { return NextResponse.json({ totalSpins: 0, winners: 0, players: 0, orders: 0, recent: [] }); }
}
