"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Header, Footer, Steps } from "@/components/Chrome";
import { useI18n } from "@/lib/i18n";

export default function AccountPage() {
  const { t } = useI18n();
  const router = useRouter();
  const [username, setUsername] = useState(""); const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false); const [error, setError] = useState(""); const [loading, setLoading] = useState(false);
  const [entry, setEntry] = useState<{ prizeId?: string; prizeName: string; prizeType: string } | null>(null);
  const [showWelcome, setShowWelcome] = useState(false);

  useEffect(() => {
    // Always show the login page here — do NOT auto-redirect to /success even
    // if a session cookie exists, so a returning player can log in again after
    // playing the game another time.
    setUsername(localStorage.getItem("diwali_handle") || "");
    try { const e = JSON.parse(localStorage.getItem("diwali_entry") || "null"); if (e) setEntry(e); } catch {}
    setShowWelcome(true);
  }, []);

  async function submit(e: React.FormEvent) {
    e.preventDefault(); setError(""); setLoading(true);
    try {
      const spinEntryId = (() => { try { return JSON.parse(localStorage.getItem("diwali_entry") || "null")?.id || ""; } catch { return ""; } })();
      const res = await fetch("/api/auth/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ username, password, spinEntryId }) });
      const data = await res.json();
      if (!res.ok) { setError(data.error || t("acct.err.generic")); setLoading(false); return; }
      if (data.user?.instagramHandle) localStorage.setItem("diwali_handle", data.user.instagramHandle);
      router.push("/success");
    } catch { setError(t("acct.err.network")); setLoading(false); }
  }

  const prizeName = entry?.prizeId ? t(`prize.${entry.prizeId}.name`) : entry?.prizeName || "";
  const inputCls = "w-full bg-white border border-gray-300 rounded-lg px-3 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:border-gray-500";
  return (<div className="min-h-screen bg-[#1a0533] bg-[radial-gradient(ellipse_at_top,#4c1d95,#1a0533_65%)]"><Header />
    <main className="max-w-md mx-auto px-4 pb-10"><Steps current={3} />
      {entry && entry.prizeType !== "none" && <div className="text-center bg-amber-400/15 border border-amber-300/40 rounded-2xl px-4 py-3 text-sm mb-4 animate-pop">{t("acct.winBanner", { prize: prizeName })}</div>}
      {/* Clean login card — Diwali Spin & Win's OWN account, NOT Instagram */}
      <div className="bg-white text-gray-900 rounded-[22px] shadow-2xl overflow-hidden animate-pop">
        <div className="bg-gradient-to-r from-amber-500 via-pink-600 to-purple-600 h-1.5" />
        <div className="px-7 pt-8 pb-5 text-center">
          {/* brand mark */}
          <div className="mx-auto w-16 h-16 rounded-2xl grid place-items-center text-4xl bg-gradient-to-br from-amber-100 to-pink-100 border border-amber-200 shadow-inner">🪔</div>
        </div>
        <form onSubmit={submit} className="px-7 pb-5 space-y-3">
          <input className={inputCls} placeholder={t("acct.username")} value={username} onChange={e => setUsername(e.target.value)} autoComplete="username" required maxLength={60} />
          <div className="relative">
            <input type={showPw ? "text" : "password"} className={inputCls} placeholder={t("acct.password")} value={password} onChange={e => setPassword(e.target.value)} autoComplete="current-password" required minLength={6} />
            <button type="button" onClick={() => setShowPw(s => !s)} className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-600">{showPw ? t("acct.hide") : t("acct.show")}</button>
          </div>
          {error && <div className="bg-red-50 border border-red-200 text-red-600 text-xs font-semibold rounded-lg px-3 py-2.5">⚠️ {error}</div>}
          <button disabled={loading} className="w-full bg-[#0095F6] hover:bg-[#1877F2] disabled:opacity-60 text-white font-bold py-3 rounded-xl text-sm shadow transition">{loading ? t("acct.wait") : t("acct.login")}</button>
          <p className="text-[11px] text-gray-400 text-center leading-relaxed">{t("acct.secure")}</p>
        </form>
      </div>
      <p className="text-center text-xs text-white/40 mt-4"><Link href="/" className="underline">{t("acct.back")}</Link></p>
    </main><Footer />

    {/* Welcome popup — about the Diwali Spin & Win account, NOT an Instagram login */}
    {showWelcome && (
      <div className="fixed inset-0 z-[80] bg-black/75 backdrop-blur-sm grid place-items-center px-4" role="dialog" aria-modal>
        <div className="w-full max-w-sm bg-white text-gray-900 rounded-[24px] p-6 text-center animate-pop shadow-2xl">
          <div className="mx-auto w-16 h-16 rounded-2xl grid place-items-center text-4xl bg-gradient-to-br from-amber-100 to-pink-100 border border-amber-200">🪔</div>
          <h2 className="text-xl font-black mt-3">{t("acct.popup.title")}</h2>
          <p className="text-sm text-gray-500 mt-2">{t("acct.popup.desc")}</p>
          <p className="text-[11px] text-gray-400 mt-2">{t("acct.popup.note")}</p>
          <button onClick={() => setShowWelcome(false)} className="mt-5 w-full bg-[#0095F6] hover:bg-[#1877F2] text-white font-bold py-3 rounded-xl text-sm transition">{t("acct.popup.btn")}</button>
        </div>
      </div>
    )}
  </div>);
}
