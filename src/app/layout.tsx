import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";
import Providers from "@/components/Providers";
export const metadata: Metadata = { title: "Diwali Spin & Win 🪔 — Spin, Win Gold, iPhone & Gifts", description: "Celebrate Diwali! Spin the wheel, win 1g Gold, Silver, iPhone 17, Android phone & gift boxes. Share with 2 friends on WhatsApp to confirm delivery." };
export default function RootLayout({ children }: { children: ReactNode }) {
  return (<html lang="en"><body className="bg-[#1a0533] text-white antialiased min-h-screen"><Providers>{children}</Providers></body></html>);
}
