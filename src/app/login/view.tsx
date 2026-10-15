"use client";

import { useEffect, useRef, useState, type FormEvent, type ReactNode } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Check, Download, KeyRound, LogOut, Mail, Smartphone, Sparkles, Trash2, Upload, UserRound, Zap } from "lucide-react";
import { Button, Card, Chips, Notice, PageHeader, Section } from "@/components/ui";
import { useStore, type AppState, type AuthMethod } from "@/lib/store";
import { LANGS, useT, type Key } from "@/lib/i18n";

const field = "mt-2 w-full rounded-xl border border-line bg-bg/60 px-3 py-2.5 outline-none transition focus:border-accent";

function GoogleIcon() {
  return (
    // Monochrome "G" so the palette stays emerald/amber only.
    <svg viewBox="0 0 48 48" className="h-5 w-5" aria-hidden fill="currentColor">
      <path d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z" />
    </svg>
  );
}
function AppleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden fill="currentColor">
      <path d="M16.4 12.6c0-2.5 2-3.7 2.1-3.8-1.2-1.7-3-1.9-3.6-2-1.5-.2-3 .9-3.8.9-.8 0-2-.9-3.3-.8-1.7 0-3.3 1-4.1 2.5-1.8 3.1-.5 7.6 1.3 10.1.8 1.2 1.8 2.6 3.1 2.5 1.2-.05 1.7-.8 3.2-.8s1.9.8 3.2.8c1.3 0 2.2-1.2 3-2.4.9-1.4 1.3-2.7 1.3-2.8-.03 0-2.5-1-2.5-3.9zM14 5.2c.7-.8 1.1-1.9 1-3-1 0-2.1.7-2.8 1.5-.6.7-1.2 1.8-1 2.9 1.1.1 2.1-.6 2.8-1.4z" />
    </svg>
  );
}

const METHODS: { key: AuthMethod; label: Key; icon: ReactNode; blurb: string }[] = [
  { key: "guest", label: "auth.guest", icon: <Zap className="h-5 w-5" />, blurb: "Sample numbers, nothing to type." },
  { key: "google", label: "auth.google", icon: <GoogleIcon />, blurb: "Demo of Google sign-in." },
  { key: "apple", label: "auth.apple", icon: <AppleIcon />, blurb: "Demo of Sign in with Apple." },
  { key: "phone", label: "auth.phone", icon: <Smartphone className="h-5 w-5" />, blurb: "Indian mobile number + OTP." },
  { key: "email", label: "auth.email", icon: <Mail className="h-5 w-5" />, blurb: "Classic email and password." },
];

const PREF_KEY = "zeno:auth-method";
const OLD_PREF_KEY = "honestly:auth-method";
function savePreferred(m: AuthMethod) {
  try { localStorage.setItem(PREF_KEY, m); } catch { /* storage unavailable */ }
}
function loadPreferred(): AuthMethod | null {
  try { return (localStorage.getItem(PREF_KEY) ?? localStorage.getItem(OLD_PREF_KEY)) as AuthMethod | null; } catch { return null; }
}

function useSignIn() {
  const { update } = useStore();
  return (method: AuthMethod, profile: { name?: string; email?: string; phone?: string }) => {
    savePreferred(method);
    if (method === "guest") return update("profile", { guest: true, signedIn: false, name: "Guest", authMethod: method });
    update("profile", { signedIn: true, guest: false, name: profile.name || "Friend", email: profile.email ?? "", phone: profile.phone ?? "", authMethod: method });
  };
}

function ProviderPanel({ method }: { method: "google" | "apple" }) {
  const t = useT();
  const signIn = useSignIn();
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);
  const go = () => {
    setBusy(true);
    // Simulated hand-off: a static demo has no OAuth server, so nothing leaves the browser.
    setTimeout(() => signIn(method, { name: name.trim() || (method === "google" ? "Google user" : "Apple user"), email: "" }), 700);
  };
  return (
    <div className="space-y-4">
      <label className="block text-sm font-medium">Display name (optional)
        <input className={field} value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" placeholder="How should we greet you?" />
      </label>
      <button onClick={go} disabled={busy}
        className={`flex w-full items-center justify-center gap-3 rounded-full py-3 text-sm font-semibold transition disabled:opacity-60 ${method === "google" ? "bg-white text-[#1f1f1f] hover:bg-white/90" : "bg-black text-white ring-1 ring-white/20 hover:bg-black/80"}`}>
        {method === "google" ? <GoogleIcon /> : <AppleIcon />}
        {busy ? "Connecting…" : t(method === "google" ? "auth.google" : "auth.apple")}
      </button>
      <Notice tone="info">Demo only: this simulates the {method === "google" ? "Google" : "Apple"} hand-off. No account is contacted and no data leaves your browser.</Notice>
    </div>
  );
}

