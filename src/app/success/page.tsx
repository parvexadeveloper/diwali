"use client";
import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Header, Footer, Steps, Confetti } from "@/components/Chrome";
import { useI18n } from "@/lib/i18n";

type Me = { user: { id: string; email: string; instagramHandle: string; referralCode: string; orderConfirmed: boolean; orderStatus: string; shareCount: number }; prize: { prizeId?: string; prizeName: string; emoji?: string; value?: string; desc?: string; prizeType: string } | null; address: { fullName: string; city: string; state: string; postalCode: string; email: string } | null; friendsPlayed: number; friendsNeeded: number; orderReady: boolean };

export default function SuccessPage() {
  const { t } = useI18n();
  const [me, setMe] = useState<Me | null>(null); const [loading, setLoading] = useState(true); const [msg, setMsg] = useState(""); const [copied, setCopied] = useState(false); const [confirming, setConfirming] = useState(false); const [celebrate, setCelebrate] = useState(false);
  const load = useCallback(() => { fetch("/api/me").then(async r => { if (r.ok) setMe(await r.json()); }).catch(() => {}).finally(() => setLoading(false)); }, []);
  useEffect(() => { load(); const id = setInterval(load, 8000); return () => clearInterval(id); }, [load]);

  const origin = typeof window !== "undefined" ? window.location.origin : "";
  const shareLink = me ? `${origin}/?ref=${me.user.id}` : "";
  const prizeName = me?.prize ? (me.prize.prizeId ? t(`prize.${me.prize.prizeId}.name`) : me.prize.prizeName) : "";
  const prizeValue = me?.prize?.prizeId ? t(`prize.${me.prize.prizeId}.value`) : me?.prize?.value || "";
  const prizeDesc = me?.prize?.prizeId ? t(`prize.${me.prize.prizeId}.desc`) : me?.prize?.desc || "";
  const waText = me ? encodeURIComponent(t("succ.waMessage", { prize: prizeName || t("succ.aPrize"), link: shareLink })) : "";
  const progress = me ? Math.min(100, (me.friendsPlayed / me.friendsNeeded) * 100) : 0;

  const waLink = `https://wa.me/?text=${waText}`;
  function recordShare(channel = "whatsapp") { fetch("/api/share", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "share", channel }) }).then(r => { if (r.ok) load(); }).catch(() => {}); }
  // Record the share in the background (no await) so the tap gesture is kept
  // and the browser opens WhatsApp with the text intact on mobile.
  function shareWhatsApp() { recordShare("whatsapp"); setMsg(t("succ.waOpened")); }
  async function copyLink() { try { await navigator.clipboard.writeText(shareLink); setCopied(true); setTimeout(() => setCopied(false), 2500); } catch { setMsg(shareLink); } recordShare("copy"); }
  async function confirmOrder() {
    setConfirming(true);
    try {
      const r = await fetch("/api/share", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "confirm" }) });
      const d = await r.json();
      if (!r.ok) { alert(`⚠️ ${d.error}`); setConfirming(false); return; }
      setCelebrate(true); load();
      alert(`🎉 ${d.message}\n\n👥 ${me?.friendsPlayed ?? d.friendsPlayed}/2`);
      setMsg(d.message);
    } catch { alert(t("acct.err.network")); }
    setConfirming(false);
  }

  if (loading) return (<div className="min-h-screen bg-[#1a0533]"><Header /><p className="text-center py-20 text-white/60">{t("succ.loading")}</p></div>);
  if (!me) return (<div className="min-h-screen bg-[#1a0533] bg-[radial-gradient(ellipse_at_top,#4c1d95,#1a0533_65%)]"><Header /><main className="max-w-md mx-auto px-4 py-14 text-center"><div className="text-6xl">👤</div><h1 className="font-black text-2xl mt-3">{t("succ.noMe.title")}</h1><p className="text-white/60 text-sm mt-2">{t("succ.noMe.desc")}</p><div className="flex gap-2 justify-center mt-5"><Link href="/" className="bg-amber-400 text-[#2a0a00] font-black px-5 py-3 rounded-full text-sm">{t("succ.noMe.spin")}</Link><Link href="/account" className="bg-white/10 font-bold px-5 py-3 rounded-full text-sm">{t("succ.noMe.login")}</Link></div></main><Footer /></div>);

  const isWin = me.prize && me.prize.prizeType !== "none";
  return (<div className="min-h-screen bg-[#1a0533] bg-[radial-gradient(ellipse_at_top,#4c1d95,#1a0533_65%)]"><Confetti fire={celebrate} /><Header />
    <main className="max-w-2xl mx-auto px-4 pb-10"><Steps current={4} />
      <div className="text-center animate-pop">
        <div className="text-6xl animate-floaty">{isWin ? (me.prize?.emoji || "🎁") : "🎆"}</div>
        <h1 className="text-3xl sm:text-4xl font-black mt-2">{t("succ.congrats", { who: me.user.instagramHandle ? ` @${me.user.instagramHandle}` : "" })}</h1>
        {isWin ? (<>
          <p className="text-white/75 mt-2 text-sm sm:text-base">{t("succ.won")}<br />{t("succ.wonYou")} <b className="text-amber-300 text-lg">{prizeName}</b> {prizeValue ? <span className="text-white/50">({prizeValue})</span> : null}</p>
          <p className="text-white/60 text-sm mt-1">{t("succ.recorded")}</p>
          {me.address ? <div className="inline-block mt-3 bg-emerald-400/10 border border-emerald-300/30 text-emerald-200 text-xs font-semibold rounded-2xl px-4 py-2.5">{t("succ.deliverTo", { name: me.address.fullName, city: me.address.city, state: me.address.state, pin: me.address.postalCode })}<br /><span className="text-emerald-200/70">{t("succ.deliverNote")}</span></div> : <div className="mt-3"><Link href="/shipping" className="text-amber-300 underline text-sm font-bold">{t("succ.addAddress")}</Link></div>}
        </>) : (<p className="text-white/70 mt-2 text-sm">{t("succ.betterLuck")}</p>)}
      </div>

      {/* SHARE CARD */}
      <section className="bg-white/[0.07] backdrop-blur border border-amber-300/30 rounded-[28px] p-5 mt-6 shadow-2xl">
        <h2 className="font-black text-lg flex items-center gap-2">{t("succ.shareHeading")}</h2>
        <p className="text-xs text-white/60 mt-1">{t("succ.shareDesc")}</p>

        <div className="mt-4">
          <div className="flex justify-between text-xs font-bold"><span>{t("succ.friendsPlayed")}</span><span className={me.friendsPlayed >= 2 ? "text-emerald-300" : "text-amber-300"}>{me.friendsPlayed} / {me.friendsNeeded}</span></div>
          <div className="h-3.5 bg-white/10 rounded-full mt-2 overflow-hidden"><div className="h-full bg-gradient-to-r from-amber-400 via-orange-500 to-emerald-400 rounded-full transition-all duration-700" style={{ width: `${progress}%` }} /></div>
          <div className="flex gap-2 mt-2">{[1, 2].map(n => (<span key={n} className={`flex-1 text-center text-[11px] font-black py-1.5 rounded-full border ${me.friendsPlayed >= n ? "bg-emerald-400/20 border-emerald-300/40 text-emerald-300" : "bg-white/5 border-white/10 text-white/40"}`}>{me.friendsPlayed >= n ? t("succ.friendPlayed", { n }) : t("succ.friendPending", { n })}</span>))}</div>
          <button onClick={load} className="text-[11px] text-white/40 underline mt-1.5">{t("succ.refresh")}</button>
        </div>

        <label className="block text-[11px] font-black tracking-wider text-amber-200 mt-4">{t("succ.linkLabel")}</label>
        <div className="flex gap-2 mt-1.5"><input readOnly value={shareLink} className="flex-1 min-w-0 bg-[#12002b] border border-white/15 rounded-xl px-3 py-3 text-xs font-mono text-amber-200" onFocus={e => e.target.select()} /><button onClick={copyLink} className="bg-white/10 hover:bg-white/20 font-bold text-sm px-4 rounded-xl whitespace-nowrap">{copied ? t("succ.copied") : t("succ.copy")}</button></div>
        <p className="text-[10px] text-white/35 mt-1">{t("succ.linkMeta", { id: me.user.id.slice(0, 13), code: me.user.referralCode, count: me.user.shareCount })}</p>

        <a href={waLink} target="_blank" rel="noopener noreferrer" onClick={shareWhatsApp} className="mt-4 block text-center w-full bg-[#25D366] hover:bg-[#1fb857] active:bg-[#1fb857] text-[#052e16] font-black py-4 rounded-2xl text-base shadow-[0_10px_30px_rgba(37,211,102,.35)] transition">{t("succ.shareWa")}</a>

        <button onClick={confirmOrder} disabled={confirming} className="mt-3 w-full bg-gradient-to-r from-amber-400 via-orange-500 to-pink-600 disabled:opacity-60 text-white font-black py-4 rounded-2xl text-base shadow-lg">{confirming ? t("succ.confirming") : me.user.orderConfirmed ? t("succ.confirmRe") : t("succ.confirm")}</button>
        {msg && <div className="mt-3 bg-emerald-400/10 border border-emerald-300/30 text-emerald-200 text-xs font-semibold rounded-xl px-3 py-2.5">🎉 {msg}</div>}
        <div className={`mt-3 text-center text-xs font-black px-3 py-2.5 rounded-xl border ${me.orderReady ? "bg-emerald-400/15 border-emerald-300/40 text-emerald-300" : me.user.orderConfirmed ? "bg-amber-400/15 border-amber-300/40 text-amber-200" : "bg-white/5 border-white/10 text-white/50"}`}>
          {me.orderReady ? t("succ.statusReady") : me.user.orderConfirmed ? t("succ.statusConfirmed") : t("succ.statusShare")}
        </div>
      </section>

      <div className="grid sm:grid-cols-3 gap-3 mt-4 text-center text-xs">
        <div className="bg-white/[0.06] border border-white/10 rounded-3xl p-4"><div className="text-2xl">👤</div><b>{t("succ.card.account")}</b><p className="text-white/50 mt-1">{me.user.email}<br />@{me.user.instagramHandle}</p></div>
        <div className="bg-white/[0.06] border border-white/10 rounded-3xl p-4"><div className="text-2xl">🎁</div><b>{prizeName || t("succ.card.noPrize")}</b><p className="text-white/50 mt-1">{prizeDesc || t("succ.card.spinToWin")}</p></div>
        <div className="bg-white/[0.06] border border-white/10 rounded-3xl p-4"><div className="text-2xl">💬</div><b>{t("succ.card.shares", { n: me.user.shareCount })}</b><p className="text-white/50 mt-1">{t("succ.card.friends", { n: me.friendsPlayed })}</p></div>
      </div>
      <p className="text-center text-xs text-white/40 mt-6"><Link href="/" className="underline">{t("succ.backSpin")}</Link>{t("succ.inviteNote")}</p>
    </main><Footer /></div>);
}
