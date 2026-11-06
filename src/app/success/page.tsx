"use client";
import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Header, Footer, Steps, Confetti } from "@/components/Chrome";

type Me = { user: { id: string; email: string; instagramHandle: string; referralCode: string; orderConfirmed: boolean; orderStatus: string; shareCount: number }; prize: { prizeName: string; emoji?: string; value?: string; desc?: string; prizeType: string } | null; address: { fullName: string; city: string; state: string; postalCode: string; email: string } | null; friendsPlayed: number; friendsNeeded: number; orderReady: boolean };

export default function SuccessPage() {
  const [me, setMe] = useState<Me | null>(null); const [loading, setLoading] = useState(true); const [msg, setMsg] = useState(""); const [copied, setCopied] = useState(false); const [confirming, setConfirming] = useState(false); const [celebrate, setCelebrate] = useState(false);
  const load = useCallback(() => { fetch("/api/me").then(async r => { if (r.ok) setMe(await r.json()); }).catch(() => {}).finally(() => setLoading(false)); }, []);
  useEffect(() => { load(); const t = setInterval(load, 8000); return () => clearInterval(t); }, [load]);

  const origin = typeof window !== "undefined" ? window.location.origin : "";
  const shareLink = me ? `${origin}/?ref=${me.user.id}` : "";
  const waText = me ? encodeURIComponent(`🪔 Diwali Spin & Win! I just won ${me.prize?.prizeName || "a Diwali gift"}! 🎉 Spin FREE & win 1g Gold, iPhone 17, Android Phone ₹20K & gift boxes. Play now 👉 ${shareLink}`) : "";
  const progress = me ? Math.min(100, (me.friendsPlayed / me.friendsNeeded) * 100) : 0;

  async function recordShare(channel = "whatsapp") { try { const r = await fetch("/api/share", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "share", channel }) }); if (r.ok) load(); } catch {} }
  async function shareWhatsApp() { await recordShare("whatsapp"); window.open(`https://wa.me/?text=${waText}`, "_blank", "noopener"); setMsg("✅ WhatsApp opened! Send it to 2 friends, then tap “Confirm My Order” below."); }
  async function copyLink() { try { await navigator.clipboard.writeText(shareLink); setCopied(true); setTimeout(() => setCopied(false), 2500); } catch { setMsg(shareLink); } await recordShare("copy"); }
  async function confirmOrder() {
    setConfirming(true);
    try {
      const r = await fetch("/api/share", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "confirm" }) });
      const d = await r.json();
      if (!r.ok) { alert(`⚠️ ${d.error}`); setConfirming(false); return; }
      setCelebrate(true); load();
      alert(`🎉 ${d.message}\n\n👥 Friends played via your link: ${d.friendsPlayed}/2${d.ready ? "\n🚚 Both friends played — your gift is ready for delivery!" : "\nShare your link again if a friend hasn't played yet."}`);
      setMsg(d.message);
    } catch { alert("Network error. Please try again."); }
    setConfirming(false);
  }

  if (loading) return (<div className="min-h-screen bg-[#1a0533]"><Header /><p className="text-center py-20 text-white/60">Loading your prize… 🪔</p></div>);
  if (!me) return (<div className="min-h-screen bg-[#1a0533] bg-[radial-gradient(ellipse_at_top,#4c1d95,#1a0533_65%)]"><Header /><main className="max-w-md mx-auto px-4 py-14 text-center"><div className="text-6xl">👤</div><h1 className="font-black text-2xl mt-3">Create Your Account First</h1><p className="text-white/60 text-sm mt-2">Spin → add your address → create an account, and your prize, WhatsApp share link &amp; order status will appear here.</p><div className="flex gap-2 justify-center mt-5"><Link href="/" className="bg-amber-400 text-[#2a0a00] font-black px-5 py-3 rounded-full text-sm">🎡 Spin Now</Link><Link href="/account" className="bg-white/10 font-bold px-5 py-3 rounded-full text-sm">Create Account</Link></div></main><Footer /></div>);

  const isWin = me.prize && me.prize.prizeType !== "none";
  return (<div className="min-h-screen bg-[#1a0533] bg-[radial-gradient(ellipse_at_top,#4c1d95,#1a0533_65%)]"><Confetti fire={celebrate} /><Header />
    <main className="max-w-2xl mx-auto px-4 pb-10"><Steps current={4} />
      <div className="text-center animate-pop">
        <div className="text-6xl animate-floaty">{isWin ? (me.prize?.emoji || "🎁") : "🎆"}</div>
        <h1 className="text-3xl sm:text-4xl font-black mt-2">🎉 Congratulations{me.user.instagramHandle ? ` @${me.user.instagramHandle}` : ""}!</h1>
        {isWin ? (<>
          <p className="text-white/75 mt-2 text-sm sm:text-base">Your Diwali Spin &amp; Win entry has been successfully registered.<br />You won: <b className="text-amber-300 text-lg">{me.prize?.prizeName}</b> {me.prize?.value ? <span className="text-white/50">({me.prize.value})</span> : null}</p>
          <p className="text-white/60 text-sm mt-1">Your prize and delivery details have been recorded successfully. Thank you for participating! 🪔 <b className="text-amber-200">Happy Diwali!</b> 🪔</p>
          {me.address ? <div className="inline-block mt-3 bg-emerald-400/10 border border-emerald-300/30 text-emerald-200 text-xs font-semibold rounded-2xl px-4 py-2.5">📦 Deliver to: {me.address.fullName}, {me.address.city}, {me.address.state} — {me.address.postalCode}<br /><span className="text-emerald-200/70">Your gift will be delivered to the shipping address you provided.</span></div> : <div className="mt-3"><Link href="/shipping" className="text-amber-300 underline text-sm font-bold">Add your delivery address →</Link></div>}
        </>) : (<p className="text-white/70 mt-2 text-sm">Better luck next time! 🎆 Your entry is registered — we&apos;ll invite you to the next Diwali promotion. You can still invite friends below!</p>)}
      </div>

      {/* SHARE CARD */}
      <section className="bg-white/[0.07] backdrop-blur border border-amber-300/30 rounded-[28px] p-5 mt-6 shadow-2xl">
        <h2 className="font-black text-lg flex items-center gap-2">💬 Final Step — Share with 2 Friends</h2>
        <p className="text-xs text-white/60 mt-1">Share your personal link on WhatsApp with <b className="text-amber-300">2 friends</b>. When both friends play the game, we deliver your product! 🚚</p>

        <div className="mt-4">
          <div className="flex justify-between text-xs font-bold"><span>👥 Friends who played via your link</span><span className={me.friendsPlayed >= 2 ? "text-emerald-300" : "text-amber-300"}>{me.friendsPlayed} / {me.friendsNeeded}</span></div>
          <div className="h-3.5 bg-white/10 rounded-full mt-2 overflow-hidden"><div className="h-full bg-gradient-to-r from-amber-400 via-orange-500 to-emerald-400 rounded-full transition-all duration-700" style={{ width: `${progress}%` }} /></div>
          <div className="flex gap-2 mt-2">{[1, 2].map(n => (<span key={n} className={`flex-1 text-center text-[11px] font-black py-1.5 rounded-full border ${me.friendsPlayed >= n ? "bg-emerald-400/20 border-emerald-300/40 text-emerald-300" : "bg-white/5 border-white/10 text-white/40"}`}>{me.friendsPlayed >= n ? "✅ Friend " + n + " played!" : "⏳ Friend " + n + " pending"}</span>))}</div>
          <button onClick={load} className="text-[11px] text-white/40 underline mt-1.5">↻ Refresh friend status (auto-refreshes every 8s)</button>
        </div>

        <label className="block text-[11px] font-black tracking-wider text-amber-200 mt-4">🔗 YOUR PERSONAL LINK (contains your ID)</label>
        <div className="flex gap-2 mt-1.5"><input readOnly value={shareLink} className="flex-1 min-w-0 bg-[#12002b] border border-white/15 rounded-xl px-3 py-3 text-xs font-mono text-amber-200" onFocus={e => e.target.select()} /><button onClick={copyLink} className="bg-white/10 hover:bg-white/20 font-bold text-sm px-4 rounded-xl whitespace-nowrap">{copied ? "✅ Copied" : "📋 Copy"}</button></div>
        <p className="text-[10px] text-white/35 mt-1">Link contains your user ID: <span className="font-mono">{me.user.id.slice(0, 13)}…</span> • Referral code: {me.user.referralCode} • Shares recorded: {me.user.shareCount}</p>

        <button onClick={shareWhatsApp} className="mt-4 w-full bg-[#25D366] hover:bg-[#1fb857] text-[#052e16] font-black py-4 rounded-2xl text-base shadow-[0_10px_30px_rgba(37,211,102,.35)] transition">💬 Share on WhatsApp →</button>
        <div className="grid grid-cols-2 gap-2 mt-2">
          <a onClick={() => recordShare("telegram")} href={`https://t.me/share/url?url=${encodeURIComponent(shareLink)}&text=${waText}`} target="_blank" rel="noreferrer" className="text-center bg-sky-500/20 border border-sky-300/30 font-bold text-sm py-3 rounded-xl">✈️ Telegram</a>
          <a onClick={() => recordShare("sms")} href={`sms:?&body=${waText}`} className="text-center bg-white/10 border border-white/15 font-bold text-sm py-3 rounded-xl">✉️ SMS / Other</a>
        </div>

        <button onClick={confirmOrder} disabled={confirming} className="mt-3 w-full bg-gradient-to-r from-amber-400 via-orange-500 to-pink-600 disabled:opacity-60 text-white font-black py-4 rounded-2xl text-base shadow-lg">{confirming ? "Confirming… 🔒" : me.user.orderConfirmed ? "✅ Order Confirmed — Tap to Re-check Status" : "🎉 Confirm My Order"}</button>
        {msg && <div className="mt-3 bg-emerald-400/10 border border-emerald-300/30 text-emerald-200 text-xs font-semibold rounded-xl px-3 py-2.5">🎉 {msg}</div>}
        <div className={`mt-3 text-center text-xs font-black px-3 py-2.5 rounded-xl border ${me.orderReady ? "bg-emerald-400/15 border-emerald-300/40 text-emerald-300" : me.user.orderConfirmed ? "bg-amber-400/15 border-amber-300/40 text-amber-200" : "bg-white/5 border-white/10 text-white/50"}`}>
          {me.orderReady ? "🚚 STATUS: READY TO DELIVER — Both friends played! Your gift is being packed. 🪔" : me.user.orderConfirmed ? "📦 STATUS: CONFIRMED — Waiting for 2 friends to play, then we deliver!" : "⏳ STATUS: Share your link & confirm your order"}
        </div>
      </section>

      <div className="grid sm:grid-cols-3 gap-3 mt-4 text-center text-xs">
        <div className="bg-white/[0.06] border border-white/10 rounded-3xl p-4"><div className="text-2xl">👤</div><b>Account</b><p className="text-white/50 mt-1">{me.user.email}<br />@{me.user.instagramHandle}</p></div>
        <div className="bg-white/[0.06] border border-white/10 rounded-3xl p-4"><div className="text-2xl">🎁</div><b>{me.prize?.prizeName || "No prize yet"}</b><p className="text-white/50 mt-1">{me.prize?.desc || "Spin the wheel to win"}</p></div>
        <div className="bg-white/[0.06] border border-white/10 rounded-3xl p-4"><div className="text-2xl">💬</div><b>{me.user.shareCount} shares</b><p className="text-white/50 mt-1">{me.friendsPlayed}/2 friends played</p></div>
      </div>
      <p className="text-center text-xs text-white/40 mt-6"><Link href="/" className="underline">🎡 Back to Spin Page</Link> • Invite friends with your link above — each friend gets their own free spin!</p>
    </main><Footer /></div>);
}