function PhonePanel() {
  const t = useT();
  const signIn = useSignIn();
  const [phone, setPhone] = useState("");
  const [sent, setSent] = useState<string | null>(null);
  const [otp, setOtp] = useState("");
  const [wait, setWait] = useState(0);
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => {
    if (wait <= 0) return;
    const id = setTimeout(() => setWait(wait - 1), 1000);
    return () => clearTimeout(id);
  }, [wait]);

  const send = (e?: FormEvent) => {
    e?.preventDefault();
    if (!/^[6-9]\d{9}$/.test(phone)) return setMsg("Enter a 10-digit Indian mobile number starting with 6, 7, 8 or 9.");
    const code = String(Math.floor(100000 + Math.random() * 900000));
    setSent(code); setOtp(""); setWait(30); setMsg(null);
  };
  const verify = (e: FormEvent) => {
    e.preventDefault();
    if (otp !== sent) return setMsg("That code doesn't match. Check the 6 digits and try again.");
    signIn("phone", { name: `+91 ${phone.slice(0, 5)} ${phone.slice(5)}`, phone: `+91${phone}` });
  };

  return !sent ? (
    <form onSubmit={send} className="space-y-4" noValidate>
      <label className="block text-sm font-medium">Mobile number
        <div className="mt-2 flex items-center rounded-xl border border-line bg-bg/60 focus-within:border-accent">
          <span className="border-r border-line px-3 py-2.5 text-muted">🇮🇳 +91</span>
          <input inputMode="numeric" autoComplete="tel-national" value={phone} maxLength={10} placeholder="98765 43210"
            onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
            className="w-full bg-transparent px-3 py-2.5 tracking-wider tabular-nums outline-none" />
        </div>
      </label>
      {msg && <Notice tone="warn">{msg}</Notice>}
      <Button type="submit" className="w-full"><Smartphone className="h-4 w-4" /> {t("auth.sendOtp")}</Button>
    </form>
  ) : (
    <form onSubmit={verify} className="space-y-4" noValidate>
      <Notice tone="good">Demo OTP for +91 {phone}: <b className="font-display tracking-[0.3em] text-accent">{sent}</b><br /><span className="text-xs text-muted">A real app would send this by SMS. No message is sent here.</span></Notice>
      <label className="block text-sm font-medium">6-digit code
        <input inputMode="numeric" autoComplete="one-time-code" value={otp} maxLength={6} autoFocus
          onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
          className={`${field} text-center font-display text-2xl tracking-[0.5em] tabular-nums`} />
      </label>
      {msg && <Notice tone="warn">{msg}</Notice>}
      <Button type="submit" className="w-full" disabled={otp.length !== 6}><KeyRound className="h-4 w-4" /> {t("auth.verify")}</Button>
      <div className="flex justify-between text-xs">
        <button type="button" onClick={() => { setSent(null); setMsg(null); }} className="text-muted hover:text-fg">Change number</button>
        <button type="button" disabled={wait > 0} onClick={() => send()} className="text-accent disabled:text-muted">{wait > 0 ? `Resend in ${wait}s` : "Resend OTP"}</button>
      </div>
    </form>
  );
}

function EmailPanel() {
  const signIn = useSignIn();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (!/^\S+@\S+\.\S+$/.test(email)) return setMsg("Please enter a valid email address.");
    if (pw.length < 8) return setMsg("Password needs at least 8 characters.");
    // Demo only: nothing is sent anywhere and the password is never stored.
    signIn("email", { email, name: name || email.split("@")[0] });
  };
  return (
    <div>
      <div role="tablist" aria-label="Account" className="grid grid-cols-2 rounded-full border border-line p-1">
        {(["login", "signup"] as const).map((m) => (
          <button key={m} role="tab" aria-selected={mode === m} onClick={() => { setMode(m); setMsg(null); }}
            className={`rounded-full py-2 text-sm font-semibold transition ${mode === m ? "bg-accent text-on-accent" : "text-muted"}`}>
            {m === "login" ? "Log in" : "Sign up"}
          </button>
        ))}
      </div>
      <form onSubmit={submit} className="mt-5 space-y-4" noValidate>
        {mode === "signup" && <label className="block text-sm font-medium">Name<input className={field} value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" /></label>}
        <label className="block text-sm font-medium">Email<input className={field} type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" /></label>
        <label className="block text-sm font-medium">Password<input className={field} type="password" value={pw} onChange={(e) => setPw(e.target.value)} autoComplete={mode === "login" ? "current-password" : "new-password"} /></label>
        {msg && <Notice tone="warn">{msg}</Notice>}
        <Button type="submit" className="w-full">{mode === "login" ? "Log in" : "Create account"}</Button>
      </form>
    </div>
  );
}

