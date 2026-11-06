"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Header, Footer, Steps } from "@/components/Chrome";

export default function AccountPage() {
  const router = useRouter();
  const [mode, setMode] = useState<"register" | "login">("register");
  const [email, setEmail] = useState(""); const [password, setPassword] = useState(""); const [handle, setHandle] = useState("");
  const [showPw, setShowPw] = useState(false); const [error, setError] = useState(""); const [loading, setLoading] = useState(false);
  const [entry, setEntry] = useState<{ prizeName: string; prizeType: string } | null>(null);

  useEffect(() => {
    fetch("/api/me").then(r => { if (r.ok) router.replace("/success"); }).catch(() => {});
    setEmail(localStorage.getItem("diwali_shipping_email") || "");
    setHandle(localStorage.getItem("diwali_handle") || "");
    try { const e = JSON.parse(localStorage.getItem("diwali_entry") || "null"); if (e) setEntry(e); } catch {}
  }, [router]);

  async function submit(e: React.FormEvent) {
    e.preventDefault(); setError(""); setLoading(true);
    try {
      const spinEntryId = (() => { try { return JSON.parse(localStorage.getItem("diwali_entry") || "null")?.id || ""; } catch { return ""; } })();
      const url = mode === "register" ? "/api/auth/register" : "/api/auth/login";
      const body = mode === "register" ? { email, password, instagramHandle: handle, spinEntryId } : { email, password };
      const res = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Something went wrong."); setLoading(false); return; }
      if (data.user?.instagramHandle) localStorage.setItem("diwali_handle", data.user.instagramHandle);
      router.push("/success");
    } catch { setError("Network error. Please try again."); setLoading(false); }
  }

  const inputCls = "w-full bg-white border border-gray-300 rounded-lg px-3 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:border-gray-500";
  return (<div className="min-h-screen bg-[#1a0533] bg-[radial-gradient(ellipse_at_top,#4c1d95,#1a0533_65%)]"><Header />
    <main className="max-w-md mx-auto px-4 pb-10"><Steps current={3} />
      {entry && entry.prizeType !== "none" && <div className="text-center bg-amber-400/15 border border-amber-300/40 rounded-2xl px-4 py-3 text-sm mb-4 animate-pop">🎉 You won <b className="text-amber-300">{entry.prizeName}</b> — one last step! Create your account so we can deliver it. 📦</div>}
      {/* Social-login inspired clean card — OWN branding, NOT Instagram */}
      <div className="bg-white text-gray-900 rounded-[22px] shadow-2xl overflow-hidden animate-pop">
        <div className="bg-gradient-to-r from-amber-500 via-pink-600 to-purple-600 h-1.5" />
        <div className="px-7 pt-7 pb-5 text-center">
          <div className="text-4xl">🪔</div>
          <h1 className="text-[26px] font-black tracking-tight bg-gradient-to-r from-amber-600 via-pink-600 to-purple-700 bg-clip-text text-transparent mt-1">Diwali Spin &amp; Win</h1>
          <p className="text-xs text-gray-500 font-medium mt-1">{mode === "register" ? "Create your account to claim your gift 🎁" : "Sign in to view your prize & delivery status"}</p>
        </div>
        <div className="px-7 pb-2 flex bg-gray-50 border-y border-gray-200">
          <button onClick={() => { setMode("register"); setError(""); }} className={`flex-1 py-3 text-sm font-bold border-b-2 -mb-px ${mode === "register" ? "border-pink-600 text-gray-900" : "border-transparent text-gray-400"}`}>Create Account</button>
          <button onClick={() => { setMode("login"); setError(""); }} className={`flex-1 py-3 text-sm font-bold border-b-2 -mb-px ${mode === "login" ? "border-pink-600 text-gray-900" : "border-transparent text-gray-400"}`}>Sign In</button>
        </div>
        <form onSubmit={submit} className="px-7 py-5 space-y-3">
          {mode === "register" && (<div>
            <input className={inputCls} placeholder="Instagram username (@your_id) — one play per profile" value={handle} onChange={e => setHandle(e.target.value)} required maxLength={31} />
            <p className="text-[11px] text-gray-400 mt-1">Only your public @username. We will <b>never</b> ask for your Instagram password.</p>
          </div>)}
          <input type="email" className={inputCls} placeholder="Email address" value={email} onChange={e => setEmail(e.target.value)} required />
          <div className="relative">
            <input type={showPw ? "text" : "password"} className={inputCls} placeholder={mode === "register" ? "Create a password (min 6 chars)" : "Password"} value={password} onChange={e => setPassword(e.target.value)} required minLength={6} />
            <button type="button" onClick={() => setShowPw(s => !s)} className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-600">{showPw ? "Hide" : "Show"}</button>
          </div>
          {error && <div className="bg-red-50 border border-red-200 text-red-600 text-xs font-semibold rounded-lg px-3 py-2.5">⚠️ {error}</div>}
          <button disabled={loading} className="w-full bg-gradient-to-r from-amber-500 via-pink-600 to-purple-600 disabled:opacity-60 text-white font-bold py-3 rounded-xl text-sm shadow">{loading ? "Please wait… 🔒" : mode === "register" ? "Create Account & Claim Gift 🎁" : "Sign In →"}</button>
          <p className="text-[11px] text-gray-400 text-center leading-relaxed">🔒 Your password is saved only as a secure <b>bcrypt hash</b> — never in plain text. This is Diwali Spin &amp; Win&apos;s own account, not an Instagram login.</p>
        </form>
        <div className="px-7 pb-6 text-center text-sm text-gray-600 border-t border-gray-100 pt-4">
          {mode === "register" ? <>Already played? <button className="text-pink-600 font-bold" onClick={() => setMode("login")}>Sign in</button></> : <>New here? <button className="text-pink-600 font-bold" onClick={() => setMode("register")}>Create account</button></>}
        </div>
      </div>
      <p className="text-center text-xs text-white/40 mt-4">Forgot details? Use the same email you entered on the address page.<br /><Link href="/" className="underline">← Back to spin page</Link></p>
    </main><Footer /></div>);
}
