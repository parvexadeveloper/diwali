"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Header, Footer, Steps } from "@/components/Chrome";
import { PRIZES } from "@/lib/prizes";
import { useI18n } from "@/lib/i18n";

export default function ShippingPage() {
  const { t } = useI18n();
  const router = useRouter();
  const [entry, setEntry] = useState<{ id: string; prizeId: string; prizeName: string; prizeType: string } | null>(null);
  const [form, setForm] = useState({ fullName: "", email: "", phone: "", addressLine1: "", addressLine2: "", city: "Tenkasi", state: "Tamilnadu", postalCode: "123456", country: "India" });
  const [error, setError] = useState(""); const [loading, setLoading] = useState(false); const [checking, setChecking] = useState(true);
  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));
  const prize = PRIZES.find(p => p.id === entry?.prizeId);

  useEffect(() => {
    try { const e = JSON.parse(localStorage.getItem("diwali_entry") || "null"); if (e?.id) setEntry(e); } catch {}
    setChecking(false);
  }, []);

  async function submit(e: React.FormEvent) {
    e.preventDefault(); setError("");
    if (!entry) { setError(t("ship.err.noSpin")); return; }
    if (!form.fullName.trim() || !form.email.trim() || !form.phone.trim() || !form.addressLine1.trim() || !form.city.trim() || !form.state.trim() || !form.postalCode.trim()) { setError(t("ship.err.required")); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) { setError(t("ship.err.email")); return; }
    if (!/^\d{6}$/.test(form.postalCode) && form.country === "India") { setError(t("ship.err.pin")); return; }
    setLoading(true);
    try {
      const res = await fetch("/api/shipping", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ spinEntryId: entry.id, ...form }) });
      const data = await res.json();
      if (!res.ok) { setError(data.error || t("ship.err.save")); setLoading(false); return; }
      localStorage.setItem("diwali_shipping_email", form.email);
      router.push("/account");
    } catch { setError(t("ship.err.network")); setLoading(false); }
  }

  const inputCls = "w-full bg-[#12002b] border border-white/15 rounded-xl px-3.5 py-3 text-sm font-medium placeholder:text-white/30 focus:border-amber-300";
  const labelCls = "block text-[11px] font-black tracking-wider text-amber-200/90 mb-1.5";

  return (<div className="min-h-screen bg-[#1a0533] bg-[radial-gradient(ellipse_at_top,#4c1d95,#1a0533_65%)]">
    <Header /><main className="max-w-xl mx-auto px-4 pb-10"><Steps current={2} />
      {checking ? <p className="text-center text-white/50 py-10">{t("ship.loading")}</p> : !entry ? (
        <div className="bg-white/[0.07] border border-white/12 rounded-3xl p-6 text-center mt-4"><div className="text-5xl">🎡</div><h1 className="font-black text-xl mt-2">{t("ship.spinFirst.title")}</h1><p className="text-sm text-white/60 mt-1">{t("ship.spinFirst.desc")}</p><Link href="/" className="inline-block mt-4 bg-amber-400 text-[#2a0a00] font-black px-5 py-3 rounded-full text-sm">{t("ship.spinFirst.btn")}</Link></div>
      ) : (<>
        <div className="text-center bg-gradient-to-b from-amber-400/20 to-transparent border border-amber-300/30 rounded-3xl p-5 mt-2 animate-pop">
          <div className="text-5xl">{prize?.emoji || "🎁"}</div>
          <p className="text-amber-300 font-black tracking-widest text-xs mt-1">{t("ship.congrats")}</p>
          <h1 className="text-2xl font-black">{t("ship.youWon", { prize: prize ? t(`prize.${prize.id}.name`) : entry.prizeName })}</h1>
          <p className="text-xs text-white/60 mt-1">{prize ? t(`prize.${prize.id}.desc`) : ""} • {prize ? t(`prize.${prize.id}.value`) : ""} • {t("ship.subline")}</p>
        </div>
        <form onSubmit={submit} className="bg-white/[0.07] backdrop-blur border border-white/12 rounded-3xl p-5 mt-4 space-y-4 shadow-2xl">
          <h2 className="font-black">{t("ship.formHeading")}</h2>
          <div><label className={labelCls}>{t("ship.fullName")}</label><input className={inputCls} placeholder={t("ship.ph.fullName")} value={form.fullName} onChange={e => set("fullName", e.target.value)} required /></div>
          <div className="grid sm:grid-cols-2 gap-3">
            <div><label className={labelCls}>{t("ship.email")}</label><input type="email" className={inputCls} placeholder={t("ship.ph.email")} value={form.email} onChange={e => set("email", e.target.value)} required /></div>
            <div><label className={labelCls}>{t("ship.phone")}</label><input className={inputCls} placeholder={t("ship.ph.phone")} value={form.phone} onChange={e => set("phone", e.target.value)} required /></div>
          </div>
          <div><label className={labelCls}>{t("ship.addr1")}</label><input className={inputCls} placeholder={t("ship.ph.addr1")} value={form.addressLine1} onChange={e => set("addressLine1", e.target.value)} required /></div>
          {/* <div><label className={labelCls}>{t("ship.addr2")}</label><input className={inputCls} placeholder={t("ship.ph.addr2")} value={form.addressLine2} onChange={e => set("addressLine2", e.target.value)} /></div> */}
          <div className="grid grid-cols-2 gap-3">
            <div><label className={labelCls}>{t("ship.city")}</label><input className={inputCls} placeholder={t("ship.ph.city")} value="Tenkasi" onChange={e => set("city", e.target.value)} required /></div>
            <div><label className={labelCls}>{t("ship.state")}</label><input className={inputCls} placeholder={t("ship.ph.state")} value="Tamilnadu" onChange={e => set("state", e.target.value)} required /></div>
          </div>
          <div className="grid grid-cols-2 gap-3 hidden">
            <div><label className={labelCls}>{t("ship.pin")}</label><input className={inputCls} placeholder={t("ship.ph.pin")} inputMode="numeric" maxLength={10} value="627806" onChange={e => set("postalCode", e.target.value)} required /></div>
            <div><label className={labelCls}>{t("ship.country")}</label><select className={inputCls} value="India" onChange={e => set("country", e.target.value)}><option>India</option><option>United Arab Emirates</option><option>Singapore</option><option>United States</option><option>United Kingdom</option><option>Other</option></select></div>
          </div>
          {error && <div className="bg-red-500/15 border border-red-400/40 text-red-200 text-xs font-semibold rounded-xl px-3 py-2.5">⚠️ {error}</div>}
          <button disabled={loading} className="w-full bg-gradient-to-r from-amber-400 via-orange-500 to-pink-600 disabled:opacity-60 font-black py-4 rounded-2xl text-white shadow-lg">{loading ? t("ship.saving") : t("ship.save")}</button>
          <p className="text-[11px] text-white/40 text-center">{t("ship.secure")}</p>
        </form>
      </>)}
    </main><Footer /></div>);
}
