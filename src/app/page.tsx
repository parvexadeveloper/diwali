"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { PRIZES } from "@/lib/prizes";
import { Header, Footer, Confetti, Steps } from "@/components/Chrome";

type Entry = { id: string; prizeId: string; prizeName: string; prizeType: string };
const IMG1 = "https://images.pexels.com/photos/3135229/pexels-photo-3135229.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200";
const IMG2 = "https://images.pexels.com/photos/4078516/pexels-photo-4078516.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200";

// Wheel geometry (SVG viewBox 0 0 400 400). Slice i is centred at i*SEG degrees, clockwise from the top pointer.
const SEG = 360 / PRIZES.length;
const C = 200;
const pt = (deg: number, r: number) => { const a = (deg * Math.PI) / 180; return [C + r * Math.sin(a), C - r * Math.cos(a)]; };
function slicePath(i: number, r = 198) {
  const [x1, y1] = pt(i * SEG - SEG / 2, r); const [x2, y2] = pt(i * SEG + SEG / 2, r);
  return `M${C},${C} L${x1},${y1} A${r},${r} 0 ${SEG > 180 ? 1 : 0} 1 ${x2},${y2} Z`;
}
const BULBS = Array.from({ length: PRIZES.length * 4 }, (_, i) => pt((i * 360) / (PRIZES.length * 4), 191));

