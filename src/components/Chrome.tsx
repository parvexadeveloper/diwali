"use client";
import Link from "next/link";
export function Header() {
  return (<header className="sticky top-0 z-40 backdrop-blur-xl bg-[#1a0533]/85 border-b border-amber-400/20">
    <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
      <Link href="/" className="flex items-center gap-2 font-black tracking-tight"><span className="text-2xl animate-flicker">🪔</span><span className="bg-gradient-to-r from-amber-200 via-yellow-400 to-orange-400 bg-clip-text text-transparent">DIWALI SPIN &amp; WIN</span></Link>
      <nav className="flex items-center gap-1 text-xs sm:text-sm font-semibold">
        <Link href="/account" className="px-3 py-1.5 rounded-full hover:bg-white/10">👤 Account</Link>
      </nav>
    </div>
  </header>);
}
export function Footer() {
  return (<footer className="border-t border-white/10 mt-14"><div className="max-w-6xl mx-auto px-4 py-8 text-center text-xs text-white/50 space-y-2">
    <p className="text-2xl">🪔 ✨ 🎆 ✨ 🪔</p>
    <p><b className="text-amber-300">Diwali Spin &amp; Win</b> — A festive promotion. This is the promotion&apos;s own account system; we never ask for your Instagram password.</p>
    <p>Prizes are decided securely on the server and cannot be changed from the browser. Delivery is confirmed after 2 friends play via your personal link.</p>
    <p>Happy Diwali! May your year be filled with light, health &amp; prosperity. 🪔</p>
  </div></footer>);
}
export function Confetti({ fire }: { fire: boolean }) {
  if (!fire) return null;
  const pieces = Array.from({ length: 70 });
  return (<div className="fixed inset-0 pointer-events-none z-[90] overflow-hidden">{pieces.map((_, i) => {
    const left = (i * 37) % 100; const delay = (i % 12) * 0.12; const dur = 2.6 + (i % 5) * 0.4; const colors = ["#f59e0b","#ec4899","#22c55e","#38bdf8","#a78bfa","#fde047"];
    return (<span key={i} style={{ left: `${left}%`, background: colors[i % colors.length], animationDelay: `${delay}s`, animationDuration: `${dur}s`, transform: `rotate(${i * 47}deg)` }} className="absolute -top-4 w-2.5 h-4 rounded-[2px] confetti-piece" />); })}
    <style>{`@keyframes cfall{to{transform:translateY(110vh) rotate(720deg);opacity:.9}} .confetti-piece{animation-name:cfall;animation-timing-function:cubic-bezier(.2,.7,.4,1);animation-fill-mode:forwards}`}</style>
  </div>);
}
export function Steps({ current }: { current: 1 | 2 | 3 | 4 }) {
  const steps = [{ n: 1, l: "Spin", e: "🎡" }, { n: 2, l: "Address", e: "📦" }, { n: 3, l: "Account", e: "👤" }, { n: 4, l: "Share & Confirm", e: "💬" }];
  return (<div className="flex items-center justify-center gap-1 sm:gap-2 my-5">{steps.map((s, i) => (<div key={s.n} className="flex items-center gap-1 sm:gap-2"><div className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-full text-[11px] sm:text-xs font-bold border ${current >= s.n ? "bg-amber-400 text-[#2a0a00] border-amber-300" : "bg-white/5 text-white/50 border-white/10"}`}><span>{s.e}</span><span className="hidden xs:inline sm:inline">{s.l}</span></div>{i < steps.length - 1 && <span className="text-white/25">›</span>}</div>))}</div>);
}
