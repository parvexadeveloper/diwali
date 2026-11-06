import { NextResponse } from "next/server";
import { db } from "@/db";
import { spinEntries, shippingAddresses } from "@/db/schema";
import { eq } from "drizzle-orm";
import { rateLimit, clientIp } from "@/lib/auth";

const clean = (v: unknown, max = 200) => String(v ?? "").trim().slice(0, max);
export async function POST(req: Request) {
  if (!rateLimit(`ship:${clientIp(req)}`, 20, 60_000)) return NextResponse.json({ error: "Too many attempts." }, { status: 429 });
  const b = await req.json().catch(() => ({}));
  const spinEntryId = clean(b.spinEntryId, 60);
  const data = {
    fullName: clean(b.fullName, 120), email: clean(b.email, 160).toLowerCase(), phone: clean(b.phone, 20),
    addressLine1: clean(b.addressLine1, 250), addressLine2: clean(b.addressLine2, 250) || null,
    city: clean(b.city, 80), state: clean(b.state, 80), postalCode: clean(b.postalCode, 12), country: clean(b.country, 80) || "India",
  };
  if (!spinEntryId) return NextResponse.json({ error: "Missing spin entry. Please spin first." }, { status: 400 });
  if (!data.fullName || !data.email || !data.phone || !data.addressLine1 || !data.city || !data.state || !data.postalCode)
    return NextResponse.json({ error: "Please fill all required fields." }, { status: 400 });
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) return NextResponse.json({ error: "Enter a valid email address." }, { status: 400 });
  if (!/^[+\d][\d\s-]{7,16}$/.test(data.phone)) return NextResponse.json({ error: "Enter a valid phone number." }, { status: 400 });
  if (!/^\d{6}$/.test(data.postalCode) && data.country === "India") return NextResponse.json({ error: "Enter a valid 6-digit PIN code." }, { status: 400 });

  const [entry] = await db.select().from(spinEntries).where(eq(spinEntries.id, spinEntryId)).limit(1);
  if (!entry) return NextResponse.json({ error: "Spin entry not found. Please spin the wheel first." }, { status: 404 });
  if (entry.prizeType === "none") return NextResponse.json({ error: "This prize does not need shipping." }, { status: 400 });
  const existing = await db.select().from(shippingAddresses).where(eq(shippingAddresses.spinEntryId, spinEntryId)).limit(1);
  if (existing[0]) return NextResponse.json({ success: true, alreadySaved: true, address: existing[0] });

  const [addr] = await db.insert(shippingAddresses).values({ spinEntryId, ...data }).returning();
  return NextResponse.json({ success: true, address: addr });
}
export async function GET(req: Request) {
  const id = new URL(req.url).searchParams.get("spinEntryId");
  if (!id) return NextResponse.json({ address: null });
  const rows = await db.select().from(shippingAddresses).where(eq(shippingAddresses.spinEntryId, id)).limit(1);
  return NextResponse.json({ address: rows[0] || null });
}
