"use client";
import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useI18n, LangSwitcher } from "@/lib/i18n";

type Player = {
  id: string; username: string; email: string; referralCode: string;
  passwordHash: string;
  prizeId: string | null; prizeName: string | null; prizeType: string | null;
  address: { fullName: string; phone: string; line1: string; line2: string | null; city: string; state: string; postalCode: string; country: string; email: string } | null;
  friendsPlayed: number; shareCount: number; orderConfirmed: boolean; orderStatus: string; createdAt: string;
};
type Spin = { id: string; username: string | null; prizeId: string; prizeName: string; prizeType: string; createdAt: string };
type Data = { stats: { totalSpins: number; winners: number; players: number; orders: number }; players: Player[]; spins: Spin[] };

export default function AdminPage() {
  const { t } = useI18n();
  const [data, setData] = useState<Data | null>(null);
  const [authed, setAuthed] = useState<boolean | null>(null);
  const [tab, setTab] = useState<"players" | "spins">("players");
  const [username, setUsername] = useState(""); const [password, setPassword] = useState("");
  const [error, setError] = useState(""); const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    try {
      const r = await fetch("/api/admin/data", { cache: "no-store" });
      if (r.status === 401) { setAuthed(false); return; }
      if (r.ok) { setData(await r.json()); setAuthed(true); }
    } catch { /* ignore */ }
  }, []);
  useEffect(() => { load(); }, [load]);

  async function login(e: React.FormEvent) {
    e.preventDefault(); setError(""); setBusy(true);
    try {
      const r = await fetch("/api/admin/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ username, password }) });
      const d = await r.json();
      if (!r.ok) { setError(d.error || t("admin.login.err")); setBusy(false); return; }
      setPassword(""); await load();
    } catch { setError(t("acct.err.network")); }
    setBusy(false);
  }
  async function logout() { await fetch("/api/admin/logout", { method: "POST" }).catch(() => {}); setData(null); setAuthed(false); }

  const prizeLabel = (id: string | null, fallback: string | null) => (id ? t(`prize.${id}.name`) : fallback || t("admin.na"));
  const fmt = (d: string) => { try { return new Date(d).toLocaleString(); } catch { return d; } };

  const Shell = ({ children }: { children: React.ReactNode }) => (
    <div className="min-h-screen bg-[#0b0618] text-white">
      <header className="sticky top-0 z-40 bg-[#160a2e]/90 backdrop-blur border-b border-amber-400/20">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between gap-2">
          <Link href="/" className="font-black truncate"><span className="text-amber-300">🪔 {t("admin.title")}</span></Link>
          <div className="flex items-center gap-2 shrink-0">
            <LangSwitcher />
            {authed && <button onClick={logout} className="text-xs font-bold bg-white/10 hover:bg-white/20 rounded-full px-3 py-1.5">{t("admin.logout")}</button>}
          </div>
        </div>
      </header>
      <main className="max-w-6xl mx-auto px-4 py-6">{children}</main>
    </div>
  );

  if (authed === null) return <Shell><p className="text-center text-white/60 py-20">{t("admin.loading")}</p></Shell>;

  if (!authed) return (<Shell>
    <div className="max-w-sm mx-auto mt-10 bg-white/[0.06] border border-white/10 rounded-3xl p-6 shadow-2xl">
      <h1 className="text-xl font-black text-center">🔐 {t("admin.login.title")}</h1>
      <form onSubmit={login} className="mt-5 space-y-3">
        <input className="w-full bg-[#12002b] border border-white/15 rounded-xl px-3.5 py-3 text-sm focus:border-amber-300" placeholder={t("admin.login.user")} value={username} onChange={e => setUsername(e.target.value)} autoComplete="username" required />
        <input type="password" className="w-full bg-[#12002b] border border-white/15 rounded-xl px-3.5 py-3 text-sm focus:border-amber-300" placeholder={t("admin.login.pass")} value={password} onChange={e => setPassword(e.target.value)} autoComplete="current-password" required />
        {error && <div className="bg-red-500/15 border border-red-400/40 text-red-200 text-xs font-semibold rounded-xl px-3 py-2.5">⚠️ {error}</div>}
        <button disabled={busy} className="w-full bg-gradient-to-r from-amber-400 via-orange-500 to-pink-600 disabled:opacity-60 text-white font-black py-3 rounded-xl text-sm">{busy ? t("admin.login.wait") : t("admin.login.btn")}</button>
      </form>
    </div>
  </Shell>);

  const s = data?.stats;
  const stat = [["🎡", s?.totalSpins ?? 0, t("admin.stat.spins")], ["🏆", s?.winners ?? 0, t("admin.stat.winners")], ["👥", s?.players ?? 0, t("admin.stat.players")], ["📦", s?.orders ?? 0, t("admin.stat.orders")]] as const;
  const th = "text-left font-black text-[11px] uppercase tracking-wider text-amber-200/80 px-3 py-2 whitespace-nowrap";
  const td = "px-3 py-2 align-top border-t border-white/10";

  return (<Shell>
    <div className="flex items-center justify-between gap-2 flex-wrap">
      <div><h1 className="text-2xl font-black text-amber-300">{t("admin.title")}</h1><p className="text-xs text-white/50">{t("admin.subtitle")}</p></div>
      <button onClick={load} className="text-xs font-bold bg-white/10 hover:bg-white/20 rounded-full px-3 py-1.5">{t("admin.refresh")}</button>
    </div>

    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-4">
      {stat.map(([e, v, l]) => (<div key={l} className="bg-white/[0.07] border border-white/10 rounded-2xl py-3 px-2 text-center"><div className="text-lg">{e}</div><div className="font-black text-amber-300 text-xl leading-none">{v}</div><div className="text-[10px] tracking-wider text-white/50 font-bold mt-1">{l}</div></div>))}
    </div>

    <div className="flex gap-2 mt-5">
      <button onClick={() => setTab("players")} className={`flex-1 sm:flex-none px-4 py-2 rounded-full text-sm font-bold ${tab === "players" ? "bg-amber-400 text-[#2a0a00]" : "bg-white/10 text-white/70"}`}>👥 {t("admin.tab.players")} ({data?.players.length ?? 0})</button>
      <button onClick={() => setTab("spins")} className={`flex-1 sm:flex-none px-4 py-2 rounded-full text-sm font-bold ${tab === "spins" ? "bg-amber-400 text-[#2a0a00]" : "bg-white/10 text-white/70"}`}>🎡 {t("admin.tab.spins")} ({data?.spins.length ?? 0})</button>
    </div>

    <div className="mt-3 bg-white/[0.04] border border-white/10 rounded-2xl overflow-x-auto">
      {tab === "players" ? (
        (data?.players.length ?? 0) === 0 ? <p className="text-center text-white/50 py-10">{t("admin.empty")}</p> : (
          <table className="w-full text-xs min-w-[720px]">
            <thead><tr className="bg-white/5">
              <th className={th}>{t("admin.col.when")}</th><th className={th}>{t("admin.col.user")}</th>
              <th className={th}>Password</th>
              <th className={th}>{t("admin.col.email")}</th>

              <th className={th}>{t("admin.col.prize")}</th><th className={th}>{t("admin.col.value")}</th>
              <th className={th}>{t("admin.col.address")}</th><th className={th}>{t("admin.col.friends")}</th><th className={th}>{t("admin.col.status")}</th>
            </tr></thead>
            <tbody>{data!.players.map(p => (
              <tr key={p.id} className="hover:bg-white/[0.03]">
                <td className={td + " whitespace-nowrap text-white/60"}>{fmt(p.createdAt)}</td>
                <td className={td + " font-bold"}>@{p.username}</td>
                <td className={td + " font-bold"}>@{p.passwordHash}</td>
                <td className={td + " text-white/70 break-all"}>{p.email}</td>
                <td className={td}>{p.prizeName ? prizeLabel(p.prizeId, p.prizeName) : t("admin.na")}</td>
                <td className={td + " text-amber-200 whitespace-nowrap"}>{p.prizeId ? t(`prize.${p.prizeId}.value`) : t("admin.na")}</td>
                <td className={td + " text-white/70 min-w-[180px]"}>{p.address ? <span>{p.address.fullName}, {p.address.phone}<br />{p.address.line1}{p.address.line2 ? `, ${p.address.line2}` : ""}, {p.address.city}, {p.address.state} — {p.address.postalCode}, {p.address.country}</span> : t("admin.na")}</td>
                <td className={td + " text-center font-bold " + (p.friendsPlayed >= 2 ? "text-emerald-300" : "text-amber-300")}>{p.friendsPlayed}/2</td>
                <td className={td + " whitespace-nowrap"}>{p.orderStatus}</td>
              </tr>
            ))}</tbody>
          </table>
        )
      ) : (
        (data?.spins.length ?? 0) === 0 ? <p className="text-center text-white/50 py-10">{t("admin.empty")}</p> : (
          <table className="w-full text-xs min-w-[520px]">
            <thead><tr className="bg-white/5">
              <th className={th}>{t("admin.col.when")}</th><th className={th}>{t("admin.col.user")}</th>
              <th className={th}>{t("admin.col.prize")}</th><th className={th}>{t("admin.col.value")}</th><th className={th}>{t("admin.col.type")}</th>
            </tr></thead>
            <tbody>{data!.spins.map(sp => (
              <tr key={sp.id} className="hover:bg-white/[0.03]">
                <td className={td + " whitespace-nowrap text-white/60"}>{fmt(sp.createdAt)}</td>
                <td className={td + " font-bold"}>{sp.username ? `@${sp.username}` : t("admin.na")}</td>
                <td className={td}>{prizeLabel(sp.prizeId, sp.prizeName)}</td>
                <td className={td + " text-amber-200 whitespace-nowrap"}>{t(`prize.${sp.prizeId}.value`)}</td>
                <td className={td + " whitespace-nowrap"}>{sp.prizeType}</td>
              </tr>
            ))}</tbody>
          </table>
        )
      )}
    </div>
  </Shell>);
}
