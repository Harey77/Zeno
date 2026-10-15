"use client";

import Link from "next/link";
import { motion } from "motion/react";

/** "The Ascending Glyph": a Z whose base stroke breaks upward into a growth vector. */
export function ZenoMark({ size = 32, animate = true }: { size?: number; animate?: boolean }) {
  const draw = animate ? { initial: { pathLength: 0 }, animate: { pathLength: 1 } } : {};
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" aria-hidden>
      <defs>
        <linearGradient id="zeno-g" x1="6" y1="26" x2="27" y2="6" gradientUnits="userSpaceOnUse">
          <stop stopColor="#00B874" />
          <stop offset="1" stopColor="#00F59B" />
        </linearGradient>
      </defs>
      <rect x="0.75" y="0.75" width="30.5" height="30.5" rx="9" fill="#0B1712" stroke="rgba(0,245,155,0.35)" strokeWidth="1.5" />
      <motion.path d="M8 9h15.5L8.5 23.5h8.5L25 14.5" stroke="url(#zeno-g)" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round"
        {...draw} transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }} />
      <motion.path d="M19.8 14.2H25.3v5.5" stroke="#00F59B" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round"
        {...(animate ? { initial: { opacity: 0, x: -2, y: 2 }, animate: { opacity: 1, x: 0, y: 0 } } : {})} transition={{ delay: 0.75, duration: 0.35 }} />
    </svg>
  );
}

export function Logo() {
  return (
    <Link href="/" className="group flex items-center gap-2.5" aria-label="Zeno home">
      <motion.span whileHover={{ rotate: -6, scale: 1.06 }} transition={{ type: "spring", stiffness: 400, damping: 16 }}
        className="drop-shadow-[0_6px_18px_rgba(0,245,155,0.45)]">
        <ZenoMark />
      </motion.span>
      <span className="font-display text-xl font-bold tracking-tight">Zeno</span>
    </Link>
  );
}
