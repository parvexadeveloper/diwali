export type Prize = { id: string; name: string; short: string; type: "physical" | "digital" | "none"; emoji: string; color: string; color2: string; textColor: string; weight: number; value: string; desc: string };
export const PRIZES: Prize[] = [
  { id: "gold-1g", name: "1 Gram Gold", short: "1g GOLD", type: "physical", emoji: "🥇", color: "#FDE68A", color2: "#D97706", textColor: "#451a03", weight: 4, value: "₹14,000 approx.", desc: "Certified 1 gram gold coin" },
  { id: "silver-1g", name: "15 Gram Silver", short: "15g SILVER", type: "physical", emoji: "🥈", color: "#F8FAFC", color2: "#94A3B8", textColor: "#0f172a", weight: 8, value: "₹15,000 approx.", desc: "Certified 15 gram silver coin" },
  { id: "diwali-gift", name: "Diwali Gift Box", short: "GIFT BOX", type: "physical", emoji: "🎁", color: "#C084FC", color2: "#6D28D9", textColor: "#ffffff", weight: 18, value: "₹999 hamper", desc: "Sweets, dry fruits & diyas hamper" },
  { id: "iphone-17", name: "iPhone 17", short: "iPHONE 17", type: "physical", emoji: "📱", color: "#22D3EE", color2: "#0E7490", textColor: "#ffffff", weight: 4, value: "GRAND PRIZE", desc: "Latest iPhone 17 — grand Diwali prize" },
  { id: "android-20k", name: "Android Phone ₹20K", short: "ANDROID ₹20K", type: "physical", emoji: "📲", color: "#FB7185", color2: "#BE185D", textColor: "#ffffff", weight: 10, value: "Worth ₹20,000", desc: "Android smartphone worth ₹20,000" },
];
export function pickPrize(): Prize {
  const eligiblePrizes = PRIZES.filter((p) => p.type !== "none");
  if (!eligiblePrizes.length) return PRIZES[0];
  const total = eligiblePrizes.reduce((s, p) => s + p.weight, 0);
  let r = Math.random() * total;
  for (const p of eligiblePrizes) { r -= p.weight; if (r <= 0) return p; }
  return eligiblePrizes[eligiblePrizes.length - 1];
}
export const getPrize = (id: string) => PRIZES.find((p) => p.id === id);
export function normalizeHandle(v: string) { return v.trim().replace(/^@/, "").toLowerCase(); }
export function validateHandle(v: string) { return /^[a-zA-Z0-9._]{2,30}$/.test(v) && !v.startsWith(".") && !v.endsWith("."); }
