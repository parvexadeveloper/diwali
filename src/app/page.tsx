"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { PRIZES } from "@/lib/prizes";
import { Header, Footer, Confetti, Steps } from "@/components/Chrome";

type Entry = { id: string; prizeId: string; prizeName: string; prizeType: string };
const IMG1 = "https://images.pexels.com/photos/3135229/pexels-photo-3135229.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200";
const IMG2 = "https://images.pexels.com/photos/4078516/pexels-photo-4078516.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200";

export default function SpinPage() {
  const [handle, setHandle] = useState("");
  const [spinning, setSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [result, setResult] = useState<(typeof PRIZES)[number] | null>(null);
  const [entry, setEntry] = useState<Entry | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [error, setError] = useState("");
  const [prevEntry, setPrevEntry] = useState<Entry | null>(null);
  const [stats, setStats] = useState<{ totalSpins: number; winners: number; players: number; orders: number; recent: { prizeName: string; handle: string; prizeType: string }[] } | null>(null);
  const [refBy, setRefBy] = useState("");
  const wheelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const q = new URLSearchParams(window.location.search);
    const ref = q.get("ref") || q.get("referral") || "";
    if (ref) { localStorage.setItem("diwali_ref", ref); setRefBy(ref); } else setRefBy(localStorage.getItem("diwali_ref") || "");
    const savedHandle = localStorage.getItem("diwali_handle"); if (savedHandle) setHandle(savedHandle);
    try { const e = JSON.parse(localStorage.getItem("diwali_entry") || "null"); if (e?.id) setPrevEntry(e); } catch {}
    fetch("/api/stats").then(r => r.json()).then(setStats).catch(() => {});
  }, []);

  const conic = useMemo(() => `conic-gradient(from -30deg, ${PRIZES.map((p, i) => `${p.color} ${i * 60}deg ${(i + 1) * 60}deg`).join(", ")})`, []);

  async function spin() {
    setError("");
    const h = handle.trim().replace(/^@/, "");
    if (h && !/^[a-zA-Z0-9._]{2,30}$/.test(h)) { setError("Enter a valid Instagram username (2–30 chars: letters, numbers, . or _) or leave it blank to play as guest."); return; }
    setSpinning(true); setShowResult(false); setResult(null);
    try {
      const res = await fetch("/api/spin", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ instagramHandle: h, referredBy: refBy }) });
      const data = await res.json();
      if (!res.ok) {
        setSpinning(false);
        if (data.entry) { localStorage.setItem("diwali_entry", JSON.stringify(data.entry)); setPrevEntry(data.entry); }
        setError(data.error || "Something went wrong. Please try again.");
        return;
      }
      const prize = PRIZES.find(p => p.id === data.entry.prizeId) || data.prize;
      const idx = PRIZES.findIndex(p => p.id === prize.id);
      const jitter = Math.floor(Math.random() * 36) - 18;
      const targetCenter = idx * 60 + 30;
      setRotation(prev => { const base = Math.ceil(prev / 360) * 360; return base + 360 * 6 + (360 - targetCenter) + jitter; });
      localStorage.setItem("diwali_entry", JSON.stringify(data.entry));
      if (h) localStorage.setItem("diwali_handle", h);
      setEntry(data.entry); setResult(prize);
      setTimeout(() => { setSpinning(false); setShowResult(true); fetch("/api/stats").then(r => r.json()).then(setStats).catch(() => {}); }, 4600);
    } catch { setSpinning(false); setError("Network error. Please check your connection and try again."); }
  }

  const isWin = result && result.type !== "none";

  return (<div className="min-h-screen bg-[#1a0533] bg-[radial-gradient(ellipse_at_top,#4c1d95_0%,#2e1065_35%,#1a0533_70%)] overflow-x-hidden">
    <Confetti fire={showResult && !!isWin} />
    <Header />
    {/* festive lights */}
    <div className="flex justify-center gap-3 pt-3 text-lg" aria-hidden>{["🪔","✨","🪔","🎆","🪔","✨","🪔"].map((e,i)=>(<span key={i} className="animate-flicker" style={{animationDelay:`${i*0.2}s`}}>{e}</span>))}</div>

    <main className="max-w-6xl mx-auto px-4 pb-6">
      <Steps current={1} />
      <div className="text-center max-w-2xl mx-auto">
        <p className="inline-block bg-white/10 border border-amber-300/30 text-amber-200 text-[11px] font-bold tracking-widest px-3 py-1 rounded-full">✦ FESTIVAL OF LIGHTS • LIMITED DIWALI OFFER ✦</p>
        <h1 className="mt-3 text-4xl sm:text-6xl font-black leading-[0.95]">🪔 DIWALI<br /><span className="bg-gradient-to-r from-amber-200 via-yellow-400 to-orange-500 bg-clip-text text-transparent">SPIN &amp; WIN</span> 🪔</h1>
        <p className="mt-3 text-white/75 text-sm sm:text-base">Celebrate Diwali. Spin the wheel. Win <b className="text-amber-300">1g Gold, iPhone 17, Android Phone ₹20K</b>, Silver &amp; Gift Boxes!</p>
        {refBy && <p className="mt-2 inline-block bg-emerald-400/15 border border-emerald-300/30 text-emerald-200 text-xs font-bold px-3 py-1.5 rounded-full">💚 You were invited by a friend — your spin will help confirm their gift delivery!</p>}
      </div>

      {/* stats */}
      <div className="grid grid-cols-4 gap-2 max-w-xl mx-auto mt-5 text-center">
        {[["🎡", stats?.totalSpins ?? "—", "Spins"], ["🏆", stats?.winners ?? "—", "Winners"], ["👥", stats?.players ?? "—", "Players"], ["📦", stats?.orders ?? "—", "Orders"]].map(([e, v, l]) => (
          <div key={l} className="bg-white/[0.07] border border-white/10 rounded-2xl py-2.5 px-1"><div className="text-base">{e}</div><div className="font-black text-amber-300 text-lg leading-none">{v}</div><div className="text-[10px] tracking-wider text-white/50 font-bold mt-0.5">{l}</div></div>
        ))}
      </div>

      {prevEntry && !result && (
        <div className="max-w-xl mx-auto mt-5 bg-amber-400/10 border border-amber-300/40 rounded-3xl p-4 text-center animate-pop">
          <p className="text-2xl">{prevEntry.prizeType === "none" ? "🎆" : "🎉"}</p>
          <p className="font-black text-amber-200">You already spun: {prevEntry.prizeName}</p>
          <p className="text-xs text-white/60 mt-1">One spin per Instagram profile / browser. Continue your journey below:</p>
          <div className="flex gap-2 justify-center mt-3 flex-wrap">
            {prevEntry.prizeType !== "none" ? (<><Link href="/shipping" className="bg-amber-400 text-[#2a0a00] font-black text-sm px-4 py-2.5 rounded-full">📦 Enter Delivery Address →</Link><Link href="/success" className="bg-white/10 font-bold text-sm px-4 py-2.5 rounded-full">🎁 My Prize</Link></>) : (<Link href="/account" className="bg-amber-400 text-[#2a0a00] font-black text-sm px-4 py-2.5 rounded-full">Create Account →</Link>)}
            <button onClick={() => { localStorage.removeItem("diwali_entry"); setPrevEntry(null); }} className="text-xs text-white/40 underline px-2">Not you? Reset this browser</button>
          </div>
        </div>
      )}

      {/* WHEEL */}
      <section className="relative max-w-md mx-auto mt-7">
        <div className="absolute -inset-3 bg-gradient-to-r from-amber-500/30 via-pink-500/20 to-purple-500/30 rounded-full blur-2xl" aria-hidden />
        <div className="relative">
          {/* pointer */}
          <div className="absolute left-1/2 -translate-x-1/2 -top-2 z-20 flex flex-col items-center"><div className="text-3xl drop-shadow">🔻</div></div>
          <div ref={wheelRef} className="wheel-shadow relative aspect-square rounded-full border-[10px] border-amber-400/90 overflow-hidden transition-transform ease-[cubic-bezier(.12,.8,.16,1)]" style={{ background: conic, transform: `rotate(${rotation}deg)`, transitionDuration: spinning ? "4500ms" : "300ms" }}>
            {PRIZES.map((p, i) => (
              <div key={p.id} className="absolute inset-0 flex justify-center" style={{ transform: `rotate(${i * 60 + 30}deg)` }}>
                <div className="pt-[9%] text-center w-24" style={{ color: p.textColor }}>
                  <div className="text-xl sm:text-2xl leading-none">{p.emoji}</div>
                  <div className="font-black text-[10px] sm:text-[11px] leading-tight mt-1 tracking-wide px-1">{p.short}</div>
                  <div className="text-[8px] font-bold opacity-80">{p.value}</div>
                </div>
              </div>
            ))}
            {/* hub */}
            <div className="absolute inset-0 grid place-items-center"><div className="w-[26%] aspect-square rounded-full bg-[#2a0a4a] border-4 border-amber-300 grid place-items-center text-center shadow-2xl"><div><div className="text-xl sm:text-2xl">🪔</div><div className="text-[8px] sm:text-[9px] font-black text-amber-300 tracking-widest leading-tight">SPIN<br />&amp; WIN</div></div></div></div>
            {/* segment separators */}
            {PRIZES.map((_, i) => (<div key={i} className="absolute left-1/2 top-1/2 w-[2px] h-[50%] bg-[#1a0533]/25 origin-top" style={{ transform: `rotate(${i * 60}deg) translateX(-50%)` }} aria-hidden />))}
          </div>
          <div className="absolute inset-0 rounded-full border border-white/20 pointer-events-none" aria-hidden />
        </div>
      </section>

      {/* spin controls */}
      <div className="max-w-md mx-auto mt-6 bg-white/[0.07] backdrop-blur border border-white/12 rounded-3xl p-4 sm:p-5 shadow-2xl">
        <label className="block text-xs font-black tracking-wider text-amber-200">📸 YOUR INSTAGRAM USERNAME <span className="text-white/40 font-semibold normal-case tracking-normal">(one spin per profile)</span></label>
        <div className="mt-2 flex items-center bg-[#12002b] border border-white/15 rounded-2xl overflow-hidden focus-within:border-amber-300">
          <span className="pl-3 text-white/50 font-bold">@</span>
          <input value={handle} onChange={e => setHandle(e.target.value)} placeholder="your_instagram_id" className="w-full bg-transparent px-1.5 py-3 text-sm font-semibold placeholder:text-white/30" maxLength={31} />
          {handle && <span className="pr-3 text-emerald-300 text-xs font-bold whitespace-nowrap">✓ 1× only</span>}
        </div>
        <p className="text-[11px] text-white/45 mt-1.5">We only use your public username to prevent repeat plays. <b className="text-white/70">Never enter your Instagram password here.</b> You can also play as guest.</p>
        {error && <div className="mt-3 bg-red-500/15 border border-red-400/40 text-red-200 text-xs font-semibold rounded-xl px-3 py-2.5">⚠️ {error}</div>}
        <button onClick={spin} disabled={spinning} className="mt-3 w-full bg-gradient-to-r from-amber-400 via-orange-500 to-pink-600 disabled:opacity-60 text-white font-black text-lg tracking-wide py-4 rounded-2xl shadow-[0_10px_30px_rgba(245,158,11,.4)] active:scale-[.99] transition">
          {spinning ? "🎡 SPINNING… GOOD LUCK! ✨" : "✨ SPIN NOW — IT'S FREE ✨"}
        </button>
        <p className="text-center text-[11px] text-white/40 mt-2">🔒 Prize is decided securely on our server • No IP restriction • One spin per profile/browser</p>
      </div>

      {/* prizes grid */}
      <h2 className="text-center font-black text-xl mt-10">🎁 <span className="text-amber-300">Prizes You Can Win</span></h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-w-3xl mx-auto mt-4">
        {PRIZES.map(p => (<div key={p.id} className="bg-white/[0.06] border border-white/10 rounded-3xl p-4 text-center hover:border-amber-300/50 transition"><div className="text-4xl">{p.emoji}</div><div className="font-black mt-1.5 text-sm">{p.name}</div><div className="text-[11px] text-amber-200/90 font-bold">{p.value}</div><div className="text-[11px] text-white/50 mt-1">{p.desc}</div><span className={`inline-block mt-2 text-[10px] font-black px-2 py-0.5 rounded-full ${p.type === "none" ? "bg-white/10 text-white/50" : "bg-emerald-400/15 text-emerald-300"}`}>{p.type === "none" ? "TRY AGAIN" : "PHYSICAL GIFT • HOME DELIVERY"}</span></div>))}
      </div>

      {/* how it works */}
      <div className="max-w-3xl mx-auto mt-10 grid sm:grid-cols-4 gap-3 text-center">
        {[["1 🎡", "Spin the Wheel", "Enter your @username & spin once"], ["2 📦", "Add Address", "Won a gift? Tell us where to deliver + email"], ["3 👤", "Create Account", "Your own Diwali Spin & Win account"], ["4 💬", "Share & Confirm", "WhatsApp 2 friends → order confirmed!"]].map(([t, d, s]) => (<div key={t} className="bg-gradient-to-b from-white/[0.08] to-white/[0.03] border border-white/10 rounded-3xl p-4"><div className="font-black text-amber-300">{t}</div><div className="font-bold text-sm mt-1">{d}</div><div className="text-[11px] text-white/50 mt-1">{s}</div></div>))}
      </div>

      <div className="max-w-3xl mx-auto mt-8 grid sm:grid-cols-2 gap-3">
        <img src={IMG1} alt="Diwali diyas celebration" className="rounded-3xl h-44 w-full object-cover border border-white/10" loading="lazy" />
        <img src={IMG2} alt="Diyas with marigold flowers Jaipur" className="rounded-3xl h-44 w-full object-cover border border-white/10 hidden sm:block" loading="lazy" />
      </div>

      {stats && stats.recent.length > 0 && (<div className="max-w-3xl mx-auto mt-8"><h3 className="font-black text-center text-sm tracking-wide text-white/80">🏆 RECENT RESULTS</h3><div className="mt-3 flex flex-wrap justify-center gap-2">{stats.recent.map((r, i) => (<span key={i} className={`text-xs font-bold px-3 py-1.5 rounded-full border ${r.prizeType === "none" ? "bg-white/5 border-white/10 text-white/50" : "bg-amber-400/15 border-amber-300/30 text-amber-200"}`}>{r.prizeType === "none" ? "🎆" : "🎉"} {r.handle} — {r.prizeName}</span>))}</div></div>)}
    </main>
    <Footer />

    {/* RESULT MODAL */}
    {showResult && result && (
      <div className="fixed inset-0 z-[80] bg-black/75 backdrop-blur-sm grid place-items-center px-4" role="dialog" aria-modal>
        <div className="w-full max-w-sm bg-gradient-to-b from-[#2e1065] to-[#1a0533] border border-amber-300/40 rounded-[28px] p-6 text-center animate-pop shadow-2xl">
          {isWin ? (<>
            <div className="text-6xl animate-floaty">{result.emoji}</div>
            <p className="text-amber-300 font-black tracking-widest text-xs mt-2">🎉 CONGRATULATIONS! 🎉</p>
            <h3 className="text-3xl font-black mt-1">You Won<br />{result.name}!</h3>
            <p className="text-white/65 text-sm mt-2">{result.desc} • {result.value}</p>
            <div className="bg-white/[0.07] border border-white/10 rounded-2xl p-3 mt-4 text-xs text-white/60">Next: add your <b className="text-white">delivery address + email</b>, create your account, then share with <b className="text-amber-300">2 friends on WhatsApp</b> to confirm delivery. 🚚</div>
            <Link href="/shipping" className="block mt-4 bg-gradient-to-r from-amber-400 to-orange-500 text-[#2a0a00] font-black py-3.5 rounded-2xl">📦 Claim &amp; Enter Address →</Link>
            <button onClick={() => setShowResult(false)} className="mt-2 text-xs text-white/40 underline">View wheel</button>
          </>) : (<>
            <div className="text-6xl">🎆</div>
            <h3 className="text-2xl font-black mt-2">Better Luck Next Time!</h3>
            <p className="text-white/65 text-sm mt-2">You landed on <b>Try Again</b>. Thank you for celebrating Diwali with us — try again during our next Diwali promotion! 🪔</p>
            <Link href="/account" className="block mt-4 bg-amber-400 text-[#2a0a00] font-black py-3.5 rounded-2xl">Create Account to Get Notified →</Link>
            <button onClick={() => setShowResult(false)} className="mt-2 text-xs text-white/40 underline">Close</button>
          </>)}
          {entry && <p className="text-[10px] text-white/30 mt-3">Entry ID: {entry.id.slice(0, 8)}… • Secured server result • Cannot be changed</p>}
        </div>
      </div>
    )}
  </div>);
}
