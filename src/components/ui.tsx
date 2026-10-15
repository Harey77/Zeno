"use client";

import { useEffect, useId, useRef, useState, type MouseEvent as ReactMouseEvent, type ReactNode } from "react";
import { animate, motion, useInView, useMotionValue, useReducedMotion, useSpring, useTransform } from "motion/react";
import { X } from "lucide-react";

export function PageHeader({ eyebrow, title, children }: { eyebrow: string; title: string; children?: ReactNode }) {
  return (
    <header className="relative overflow-hidden border-b border-line">
      <div className="glow pointer-events-none absolute inset-0" />
      <div className="grid-bg pointer-events-none absolute inset-0" />
      <div className="relative mx-auto max-w-6xl px-4 pb-10 pt-12 sm:px-6 sm:pt-16">
        <p className="text-xs font-semibold tracking-[0.18em] text-accent">{eyebrow}</p>
        <h1 className="mt-3 max-w-3xl text-3xl font-bold tracking-tight sm:text-5xl">{title}</h1>
        {children && <div className="mt-4 max-w-2xl text-muted sm:text-lg">{children}</div>}
      </div>
    </header>
  );
}

export function Section({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <section className={`mx-auto max-w-6xl px-4 py-10 sm:px-6 ${className}`}>{children}</section>;
}

export function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`card p-5 sm:p-6 ${className}`}>{children}</div>;
}

export function Stat({ label, value, sub, tone }: { label: string; value: ReactNode; sub?: ReactNode; tone?: "good" | "bad" | "warn" | "accent" }) {
  const color = tone === "good" ? "text-good" : tone === "bad" ? "text-bad" : tone === "warn" ? "text-warn" : tone === "accent" ? "text-accent" : "";
  return (
    <div className="card p-4 sm:p-5">
      <p className="text-xs text-muted sm:text-sm">{label}</p>
      <p className={`mt-1.5 font-display text-xl font-semibold tabular-nums sm:text-2xl ${color}`}>{value}</p>
      {sub && <p className="mt-1 text-xs text-muted">{sub}</p>}
    </div>
  );
}

export function Notice({ tone = "info", children }: { tone?: "info" | "warn" | "good" | "bad"; children: ReactNode }) {
  const map = {
    info: "border-accent/30 bg-accent/10",
    warn: "border-warn/30 bg-warn/10",
    good: "border-good/30 bg-good/10",
    bad: "border-bad/30 bg-bad/10",
  };
  return <div role="status" className={`rounded-xl border px-4 py-3 text-sm leading-relaxed ${map[tone]}`}>{children}</div>;
}

export function Button({
  children, onClick, variant = "primary", className = "", type = "button", disabled, ariaPressed,
}: {
  children: ReactNode; onClick?: () => void; variant?: "primary" | "ghost" | "outline"; className?: string;
  type?: "button" | "submit"; disabled?: boolean; ariaPressed?: boolean;
}) {
  const styles = {
    primary: "btn-accent",
    outline: "border border-line hover:border-accent/60 hover:bg-accent/5",
    ghost: "text-muted hover:text-fg hover:bg-fg/5",
  };
  return (
    <button
      type={type} onClick={onClick} disabled={disabled} aria-pressed={ariaPressed}
      className={`inline-flex items-center justify-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold transition disabled:opacity-40 ${styles[variant]} ${className}`}
    >
      {children}
    </button>
  );
}

/** Rupee number input that keeps the value numeric and non-negative. */
export function MoneyInput({ label, value, onChange, hint, max }: { label: string; value: number; onChange: (n: number) => void; hint?: string; max?: number }) {
  const id = useId();
  return (
    <label htmlFor={id} className="block">
      <span className="text-sm font-medium">{label}</span>
      {hint && <span className="mt-0.5 block text-xs text-muted">{hint}</span>}
      <div className="mt-2 flex items-center rounded-xl border border-line bg-bg/60 px-3 focus-within:border-accent">
        <span className="text-muted">₹</span>
        <input
          id={id} inputMode="numeric" value={value ? value.toLocaleString("en-IN") : ""} placeholder="0"
          onChange={(e) => {
            const n = Number(e.target.value.replace(/[^\d]/g, "")) || 0;
            onChange(max ? Math.min(n, max) : n);
          }}
          className="w-full bg-transparent px-2 py-2.5 font-display text-lg tabular-nums outline-none"
        />
      </div>
    </label>
  );
}