export default function SpinPage() {
  const [spinning, setSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [result, setResult] = useState<(typeof PRIZES)[number] | null>(null);
  const [entry, setEntry] = useState<Entry | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [error, setError] = useState("");
  const [stats, setStats] = useState<{ totalSpins: number; winners: number; players: number; orders: number; recent: { prizeName: string; handle: string; prizeType: string }[] } | null>(null);
  const [refBy, setRefBy] = useState("");

  useEffect(() => {
    const q = new URLSearchParams(window.location.search);
    const ref = q.get("ref") || q.get("referral") || "";
    if (ref) { localStorage.setItem("diwali_ref", ref); setRefBy(ref); } else setRefBy(localStorage.getItem("diwali_ref") || "");
    fetch("/api/stats").then(r => r.json()).then(setStats).catch(() => {});
  }, []);

  async function spin() {
    if (spinning) return;
    setError("");
    setSpinning(true); setShowResult(false); setResult(null);
    try {
      const res = await fetch("/api/spin", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ referredBy: refBy }) });
      const data = await res.json();
      if (!res.ok) { setSpinning(false); setError(data.error || "Something went wrong. Please try again."); return; }
      const prize = PRIZES.find(p => p.id === data.entry.prizeId) || data.prize;
      const idx = PRIZES.findIndex(p => p.id === prize.id);
      const jitter = (Math.random() - 0.5) * SEG * 0.6;
      setRotation(prev => { const base = Math.ceil(prev / 360) * 360; return base + 360 * 6 + ((360 - idx * SEG) % 360) + jitter; });
      localStorage.setItem("diwali_entry", JSON.stringify(data.entry));
      setEntry(data.entry); setResult(prize);
      setTimeout(() => { setSpinning(false); setShowResult(true); fetch("/api/stats").then(r => r.json()).then(setStats).catch(() => {}); }, 4600);
    } catch { setSpinning(false); setError("Network error. Please check your connection and try again."); }
  }

  const isWin = !!result;

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

      {/* WHEEL */}
      <section className="relative max-w-md mx-auto mt-7">
        <div className="absolute -inset-4 bg-gradient-to-r from-amber-500/40 via-pink-500/30 to-purple-500/40 rounded-full blur-2xl" aria-hidden />
        <div className="relative aspect-square wheel-shadow">
          {/* static golden rim with blinking bulbs */}
          <svg viewBox="0 0 400 400" className="absolute inset-0 w-full h-full" aria-hidden>
            <defs>
              <linearGradient id="rim" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#FEF3C7" /><stop offset=".35" stopColor="#F59E0B" /><stop offset=".65" stopColor="#B45309" /><stop offset="1" stopColor="#FDE68A" /></linearGradient>
            </defs>
            <circle cx={C} cy={C} r={199} fill="url(#rim)" />
            <circle cx={C} cy={C} r={184} fill="#2a0a4a" />
            {BULBS.map(([x, y], i) => (<circle key={i} cx={x} cy={y} r={4.2} fill={i % 2 ? "#FFF7ED" : "#FDE047"} className={`bulb ${i % 2 ? "bulb-alt" : ""} ${spinning ? "bulb-fast" : ""}`} />))}
          </svg>

          {/* rotating prize slices */}
          <div className="absolute inset-[8%] transition-transform ease-[cubic-bezier(.12,.8,.16,1)]" style={{ transform: `rotate(${rotation}deg)`, transitionDuration: spinning ? "4500ms" : "300ms" }}>
            <svg viewBox="0 0 400 400" className="w-full h-full overflow-visible">
              <defs>
                {PRIZES.map(p => (
                  <radialGradient key={p.id} id={`slice-${p.id}`} cx={C} cy={C} r={198} gradientUnits="userSpaceOnUse">
                    <stop offset=".2" stopColor={p.color2} /><stop offset=".7" stopColor={p.color} /><stop offset="1" stopColor={p.color2} />
                  </radialGradient>
                ))}
              </defs>
              {PRIZES.map((p, i) => (<path key={p.id} d={slicePath(i)} fill={`url(#slice-${p.id})`} stroke="#FDE68A" strokeWidth={3} />))}
              {PRIZES.map((p, i) => (
                <g key={p.id} transform={`rotate(${i * SEG} ${C} ${C})`} style={{ fill: p.textColor }}>
                  <text x={C} y={58} textAnchor="middle" fontSize={34}>{p.emoji}</text>
                  <text x={C} y={92} textAnchor="middle" fontSize={15} fontWeight={900} letterSpacing=".5">{p.short}</text>
                  <rect x={C - 48} y={101} width={96} height={22} rx={11} fill="rgba(26,5,51,.55)" stroke="rgba(253,230,138,.7)" strokeWidth={1} />
                  <text x={C} y={116.5} textAnchor="middle" fontSize={11} fontWeight={800} style={{ fill: "#FDE68A" }}>{p.value}</text>
                </g>
              ))}
            </svg>
          </div>

          {/* hub = spin button */}
          <button onClick={spin} disabled={spinning} aria-label="Spin the wheel" className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[24%] aspect-square rounded-full bg-[radial-gradient(circle_at_35%_30%,#FEF3C7,#F59E0B_45%,#92400E)] border-4 border-[#FFF7ED] shadow-[0_0_0_6px_rgba(42,10,74,.9),0_10px_30px_rgba(0,0,0,.6)] grid place-items-center text-[#3b0a00] font-black hover:scale-105 active:scale-95 disabled:hover:scale-100 transition">
            <span className="leading-none text-center"><span className="block text-xl sm:text-2xl">🪔</span><span className="block text-[11px] sm:text-sm tracking-widest">{spinning ? "…" : "SPIN"}</span></span>
          </button>

          {/* pointer */}
          <svg viewBox="0 0 40 52" className="absolute left-1/2 -translate-x-1/2 -top-3 w-[11%] z-20 drop-shadow-[0_4px_6px_rgba(0,0,0,.6)]" aria-hidden>
            <defs><linearGradient id="ptr" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#FFF7ED" /><stop offset=".5" stopColor="#F59E0B" /><stop offset="1" stopColor="#B91C1C" /></linearGradient></defs>
            <path d="M20 52 L3 18 A18 18 0 1 1 37 18 Z" fill="url(#ptr)" stroke="#FFF7ED" strokeWidth="2" />
            <circle cx="20" cy="18" r="6" fill="#2a0a4a" />
          </svg>
        </div>
      </section>

      {/* spin controls */}
      <div className="max-w-md mx-auto mt-6">
        {error && <div className="mb-3 bg-red-500/15 border border-red-400/40 text-red-200 text-xs font-semibold rounded-xl px-3 py-2.5">⚠️ {error}</div>}
        <button onClick={spin} disabled={spinning} className="w-full bg-gradient-to-r from-amber-400 via-orange-500 to-pink-600 disabled:opacity-60 text-white font-black text-lg tracking-wide py-4 rounded-2xl shadow-[0_10px_30px_rgba(245,158,11,.4)] active:scale-[.99] transition">
          {spinning ? "🎡 SPINNING… GOOD LUCK! ✨" : "✨ SPIN NOW — IT'S FREE ✨"}
        </button>
        <p className="text-center text-[11px] text-white/40 mt-2">🔒 Prize is decided securely on our server • Spin as many times as you like</p>
      </div>

      {/* prizes grid */}
      <h2 className="text-center font-black text-xl mt-10">🎁 <span className="text-amber-300">Prizes You Can Win</span></h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-w-3xl mx-auto mt-4">
        {PRIZES.map(p => (<div key={p.id} className="relative overflow-hidden rounded-3xl p-4 text-center border-2 border-amber-200/60 shadow-xl hover:-translate-y-1 transition" style={{ background: `linear-gradient(145deg, ${p.color}, ${p.color2})`, color: p.textColor }}><div className="absolute -top-6 -right-6 w-20 h-20 rounded-full bg-white/25 blur-xl" aria-hidden /><div className="text-4xl drop-shadow">{p.emoji}</div><div className="font-black mt-1.5 text-sm">{p.name}</div><div className="inline-block mt-1.5 text-[11px] font-black px-2.5 py-0.5 rounded-full bg-[#1a0533]/60 text-amber-200 border border-amber-200/50">{p.value}</div><div className="text-[11px] mt-1.5 opacity-80">{p.desc}</div></div>))}
      </div>

      {/* how it works */}
      <div className="max-w-3xl mx-auto mt-10 grid sm:grid-cols-4 gap-3 text-center">
        {[["1 🎡", "Spin the Wheel", "Spin as many times as you like"], ["2 📦", "Add Address", "Won a gift? Tell us where to deliver + email"], ["3 👤", "Create Account", "Your own Diwali Spin & Win account"], ["4 💬", "Share & Confirm", "WhatsApp 2 friends → order confirmed!"]].map(([t, d, s]) => (<div key={t} className="bg-gradient-to-b from-white/[0.08] to-white/[0.03] border border-white/10 rounded-3xl p-4"><div className="font-black text-amber-300">{t}</div><div className="font-bold text-sm mt-1">{d}</div><div className="text-[11px] text-white/50 mt-1">{s}</div></div>))}
      </div>

      <div className="max-w-3xl mx-auto mt-8 grid sm:grid-cols-2 gap-3">
        <img src={IMG1} alt="Diwali diyas celebration" className="rounded-3xl h-44 w-full object-cover border border-white/10" loading="lazy" />
        <img src={IMG2} alt="Diyas with marigold flowers Jaipur" className="rounded-3xl h-44 w-full object-cover border border-white/10 hidden sm:block" loading="lazy" />
      </div>

      {stats && stats.recent.length > 0 && (<div className="max-w-3xl mx-auto mt-8"><h3 className="font-black text-center text-sm tracking-wide text-white/80">🏆 RECENT RESULTS</h3><div className="mt-3 flex flex-wrap justify-center gap-2">{stats.recent.map((r, i) => (<span key={i} className="text-xs font-bold px-3 py-1.5 rounded-full border bg-amber-400/15 border-amber-300/30 text-amber-200">🎉 {r.handle} — {r.prizeName}</span>))}</div></div>)}
    </main>
    <Footer />

    {/* RESULT MODAL */}
    {showResult && result && (
      <div className="fixed inset-0 z-[80] bg-black/75 backdrop-blur-sm grid place-items-center px-4" role="dialog" aria-modal>
        <div className="w-full max-w-sm bg-gradient-to-b from-[#2e1065] to-[#1a0533] border border-amber-300/40 rounded-[28px] p-6 text-center animate-pop shadow-2xl">
          <div className="text-6xl animate-floaty">{result.emoji}</div>
          <p className="text-amber-300 font-black tracking-widest text-xs mt-2">🎉 CONGRATULATIONS! 🎉</p>
          <h3 className="text-3xl font-black mt-1">You Won<br />{result.name}!</h3>
          <p className="text-white/65 text-sm mt-2">{result.desc} • {result.value}</p>
          <div className="bg-white/[0.07] border border-white/10 rounded-2xl p-3 mt-4 text-xs text-white/60">Next: add your <b className="text-white">delivery address + email</b>, create your account, then share with <b className="text-amber-300">2 friends on WhatsApp</b> to confirm delivery. 🚚</div>
          <Link href="/shipping" className="block mt-4 bg-gradient-to-r from-amber-400 to-orange-500 text-[#2a0a00] font-black py-3.5 rounded-2xl">📦 Claim &amp; Enter Address →</Link>
          <button onClick={() => setShowResult(false)} className="mt-2 text-xs text-white/40 underline">View wheel</button>
          {entry && <p className="text-[10px] text-white/30 mt-3">Entry ID: {entry.id.slice(0, 8)}… • Secured server result • Cannot be changed</p>}
        </div>
      </div>
    )}
  </div>);
}
