"use client";

import { useId, useState } from "react";
import { inr, inrShort } from "@/lib/format";

export type Segment = { label: string; value: number; color: string };

export function Donut({ segments, center, sub, size = 200 }: { segments: Segment[]; center: string; sub?: string; size?: number }) {
  const total = segments.reduce((a, s) => a + Math.max(0, s.value), 0) || 1;
  const r = 70, c = 2 * Math.PI * r;
  const offsets = segments.reduce<number[]>((acc, s, i) => [...acc, (acc[i - 1] ?? 0) + (i ? (Math.max(0, segments[i - 1].value) / total) * c : 0)], []);
  return (
    <figure className="relative mx-auto" style={{ width: size, height: size }}>
      <svg viewBox="0 0 180 180" className="h-full w-full -rotate-90" role="img" aria-label={segments.map((s) => `${s.label} ${Math.round((s.value / total) * 100)}%`).join(", ")}>
        <circle cx="90" cy="90" r={r} fill="none" stroke="var(--line)" strokeWidth="18" />
        {segments.map((s, i) => {
          const len = (Math.max(0, s.value) / total) * c;
          const offset = offsets[i];
          return (
            <circle key={s.label} cx="90" cy="90" r={r} fill="none" stroke={s.color} strokeWidth="18"
              strokeDasharray={`${Math.max(0, len - 2)} ${c}`} strokeDashoffset={-offset} style={{ transition: "stroke-dasharray .4s ease, stroke-dashoffset .4s ease" }} />
          );
        })}
      </svg>
      <figcaption className="absolute inset-0 grid place-content-center text-center">
        <span className="font-display text-2xl font-bold">{center}</span>
        {sub && <span className="text-xs text-muted">{sub}</span>}
      </figcaption>
    </figure>
  );
}

export function SegmentBar({ segments, total }: { segments: Segment[]; total: number }) {
  const t = Math.max(total, segments.reduce((a, s) => a + s.value, 0)) || 1;
  return (
    <div className="flex h-4 w-full overflow-hidden rounded-full bg-line" role="img" aria-label="Breakdown of monthly income">
      {segments.map((s) => (
        <div key={s.label} title={`${s.label}: ${inr(s.value)}`} style={{ width: `${(s.value / t) * 100}%`, background: s.color, transition: "width .4s ease" }} />
      ))}
    </div>
  );
}

export type Series = { name: string; color: string; values: number[]; dashed?: boolean; fill?: boolean };

export function LineChart({ series, labels, height = 240, format = inrShort, markerY }: {
  series: Series[]; labels: string[]; height?: number; format?: (n: number) => string; markerY?: { value: number; label: string };
}) {
  const id = useId();
  const [hover, setHover] = useState<number | null>(null);
  const W = 640, H = height, padL = 56, padR = 12, padT = 12, padB = 28;
  const all = series.flatMap((s) => s.values).concat(markerY ? [markerY.value] : []);
  let min = Math.min(...all), max = Math.max(...all);
  if (min === max) { min -= 1; max += 1; }
  const pad = (max - min) * 0.08;
  min = Math.max(series.some((s) => s.fill) ? 0 : -Infinity, min - pad);
  max += pad;
  const n = labels.length;
  const x = (i: number) => padL + (i / Math.max(1, n - 1)) * (W - padL - padR);
  const y = (v: number) => padT + (1 - (v - min) / (max - min)) * (H - padT - padB);
  const ticks = [0, 0.25, 0.5, 0.75, 1].map((t) => min + t * (max - min));
  const step = Math.ceil(n / 6);

  return (
    <div className="relative w-full">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ height: "auto" }}
        onMouseLeave={() => setHover(null)}
        onMouseMove={(e) => {
          const rect = (e.currentTarget as SVGSVGElement).getBoundingClientRect();
          const px = ((e.clientX - rect.left) / rect.width) * W;
          const i = Math.round(((px - padL) / (W - padL - padR)) * (n - 1));
          setHover(Math.min(n - 1, Math.max(0, i)));
        }}
        role="img" aria-label={`Chart of ${series.map((s) => s.name).join(" and ")}`}
      >
        <defs>
          {series.map((s, i) => (
            <linearGradient key={i} id={`${id}-g${i}`} x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor={s.color} stopOpacity="0.3" />
              <stop offset="100%" stopColor={s.color} stopOpacity="0" />
            </linearGradient>
          ))}
        </defs>
        {ticks.map((t, i) => (
          <g key={i}>
            <line x1={padL} x2={W - padR} y1={y(t)} y2={y(t)} stroke="var(--line)" strokeDasharray="3 4" />
            <text x={padL - 8} y={y(t) + 4} textAnchor="end" fontSize="11" fill="var(--muted)">{format(t)}</text>
          </g>
        ))}
        {labels.map((l, i) => (i % step === 0 || i === n - 1) && (
          <text key={i} x={x(i)} y={H - 8} textAnchor="middle" fontSize="11" fill="var(--muted)">{l}</text>
        ))}
        {markerY && (
          <g>
            <line x1={padL} x2={W - padR} y1={y(markerY.value)} y2={y(markerY.value)} stroke="var(--warn)" strokeDasharray="6 4" />
            <text x={W - padR} y={y(markerY.value) - 6} textAnchor="end" fontSize="11" fill="var(--warn)">{markerY.label}</text>
          </g>
        )}
        {series.map((s, si) => {
          const d = s.values.map((v, i) => `${i ? "L" : "M"}${x(i)},${y(v)}`).join(" ");
          return (
            <g key={s.name}>
              {s.fill && <path d={`${d} L${x(s.values.length - 1)},${y(min)} L${x(0)},${y(min)} Z`} fill={`url(#${id}-g${si})`} />}
              <path d={d} fill="none" stroke={s.color} strokeWidth="2.5" strokeDasharray={s.dashed ? "6 5" : undefined} strokeLinejoin="round" />
            </g>
          );
        })}
        {hover !== null && (
          <g>
            <line x1={x(hover)} x2={x(hover)} y1={padT} y2={H - padB} stroke="var(--muted)" strokeOpacity="0.4" />
            {series.map((s) => <circle key={s.name} cx={x(hover)} cy={y(s.values[hover])} r="4" fill={s.color} stroke="var(--bg)" strokeWidth="2" />)}
          </g>
        )}
      </svg>
      {hover !== null && (
        <div className="pointer-events-none absolute top-2 rounded-lg border border-line bg-bg/95 px-3 py-2 text-xs shadow-xl"
          style={{ left: `${Math.min(70, (x(hover) / W) * 100)}%` }}>
          <p className="text-muted">{labels[hover]}</p>
          {series.map((s) => (
            <p key={s.name} className="flex items-center gap-2"><span className="h-2 w-2 rounded-full" style={{ background: s.color }} />{s.name}: <b className="tabular-nums">{inr(s.values[hover])}</b></p>
          ))}
        </div>
      )}
    </div>
  );
}

export function Legend({ items }: { items: { label: string; color: string; dashed?: boolean }[] }) {
  return (
    <ul className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted">
      {items.map((i) => (
        <li key={i.label} className="flex items-center gap-1.5">
          <span className="inline-block h-0.5 w-4 shrink-0" style={{ background: i.dashed ? `repeating-linear-gradient(90deg, ${i.color} 0 4px, transparent 4px 7px)` : i.color }} />
          {i.label}
        </li>
      ))}
    </ul>
  );
}
