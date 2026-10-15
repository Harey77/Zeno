"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Check, ChevronDown, Languages, Menu, Moon, Sun, UserRound, X } from "lucide-react";
import { Logo } from "./logo";
import { NAV } from "@/lib/nav";
import { LANGS, useT } from "@/lib/i18n";
import { useStore } from "@/lib/store";
import { Magnetic } from "./ui";
import { useTheme } from "@/lib/theme";

function ThemeToggle() {
  const { theme, toggle } = useTheme();
  const dark = theme === "dark";
  return (
    <motion.button
      onClick={toggle} whileTap={{ scale: 0.9 }} role="switch" aria-checked={!dark}
      aria-label={dark ? "Switch to light mode" : "Switch to dark mode"} title={dark ? "Light mode" : "Dark mode"}
      className="relative grid h-9 w-9 place-items-center overflow-hidden rounded-full border border-line text-muted transition hover:border-accent/50 hover:text-accent"
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.span key={theme} initial={{ y: 14, rotate: -90, opacity: 0 }} animate={{ y: 0, rotate: 0, opacity: 1 }} exit={{ y: -14, rotate: 90, opacity: 0 }} transition={{ duration: 0.22 }}>
          {dark ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
        </motion.span>
      </AnimatePresence>
    </motion.button>
  );
}

function LanguageMenu() {
  const { state, update } = useStore();
  const t = useT();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const current = LANGS.find((l) => l.code === state.profile.lang) ?? LANGS[0];

  useEffect(() => {
    if (!open) return;
    const close = (e: MouseEvent) => { if (!ref.current?.contains(e.target as Node)) setOpen(false); };
    const esc = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", close);
    document.addEventListener("keydown", esc);
    return () => { document.removeEventListener("mousedown", close); document.removeEventListener("keydown", esc); };
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)} aria-haspopup="listbox" aria-expanded={open} aria-label={`${t("nav.language")}: ${current.label}`}
        className="flex items-center gap-1.5 rounded-full border border-line px-3 py-2 text-sm text-muted transition hover:border-accent/50 hover:text-fg"
      >
        <Languages className="h-4 w-4" /> <span className="hidden sm:inline">{current.native}</span>
        <ChevronDown className={`h-3.5 w-3.5 transition ${open ? "rotate-180" : ""}`} />
      </button>
      <AnimatePresence>
        {open && (
          <motion.ul
            role="listbox" aria-label={t("nav.language")}
            initial={{ opacity: 0, y: -6, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -6, scale: 0.98 }}
            transition={{ duration: 0.16 }}
            className="card absolute right-0 top-full z-50 mt-2 w-48 p-1.5"
          >
            {LANGS.map((l) => (
              <li key={l.code}>
                <button
                  role="option" aria-selected={l.code === current.code}
                  onClick={() => { update("profile", { lang: l.code }); setOpen(false); }}
                  className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm transition hover:bg-fg/5 ${l.code === current.code ? "text-accent" : ""}`}
                >
                  <span>{l.native} <span className="text-xs text-muted">· {l.label}</span></span>
                  {l.code === current.code && <Check className="h-4 w-4" />}
                </button>
              </li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  );
}

export function Navbar() {
  const path = usePathname();
  const [open, setOpen] = useState<string | null>(null);
  const [mobile, setMobile] = useState(false);
  const { state } = useStore();
  const t = useT();
  const who = state.profile.signedIn ? state.profile.name || "Profile" : state.profile.guest ? t("nav.guest") : t("nav.login");

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { setOpen(null); setMobile(false); }, [path]);

  const active = (href: string) => path === href || path === href.replace(/\/$/, "");

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-bg/75 backdrop-blur-xl">
      <nav className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3 sm:px-6" aria-label="Main">
        <Logo />
        <div className="hidden items-center gap-1 lg:flex" onMouseLeave={() => setOpen(null)}>
          <Link href="/dashboard/" className={`rounded-full px-3 py-2 text-sm ${active("/dashboard/") ? "text-accent" : "text-muted hover:text-fg"}`}>{t("nav.dashboard")}</Link>
          {NAV.map((g) => (
            <div key={g.group} className="relative" onMouseEnter={() => setOpen(g.group)}>
              <button
                aria-expanded={open === g.group} onClick={() => setOpen(open === g.group ? null : g.group)}
                className={`flex items-center gap-1 rounded-full px-3 py-2 text-sm ${g.items.some((i) => active(i.href)) ? "text-accent" : "text-muted hover:text-fg"}`}
              >
                {t(g.group)} <ChevronDown className={`h-3.5 w-3.5 transition ${open === g.group ? "rotate-180" : ""}`} />
              </button>
              <AnimatePresence>
                {open === g.group && (
                  <motion.div
                    initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }} transition={{ duration: 0.15 }}
                    className="absolute left-1/2 top-full w-72 -translate-x-1/2 pt-2"
                  >
                    <div className="card p-2">
                      {g.items.map((i) => (
                        <Link key={i.href} href={i.href} className={`block rounded-xl px-3 py-2.5 hover:bg-fg/5 ${active(i.href) ? "bg-accent/10" : ""}`}>
                          <span className={`block text-sm font-medium ${active(i.href) ? "text-accent" : ""}`}>{t(i.key)}</span>
                          <span className="block text-xs text-muted">{t(i.desc)}</span>
                        </Link>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <LanguageMenu />
          <Link href="/login/" className="hidden items-center gap-1.5 rounded-full px-3 py-2 text-sm text-muted hover:text-fg md:flex">
            <UserRound className="h-4 w-4" /> {who}
          </Link>
          <Magnetic className="hidden sm:inline-flex"><Link href="/planner/" className="btn-accent inline-flex rounded-full px-4 py-2 text-sm font-semibold transition">
            {t("nav.cta")}
          </Link></Magnetic>
          <button className="rounded-full p-2 text-muted hover:text-fg lg:hidden" aria-label={mobile ? "Close menu" : "Open menu"} aria-expanded={mobile} onClick={() => setMobile(!mobile)}>
            {mobile ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </nav>
      <AnimatePresence>
        {mobile && (
          <motion.div
            initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}
            className="max-h-[80vh] overflow-y-auto border-t border-line px-4 lg:hidden"
          >
            <div className="grid gap-1 pt-3">
              <Link href="/" className="rounded-lg px-3 py-2">{t("nav.home")}</Link>
              <Link href="/dashboard/" className="rounded-lg px-3 py-2">{t("nav.dashboard")}</Link>
              <Link href="/login/" className="rounded-lg px-3 py-2">{who}</Link>
              <Link href="/planner/" className="rounded-lg px-3 py-2 text-accent">{t("nav.cta")}</Link>
            </div>
            {NAV.map((g) => (
              <div key={g.group} className="mt-3 last:pb-6">
                <p className="px-3 text-xs font-semibold tracking-widest text-muted">{t(g.group).toUpperCase()}</p>
                {g.items.map((i) => <Link key={i.href} href={i.href} className="block rounded-lg px-3 py-2">{t(i.key)}</Link>)}
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
