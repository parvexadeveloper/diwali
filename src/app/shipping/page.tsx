"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Header, Footer, Steps } from "@/components/Chrome";
import { PRIZES } from "@/lib/prizes";

export default function ShippingPage() {
  const router = useRouter();
  const [entry, setEntry] = useState<{ id: string; prizeId: string; prizeName: string; prizeType: string } | null>(null);
  const [form, setForm] = useState({ fullName: "", email: "", phone: "", addressLine1: "", addressLine2: "", city: "", state: "", postalCode: "", country: "India" });
  const [error, setError] = useState(""); const [loading, setLoading] = useState(false); const [checking, setChecking] = useState(true);
  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));
  const prize = PRIZES.find(p => p.id === entry?.prizeId);

  useEffect(() => {
    try { const e = JSON.parse(localStorage.getItem("diwali_entry") || "null"); if (e?.id) { setEntry(e); const h = localStorage.getItem("diwali_handle") || ""; void h; } } catch {}
    setChecking(false);
  }, []);

  async function submit(e: React.FormEvent) {
    e.preventDefault(); setError("");
    if (!entry) { setError("No winning spin found on this browser. Please spin first."); return; }
    if (!form.fullName.trim() || !form.email.trim() || !form.phone.trim() || !form.addressLine1.trim() || !form.city.trim() || !form.state.trim() || !form.postalCode.trim()) { setError("Please fill all required fields marked *."); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) { setError("Enter a valid email address — we will send delivery updates there."); return; }
    if (!/^\d{6}$/.test(form.postalCode) && form.country === "India") { setError("Enter a valid 6-digit PIN code."); return; }
    setLoading(true);
    try {
      const res = await fetch("/api/shipping", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ spinEntryId: entry.id, ...form }) });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Could not save address."); setLoading(false); return; }
      localStorage.setItem("diwali_shipping_email", form.email);
      router.push("/account");
    } catch { setError("Network error. Please try again."); setLoading(false); }
  }

  const inputCls = "w-full bg-[#12002b] border border-white/15 rounded-xl px-3.5 py-3 text-sm font-medium placeholder:text-white/30 focus:border-amber-300";
  const labelCls = "block text-[11px] font-black tracking-wider text-amber-200/90 mb-1.5";

  return (<div className="min-h-screen bg-[#1a0533] bg-[radial-gradient(ellipse_at_top,#4c1d95,#1a0533_65%)]">
    <Header /><main className="max-w-xl mx-auto px-4 pb-10"><Steps current={2} />
      {checking ? <p className="text-center text-white/50 py-10">Loading your prize… 🪔</p> : !entry ? (
        <div className="bg-white/[0.07] border border-white/12 rounded-3xl p-6 text-center mt-4"><div className="text-5xl">🎡</div><h1 className="font-black text-xl mt-2">Spin First!</h1><p className="text-sm text-white/60 mt-1">You need to spin the wheel and win a gift before adding a delivery address.</p><Link href="/" className="inline-block mt-4 bg-amber-400 text-[#2a0a00] font-black px-5 py-3 rounded-full text-sm">✨ Go to Spin Page →</Link></div>
      ) : (<>
        <div className="text-center bg-gradient-to-b from-amber-400/20 to-transparent border border-amber-300/30 rounded-3xl p-5 mt-2 animate-pop">
          <div className="text-5xl">{prize?.emoji || "🎁"}</div>
          <p className="text-amber-300 font-black tracking-widest text-xs mt-1">🎉 CONGRATULATIONS!</p>
          <h1 className="text-2xl font-black">You won: {entry.prizeName}</h1>
          <p className="text-xs text-white/60 mt-1">{prize?.desc} • {prize?.value} • Free home delivery after friend-share confirmation</p>
        </div>
        <form onSubmit={submit} className="bg-white/[0.07] backdrop-blur border border-white/12 rounded-3xl p-5 mt-4 space-y-4 shadow-2xl">
          <h2 className="font-black">📦 Delivery Address</h2>
          <div><label className={labelCls}>FULL NAME *</label><input className={inputCls} placeholder="e.g. Priya Sharma" value={form.fullName} onChange={e => set("fullName", e.target.value)} required /></div>
          <div className="grid sm:grid-cols-2 gap-3">
            <div><label className={labelCls}>EMAIL ID *</label><input type="email" className={inputCls} placeholder="you@example.com" value={form.email} onChange={e => set("email", e.target.value)} required /></div>
            <div><label className={labelCls}>PHONE NUMBER *</label><input className={inputCls} placeholder="+91 98765 43210" value={form.phone} onChange={e => set("phone", e.target.value)} required /></div>
          </div>
          <div><label className={labelCls}>ADDRESS LINE 1 *</label><input className={inputCls} placeholder="House no, street, area" value={form.addressLine1} onChange={e => set("addressLine1", e.target.value)} required /></div>
          <div><label className={labelCls}>ADDRESS LINE 2</label><input className={inputCls} placeholder="Landmark (optional)" value={form.addressLine2} onChange={e => set("addressLine2", e.target.value)} /></div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className={labelCls}>CITY *</label><input className={inputCls} placeholder="Mumbai" value={form.city} onChange={e => set("city", e.target.value)} required /></div>
            <div><label className={labelCls}>STATE *</label><input className={inputCls} placeholder="Maharashtra" value={form.state} onChange={e => set("state", e.target.value)} required /></div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className={labelCls}>POSTAL / PIN CODE *</label><input className={inputCls} placeholder="400001" inputMode="numeric" maxLength={10} value={form.postalCode} onChange={e => set("postalCode", e.target.value)} required /></div>
            <div><label className={labelCls}>COUNTRY *</label><select className={inputCls} value={form.country} onChange={e => set("country", e.target.value)}><option>India</option><option>United Arab Emirates</option><option>Singapore</option><option>United States</option><option>United Kingdom</option><option>Other</option></select></div>
          </div>
          {error && <div className="bg-red-500/15 border border-red-400/40 text-red-200 text-xs font-semibold rounded-xl px-3 py-2.5">⚠️ {error}</div>}
          <button disabled={loading} className="w-full bg-gradient-to-r from-amber-400 via-orange-500 to-pink-600 disabled:opacity-60 font-black py-4 rounded-2xl text-white shadow-lg">{loading ? "Saving… 🔒" : "Save Address & Continue →"}</button>
          <p className="text-[11px] text-white/40 text-center">🔒 Validated & saved securely on our server. Duplicate submissions are automatically prevented.</p>
        </form>
      </>)}
    </main><Footer /></div>);
}
