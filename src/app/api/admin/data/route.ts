import { NextResponse } from "next/server";
import { db } from "@/db";
import { users, spinEntries, shippingAddresses } from "@/db/schema";
import { desc } from "drizzle-orm";
import { isAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  if (!(await isAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const [allUsers, allSpins, allAddresses] = await Promise.all([
    db.select().from(users).orderBy(desc(users.createdAt)),
    db.select().from(spinEntries).orderBy(desc(spinEntries.createdAt)),
    db.select().from(shippingAddresses),
  ]);

  const addrBySpin = new Map(allAddresses.map(a => [a.spinEntryId, a]));
  const friendsByUser = new Map<string, number>();
  for (const s of allSpins) {
    if (s.referredByUserId) friendsByUser.set(s.referredByUserId, (friendsByUser.get(s.referredByUserId) || 0) + 1);
  }

  const players = allUsers.map(u => {
    const spin = u.spinEntryId ? allSpins.find(s => s.id === u.spinEntryId) : null;
    const addr = u.spinEntryId ? addrBySpin.get(u.spinEntryId) : null;
    const friendsPlayed = friendsByUser.get(u.id) || 0;
    return {
      id: u.id,
      username: u.instagramHandle,
      email: u.email,
      referralCode: u.referralCode,
      prizeId: spin?.prizeId || null,
      prizeName: spin?.prizeName || null,
      prizeType: spin?.prizeType || null,
      address: addr ? { fullName: addr.fullName, phone: addr.phone, line1: addr.addressLine1, line2: addr.addressLine2, city: addr.city, state: addr.state, postalCode: addr.postalCode, country: addr.country, email: addr.email } : null,
      friendsPlayed,
      shareCount: u.shareCount,
      orderConfirmed: u.orderConfirmed,
      orderStatus: friendsPlayed >= 2 ? "READY_TO_DELIVER" : u.orderStatus,
      createdAt: u.createdAt,
    };
  });

  const spins = allSpins.map(s => ({
    id: s.id,
    username: s.instagramHandle || null,
    prizeId: s.prizeId,
    prizeName: s.prizeName,
    prizeType: s.prizeType,
    createdAt: s.createdAt,
  }));

  const stats = {
    totalSpins: allSpins.length,
    winners: allSpins.filter(s => s.prizeType !== "none").length,
    players: allUsers.length,
    orders: allAddresses.length,
  };

  return NextResponse.json({ stats, players, spins });
}