export function Slider({ label, value, min, max, step, onChange, format }: {
  label: string; value: number; min: number; max: number; step: number; onChange: (n: number) => void; format: (n: number) => string;
}) {
  const id = useId();
  return (
    <div>
      <div className="flex items-baseline justify-between gap-2">
        <label htmlFor={id} className="text-sm font-medium">{label}</label>
        <span className="font-display text-lg font-semibold tabular-nums text-accent">{format(value)}</span>
      </div>
      <input id={id} type="range" min={min} max={max} step={step} value={value} onChange={(e) => onChange(Number(e.target.value))} className="mt-3" />
      <div className="mt-1 flex justify-between text-xs text-muted"><span>{format(min)}</span><span>{format(max)}</span></div>
    </div>
  );
}

export function Chips<T extends string | number>({ options, value, onChange, label }: {
  options: { value: T; label: string }[]; value: T; onChange: (v: T) => void; label: string;
}) {
  return (
    <div role="group" aria-label={label} className="flex flex-wrap gap-2">
      {options.map((o) => (
        <button
          key={String(o.value)} type="button" aria-pressed={o.value === value} onClick={() => onChange(o.value)}
          className={`rounded-full border px-4 py-2 text-sm transition ${o.value === value ? "border-accent bg-accent/15 text-fg" : "border-line text-muted hover:border-accent/50 hover:text-fg"}`}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

export function Modal({ open, onClose, title, children }: { open: boolean; onClose: () => void; title: string; children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const prev = document.activeElement as HTMLElement | null;
    ref.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
      prev?.focus();
    };
  }, [open, onClose]);
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 p-0 backdrop-blur-sm sm:items-center sm:p-6" onClick={onClose}>
      <div
        ref={ref} role="dialog" aria-modal="true" aria-label={title} tabIndex={-1} onClick={(e) => e.stopPropagation()}
        className="card fade-in max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-b-none p-6 outline-none sm:rounded-b-[1.25rem] sm:p-8"
      >
        <div className="flex items-start justify-between gap-4">
          <h2 className="text-2xl font-bold">{title}</h2>
          <button onClick={onClose} aria-label="Close" className="rounded-full p-2 text-muted hover:bg-fg/5 hover:text-fg"><X className="h-5 w-5" /></button>
        </div>
        <div className="mt-4">{children}</div>
      </div>
    </div>
  );
}

export function Meter({ value, label }: { value: number; label: string }) {
  // value 1..5
  return (
    <div className="flex items-center gap-2" aria-label={`${label}: ${value} out of 5`}>
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((i) => (
          <span key={i} className={`h-2 w-5 rounded-full ${i <= value ? (value >= 4 ? "bg-bad" : value === 3 ? "bg-warn" : "bg-good") : "bg-line"}`} />
        ))}
      </div>
    </div>
  );
}

/** Number that eases from its previous value to the new one. `format` turns the in-between values into text. */
export function AnimatedNumber({ value, format, className = "" }: { value: number; format: (n: number) => string; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const from = useRef(0);
  const inView = useInView(ref, { once: true });
  const reduce = useReducedMotion();
  useEffect(() => {
    const el = ref.current;
    if (!el || !inView) return;
    if (reduce || !Number.isFinite(value)) { el.textContent = format(value); from.current = value; return; }
    const controls = animate(from.current, value, {
      type: "spring", stiffness: 70, damping: 18, restDelta: 0.5,
      onUpdate: (v) => { el.textContent = format(v); },
    });
    from.current = value;
    return () => controls.stop();
  }, [value, format, inView, reduce]);
  return <span ref={ref} className={`tabular-nums ${className}`}>{format(value)}</span>;
}

/** Floating 3D tilt card with a cursor-following emerald spotlight. */
export function SpotlightCard({ children, className = "", as = "div", tilt = 8 }: { children: ReactNode; className?: string; as?: "div" | "article"; tilt?: number }) {
  const Tag = as === "article" ? motion.article : motion.div;
  const reduce = useReducedMotion();
  const px = useMotionValue(0.5), py = useMotionValue(0.5);
  const spring = { stiffness: 220, damping: 20, mass: 0.6 };
  const rotateX = useSpring(useTransform(py, [0, 1], [tilt, -tilt]), spring);
  const rotateY = useSpring(useTransform(px, [0, 1], [-tilt, tilt]), spring);
  const onMove = (e: ReactMouseEvent<HTMLElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    e.currentTarget.style.setProperty("--mx", `${e.clientX - r.left}px`);
    e.currentTarget.style.setProperty("--my", `${e.clientY - r.top}px`);
    px.set((e.clientX - r.left) / r.width);
    py.set((e.clientY - r.top) / r.height);
  };
  const onLeave = () => { px.set(0.5); py.set(0.5); };
  return (
    <div style={{ perspective: 900 }}>
      <Tag onMouseMove={onMove} onMouseLeave={onLeave}
        style={reduce ? undefined : { rotateX, rotateY, transformStyle: "preserve-3d" }}
        whileHover={reduce ? undefined : { y: -4, scale: 1.01 }} transition={{ type: "spring", stiffness: 300, damping: 24 }}
        className={`card spotlight transition-colors hover:border-accent/40 hover:shadow-[0_24px_50px_-24px_rgba(0,245,155,0.35)] ${className}`}>
        {children}
      </Tag>
    </div>
  );
}

/** Pulls its child toward the cursor while hovered, then springs back. */
export function Magnetic({ children, strength = 0.35, className = "" }: { children: ReactNode; strength?: number; className?: string }) {
  const reduce = useReducedMotion();
  const x = useSpring(0, { stiffness: 250, damping: 15, mass: 0.4 });
  const y = useSpring(0, { stiffness: 250, damping: 15, mass: 0.4 });
  return (
    <motion.span
      className={`inline-flex ${className}`}
      style={reduce ? undefined : { x, y }}
      onMouseMove={(e) => {
        if (reduce) return;
        const r = e.currentTarget.getBoundingClientRect();
        x.set((e.clientX - (r.left + r.width / 2)) * strength);
        y.set((e.clientY - (r.top + r.height / 2)) * strength);
      }}
      onMouseLeave={() => { x.set(0); y.set(0); }}
      whileTap={{ scale: 0.96 }}
    >
      {children}
    </motion.span>
  );
}

/** Large INR input with quick-increment pills. Updates on every keystroke. */
export function InrInput({ label, value, onChange, steps = [500, 1000], resetTo, resetLabel = "Reset", max = 1e8, hint }: {
  label: string; value: number; onChange: (n: number) => void; steps?: number[]; resetTo?: number; resetLabel?: string; max?: number; hint?: string;
}) {
  const id = useId();
  const [focused, setFocused] = useState(false);
  const fmt = (n: number) => (n ? n.toLocaleString("en-IN") : "");
  return (
    <div>
      <label htmlFor={id} className="text-sm font-medium">{label}</label>
      {hint && <p className="mt-0.5 text-xs text-muted">{hint}</p>}
      <div className={`mt-2 flex items-center rounded-2xl border bg-bg/70 px-4 transition ${focused ? "border-accent shadow-[0_0_0_4px_rgba(0,245,155,0.12)]" : "border-line"}`}>
        <span className="font-display text-2xl text-accent">₹</span>
        <input
          id={id} inputMode="numeric" autoComplete="off" value={fmt(value)} placeholder="0"
          onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
          onChange={(e) => onChange(Math.min(max, Number(e.target.value.replace(/[^\d]/g, "")) || 0))}
          className="w-full bg-transparent px-2 py-3 font-display text-3xl font-semibold tabular-nums outline-none"
        />
        <span className="text-xs text-muted">/month</span>
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        {steps.map((s) => (
          <motion.button key={s} type="button" whileTap={{ scale: 0.94 }} onClick={() => onChange(Math.min(max, value + s))}
            className="rounded-full border border-accent/40 bg-accent/10 px-3.5 py-1.5 text-sm font-semibold text-accent transition hover:bg-accent/20">
            +₹{s.toLocaleString("en-IN")}
          </motion.button>
        ))}
        {resetTo !== undefined && (
          <motion.button type="button" whileTap={{ scale: 0.94 }} onClick={() => onChange(resetTo)}
            className="rounded-full border border-line px-3.5 py-1.5 text-sm text-muted transition hover:border-warn/50 hover:text-warn">
            {resetLabel}
          </motion.button>
        )}
      </div>
    </div>
  );
}
