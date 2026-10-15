"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { useRef, useState, type PointerEvent as ReactPointerEvent } from "react";
import * as THREE from "three";
import { inr } from "@/lib/format";
import { useTheme } from "@/lib/theme";

type Props = { path: number[]; start: number; labels: string[] };

const THEMES = {
  dark: { emerald: "#00F59B", first: "#C9D3CE", grid: ["#15291f", "#0d1a15"] },
  light: { emerald: "#00A86B", first: "#4F6B5F", grid: ["#c9dcd2", "#e1ece6"] },
};
const RED = "#FF5C5C";
const AMBER = "#FFB800";
const GAP = 0.9;
const MAX_H = 4;

const runningPeaks = (path: number[]) => path.reduce<number[]>((acc, v, i) => [...acc, Math.max(v, acc[i - 1] ?? v)], []);

function Bar({ x, h, peakH, color, onHover, active }: { x: number; h: number; peakH: number; color: string; onHover: (on: boolean) => void; active: boolean }) {
  const bar = useRef<THREE.Mesh>(null);
  const ghost = useRef<THREE.Mesh>(null);
  useFrame(() => {
    const b = bar.current, g = ghost.current;
    if (!b || !g) return;
    // Ease heights so new moves "fall" or "rise" into place.
    b.scale.y += (Math.max(0.01, h) - b.scale.y) * 0.12;
    b.position.y = b.scale.y / 2;
    const gap = Math.max(0.001, peakH - b.scale.y);
    g.scale.y += (gap - g.scale.y) * 0.12;
    g.position.y = b.scale.y + g.scale.y / 2;
  });
  return (
    <group position={[x, 0, 0]}>
      <mesh ref={bar} scale={[1, 0.01, 1]} onPointerOver={(e) => { e.stopPropagation(); onHover(true); }} onPointerOut={() => onHover(false)}>
        <boxGeometry args={[0.6, 1, 0.6]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={active ? 0.9 : 0.35} roughness={0.35} metalness={0.2} />
      </mesh>
      {/* The amber ghost is the drawdown: distance from the running peak. */}
      <mesh ref={ghost} scale={[1, 0.001, 1]}>
        <boxGeometry args={[0.62, 1, 0.62]} />
        <meshStandardMaterial color={AMBER} transparent opacity={0.22} emissive={AMBER} emissiveIntensity={0.25} depthWrite={false} />
      </mesh>
    </group>
  );
}

function Scene({ path, start, hover, setHover, rot, pal }: Props & { pal: (typeof THEMES)["dark"]; hover: number | null; setHover: (i: number | null) => void; rot: React.RefObject<{ x: number; y: number }> }) {
  const group = useRef<THREE.Group>(null);
  const max = Math.max(...path, start);
  const scale = (v: number) => (v / max) * MAX_H;
  const offset = ((path.length - 1) * GAP) / 2;
  const peaks = runningPeaks(path);

  useFrame(() => {
    const g = group.current;
    if (!g || !rot.current) return;
    g.rotation.y += (rot.current.y - g.rotation.y) * 0.1;
    g.rotation.x += (rot.current.x - g.rotation.x) * 0.1;
  });

  return (
    <group ref={group}>
      {/* Starting value plane */}
      <mesh position={[0, scale(start), 0]} rotation-x={-Math.PI / 2}>
        <planeGeometry args={[path.length * GAP + 1.2, 2.2]} />
        <meshBasicMaterial color={pal.emerald} transparent opacity={0.07} side={THREE.DoubleSide} depthWrite={false} />
      </mesh>
      <gridHelper args={[Math.max(10, path.length * GAP + 2), 20, pal.grid[0], pal.grid[1]]} key={pal.first} position={[0, 0, 0]} />
      {path.map((v, i) => {
        const color = i === 0 ? pal.first : v < path[i - 1] ? RED : pal.emerald;
        return (
          <Bar key={i} x={i * GAP - offset} h={scale(v)} peakH={scale(peaks[i])} color={color} active={hover === i}
            onHover={(on) => setHover(on ? i : null)} />
        );
      })}
    </group>
  );
}

export default function Drawdown3D({ path, start, labels }: Props) {
  const { theme } = useTheme();
  const pal = THEMES[theme];
  const [hover, setHover] = useState<number | null>(null);
  const rot = useRef({ x: 0.08, y: -0.35 });
  const drag = useRef<{ x: number; y: number } | null>(null);

  const down = (e: ReactPointerEvent) => { drag.current = { x: e.clientX, y: e.clientY }; (e.target as HTMLElement).setPointerCapture?.(e.pointerId); };
  const move = (e: ReactPointerEvent) => {
    if (!drag.current) return;
    rot.current.y += (e.clientX - drag.current.x) * 0.008;
    rot.current.x = Math.max(-0.3, Math.min(0.6, rot.current.x + (e.clientY - drag.current.y) * 0.004));
    drag.current = { x: e.clientX, y: e.clientY };
  };
  const up = () => { drag.current = null; };

  const peaks = runningPeaks(path);
  const h = hover;

  return (
    <div className="relative h-80 w-full cursor-grab touch-none select-none active:cursor-grabbing sm:h-96"
      onPointerDown={down} onPointerMove={move} onPointerUp={up} onPointerLeave={up}
      role="img" aria-label={`3D bar chart of portfolio value after each move. Latest value ${inr(path.at(-1) ?? start)}.`}>
      <Canvas dpr={[1, 2]} camera={{ position: [0, 4.4, 10.8], fov: 45 }} gl={{ antialias: true, alpha: true }}>
        <ambientLight intensity={0.5} />
        <directionalLight position={[4, 8, 6]} intensity={1.1} />
        <pointLight position={[-6, 3, 4]} intensity={18} color={pal.emerald} />
        <group position={[0, -1.6, 0]}>
          <Scene path={path} start={start} labels={labels} hover={hover} setHover={setHover} rot={rot} pal={pal} />
        </group>
      </Canvas>
      <div className="pointer-events-none absolute left-3 top-3 rounded-lg border border-line bg-bg/85 px-3 py-2 text-xs backdrop-blur">
        {h === null ? (
          <span className="text-muted">Drag to rotate · hover a bar</span>
        ) : (
          <>
            <p className="text-muted">{labels[h]}</p>
            <p className="font-display text-sm font-semibold tabular-nums">{inr(path[h])}</p>
            {peaks[h] > path[h] && <p className="text-warn">−{(((peaks[h] - path[h]) / peaks[h]) * 100).toFixed(1)}% below peak</p>}
          </>
        )}
      </div>
      <div className="pointer-events-none absolute bottom-3 right-3 flex gap-3 text-[11px] text-muted">
        <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-sm bg-accent" />Up</span>
        <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-sm bg-bad" />Down</span>
        <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-sm bg-warn/50" />Drawdown from peak</span>
      </div>
    </div>
  );
}
