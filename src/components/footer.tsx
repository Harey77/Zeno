"use client";

import Link from "next/link";
import { useState } from "react";
import { RotateCcw } from "lucide-react";
import { Logo } from "./logo";
import { NAV } from "@/lib/nav";
import { useStore } from "@/lib/store";
import { useT } from "@/lib/i18n";

export const DISCLAIMER =
  "Zeno is an educational financial-planning prototype. All simulations are illustrative and are not predictions or guarantees. Investments can lose value. This website does not provide personalised financial advice.";

export function Footer() {
  const { reset } = useStore();
  const t = useT();
  const [confirm, setConfirm] = useState(false);
  const [done, setDone] = useState(false);
  return (
    <footer className="mt-20 border-t border-line">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 sm:px-6 md:grid-cols-[1.2fr_2fr]">
        <div>
          <Logo />
          <p className="mt-3 max-w-xs text-sm text-muted">{t("footer.tagline")}</p>
          <div className="mt-5 flex flex-wrap items-center gap-2">
            {!confirm ? (
              <button onClick={() => { setConfirm(true); setDone(false); }} className="inline-flex items-center gap-2 rounded-full border border-line px-4 py-2 text-sm hover:border-accent/60">
                <RotateCcw className="h-4 w-4" /> Reset Demo Data
              </button>
            ) : (
              <>
                <span className="text-sm text-muted">Clear everything saved in this browser?</span>
                <button onClick={() => { reset(); setConfirm(false); setDone(true); }} className="rounded-full bg-bad/90 px-4 py-2 text-sm font-semibold text-white">Yes, reset</button>
                <button onClick={() => setConfirm(false)} className="rounded-full px-3 py-2 text-sm text-muted hover:text-fg">Cancel</button>
              </>
            )}
            {done && <span role="status" className="text-sm text-good">Demo data reset.</span>}
          </div>
        </div>
        <div className="grid grid-cols-2 gap-8 sm:grid-cols-4">
          <div>
            <p className="text-xs font-semibold tracking-widest text-muted">YOU</p>
            <ul className="mt-3 space-y-2 text-sm">
              <li><Link href="/" className="hover:text-accent">{t("nav.home")}</Link></li>
              <li><Link href="/dashboard/" className="hover:text-accent">{t("nav.dashboard")}</Link></li>
              <li><Link href="/login/" className="hover:text-accent">Login & Profile</Link></li>
            </ul>
          </div>
          {NAV.map((g) => (
            <div key={g.group}>
              <p className="text-xs font-semibold tracking-widest text-muted">{t(g.group).toUpperCase()}</p>
              <ul className="mt-3 space-y-2 text-sm">
                {g.items.map((i) => <li key={i.href}><Link href={i.href} className="hover:text-accent">{t(i.key)}</Link></li>)}
              </ul>
            </div>
          ))}
        </div>
      </div>
      <div className="border-t border-line">
        <p className="mx-auto max-w-6xl px-4 py-6 text-xs leading-relaxed text-muted sm:px-6">{t("footer.disclaimer")}</p>
      </div>
    </footer>
  );
}