function AuthForm() {
  const t = useT();
  const signIn = useSignIn();
  const { state } = useStore();
  const [last] = useState<AuthMethod | null>(() => (typeof window === "undefined" ? null : loadPreferred() ?? state.profile.authMethod));
  const [method, setMethod] = useState<AuthMethod>(last ?? "guest");
  const pick = (m: AuthMethod) => { setMethod(m); savePreferred(m); };

  return (
    <div className="mx-auto grid max-w-5xl gap-6 md:grid-cols-[1fr_1.2fr]">
      <div className="space-y-2" role="radiogroup" aria-label={t("auth.preferred")}>
        <p className="mb-3 text-xs font-semibold tracking-widest text-muted">{t("auth.preferred").toUpperCase()}</p>
        {METHODS.map((m) => (
          <motion.button key={m.key} role="radio" aria-checked={method === m.key} onClick={() => pick(m.key)} whileHover={{ x: 3 }}
            className={`card flex w-full items-center gap-4 p-4 text-left transition ${method === m.key ? "border-accent/60 bg-accent/5" : "hover:border-accent/30"}`}>
            <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl ${method === m.key ? "bg-accent text-on-accent" : "bg-fg/5 text-fg"}`}>{m.icon}</span>
            <span className="flex-1">
              <span className="flex flex-wrap items-center gap-2 text-sm font-semibold">{t(m.label)}
                {last === m.key && <span className="rounded-full bg-warn/15 px-2 py-0.5 text-[10px] font-semibold text-warn">{t("auth.lastUsed")}</span>}
              </span>
              <span className="text-xs text-muted">{m.blurb}</span>
            </span>
            {method === m.key && <Check className="h-4 w-4 text-accent" />}
          </motion.button>
        ))}
        <p className="pt-2 text-xs text-muted">Your choice is remembered in this browser (localStorage) so it&apos;s pre-selected next time.</p>
      </div>

      <Card className="relative overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div key={method} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}>
            <h2 className="text-2xl font-bold">{t(METHODS.find((m) => m.key === method)!.label)}</h2>
            <div className="mt-6">
              {method === "guest" && (
                <div className="space-y-5">
                  <div className="rounded-2xl border border-accent/30 bg-gradient-to-br from-accent/15 to-transparent p-5">
                    <UserRound className="h-8 w-8 text-accent" />
                    <p className="mt-3 text-sm text-muted">Guest mode loads sample numbers (₹45,000 income, ₹7,000 monthly saving) so you can try all 13 tools straight away. Change anything later.</p>
                  </div>
                  <Button className="w-full py-3" onClick={() => signIn("guest", {})}><Zap className="h-4 w-4" /> {t("auth.guest")}</Button>
                </div>
              )}
              {(method === "google" || method === "apple") && <ProviderPanel method={method} />}
              {method === "phone" && <PhonePanel />}
              {method === "email" && <EmailPanel />}
            </div>
          </motion.div>
        </AnimatePresence>
        <p className="mt-6 flex items-center gap-2 text-xs text-muted"><Sparkles className="h-3.5 w-3.5 text-accent" /> No real accounts exist. Everything stays in this browser.</p>
      </Card>
    </div>
  );
}

function Profile() {
  const { state, update, replace, reset } = useStore();
  const t = useT();
  const p = state.profile;
  const fileRef = useRef<HTMLInputElement>(null);
  const [msg, setMsg] = useState<{ tone: "good" | "bad"; text: string } | null>(null);
  const [confirm, setConfirm] = useState(false);
  const method = METHODS.find((m) => m.key === p.authMethod);

  const exportData = () => {
    const blob = new Blob([JSON.stringify(state, null, 2)], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "zeno-data.json";
    a.click();
    URL.revokeObjectURL(a.href);
    setMsg({ tone: "good", text: "Exported zeno-data.json." });
  };

  const importData = async (file: File) => {
    try {
      const data = JSON.parse(await file.text()) as AppState;
      if (!data || typeof data !== "object" || !("budget" in data) || !("plan" in data)) throw new Error();
      replace(data);
      setMsg({ tone: "good", text: "Data imported." });
    } catch {
      setMsg({ tone: "bad", text: "That file doesn't look like a Zeno export." });
    }
  };

  return (
    <div className="mx-auto grid max-w-4xl gap-6">
      <Card>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <span className="grid h-14 w-14 place-items-center rounded-full bg-accent font-display text-xl font-bold text-on-accent">{(p.name || "G")[0].toUpperCase()}</span>
            <div>
              <p className="font-display text-xl font-semibold">{p.name || "Guest"}</p>
              <p className="flex items-center gap-2 text-sm text-muted">
                {method?.icon && <span className="inline-grid h-4 w-4 place-items-center [&_svg]:h-4 [&_svg]:w-4">{method.icon}</span>}
                {p.signedIn ? p.email || p.phone || "Signed in (demo)" : "Guest session · demo data"}
              </p>
            </div>
          </div>
          <Button variant="outline" onClick={() => update("profile", { signedIn: false, guest: false })}><LogOut className="h-4 w-4" /> Sign out</Button>
        </div>
      </Card>

      <Card>
        <h2 className="text-xl font-bold">Preferences</h2>
        <div className="mt-5 grid gap-6 sm:grid-cols-2">
          <label className="block text-sm font-medium">Display name
            <input className={field} value={p.name} onChange={(e) => update("profile", { name: e.target.value })} />
          </label>
          <label className="block text-sm font-medium">{t("nav.language")}
            <select className={field} value={p.lang} onChange={(e) => update("profile", { lang: e.target.value as typeof p.lang })}>
              {LANGS.map((l) => <option key={l.code} value={l.code}>{l.native} · {l.label}</option>)}
            </select>
          </label>
          <label className="block text-sm font-medium">{t("auth.preferred")}
            <select className={field} value={p.authMethod ?? "guest"}
              onChange={(e) => { const m = e.target.value as AuthMethod; savePreferred(m); update("profile", { authMethod: m }); }}>
              {METHODS.map((m) => <option key={m.key} value={m.key}>{t(m.label)}</option>)}
            </select>
          </label>
          <label className="block text-sm font-medium">Default currency
            <select className={field} value={p.currency} onChange={() => update("profile", { currency: "INR" })}>
              <option value="INR">Indian Rupee (₹ INR)</option>
            </select>
          </label>
          <div className="sm:col-span-2">
            <p className="text-sm font-medium">Experience with money</p>
            <div className="mt-2">
              <Chips label="Experience" value={p.level} onChange={(v) => update("profile", { level: v })}
                options={[{ value: "new", label: "Brand new" }, { value: "some", label: "Some basics" }, { value: "confident", label: "Fairly confident" }]} />
            </div>
          </div>
          <label className="flex items-center justify-between gap-4 rounded-xl border border-line px-4 py-3 sm:col-span-2">
            <span><span className="block text-sm font-medium">Beginner tips</span><span className="text-xs text-muted">Show extra explanations across tools</span></span>
            <input type="checkbox" checked={p.tips} onChange={(e) => update("profile", { tips: e.target.checked })} className="h-5 w-5 accent-[var(--accent)]" />
          </label>
        </div>
      </Card>

      <Card>
        <h2 className="text-xl font-bold">Your data</h2>
        <p className="mt-1 text-sm text-muted">Everything is stored only in this browser. Export a backup, move it to another device, or wipe it.</p>
        <div className="mt-5 flex flex-wrap gap-3">
          <Button variant="outline" onClick={exportData}><Download className="h-4 w-4" /> Export JSON</Button>
          <Button variant="outline" onClick={() => fileRef.current?.click()}><Upload className="h-4 w-4" /> Import JSON</Button>
          <input ref={fileRef} type="file" accept="application/json,.json" className="hidden" onChange={(e) => e.target.files?.[0] && importData(e.target.files[0])} />
          {!confirm ? (
            <Button variant="outline" className="text-bad" onClick={() => setConfirm(true)}><Trash2 className="h-4 w-4" /> Reset all stored inputs</Button>
          ) : (
            <span className="flex items-center gap-2">
              <Button className="!bg-bad !text-white !shadow-none" onClick={() => { reset(); setConfirm(false); }}>Yes, reset everything</Button>
              <Button variant="ghost" onClick={() => setConfirm(false)}>Cancel</Button>
            </span>
          )}
        </div>
        {msg && <div className="mt-4"><Notice tone={msg.tone}>{msg.text}</Notice></div>}
      </Card>
    </div>
  );
}

export default function View() {
  const { state, ready } = useStore();
  const t = useT();
  const inSession = state.profile.signedIn || state.profile.guest;
  return (
    <>
      <PageHeader eyebrow="ACCOUNT · LANGUAGE · SIGN-IN" title={inSession ? "Your profile" : t("auth.title")}>
        {inSession ? "Manage your language, sign-in preference and locally stored data." : "Pick how you'd like to sign in. Guest, Google, Apple, phone OTP or email: all run as a private demo in your browser."}
      </PageHeader>
      <Section>{ready && (inSession ? <Profile /> : <AuthForm />)}</Section>
    </>
  );
}
