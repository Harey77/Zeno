"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import { useTheme } from "@/lib/theme";
import * as THREE from "three";

// Pointer in normalised device coords, written by a window listener because the canvas sits behind content.
const pointer = { x: 0, y: 0, active: 0 };

const GRID = 96;
const GAP = 0.34;
const PALETTE = {
  dark: { base: new THREE.Color("#00F59B"), hot: new THREE.Color("#E9FFF6"), fog: "#060C0A", wire: "#00F59B" },
  light: { base: new THREE.Color("#00A86B"), hot: new THREE.Color("#0B2E20"), fog: "#F4F7F5", wire: "#00A86B" },
};

function Field({ light }: { light: boolean }) {
  const { base: BASE, hot: HOT } = light ? PALETTE.light : PALETTE.dark;
  const ref = useRef<THREE.Points>(null);
  const hit = useRef(new THREE.Vector3(0, 0, 0));
  const ray = useMemo(() => new THREE.Raycaster(), []);
  const plane = useMemo(() => new THREE.Plane(new THREE.Vector3(0, 1, 0), 0), []);
  const ndc = useMemo(() => new THREE.Vector2(), []);
  const target = useMemo(() => new THREE.Vector3(), []);
  const lift = useRef(0);

  const { positions, colors } = useMemo(() => {
    const positions = new Float32Array(GRID * GRID * 3);
    const colors = new Float32Array(GRID * GRID * 3);
    const half = ((GRID - 1) * GAP) / 2;
    for (let i = 0; i < GRID; i++) {
      for (let j = 0; j < GRID; j++) {
        const k = (i * GRID + j) * 3;
        positions[k] = i * GAP - half;
        positions[k + 2] = j * GAP - half;
      }
    }
    return { positions, colors };
  }, []);

  useFrame(({ clock, camera }) => {
    const pts = ref.current;
    if (!pts) return;
    const t = clock.elapsedTime;

    ndc.set(pointer.x, pointer.y);
    ray.setFromCamera(ndc, camera);
    if (ray.ray.intersectPlane(plane, target)) hit.current.lerp(target, 0.12);
    lift.current += (pointer.active - lift.current) * 0.05;

    const pos = pts.geometry.attributes.position.array as Float32Array;
    const col = pts.geometry.attributes.color.array as Float32Array;
    const hx = hit.current.x, hz = hit.current.z;
    for (let k = 0; k < pos.length; k += 3) {
      const x = pos[k], z = pos[k + 2];
      const wave = Math.sin(x * 0.42 + t * 0.55) * 0.28 + Math.cos(z * 0.36 + t * 0.4) * 0.28;
      const d2 = (x - hx) ** 2 + (z - hz) ** 2;
      const bump = Math.exp(-d2 / 5) * lift.current;
      pos[k + 1] = wave + bump * 1.5;
      const glow = Math.min(1, bump * 1.2);
      const fade = 0.35 + 0.25 * (wave + 0.56);
      col[k] = (BASE.r + (HOT.r - BASE.r) * glow) * fade;
      col[k + 1] = (BASE.g + (HOT.g - BASE.g) * glow) * fade;
      col[k + 2] = (BASE.b + (HOT.b - BASE.b) * glow) * fade;
    }
    pts.geometry.attributes.position.needsUpdate = true;
    pts.geometry.attributes.color.needsUpdate = true;

    camera.position.x += (pointer.x * 1.2 - camera.position.x) * 0.03;
    camera.position.y += (4 + pointer.y * 0.6 - camera.position.y) * 0.03;
    camera.lookAt(0, 0, 0);
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-color" args={[colors, 3]} />
      </bufferGeometry>
      <pointsMaterial size={0.05} vertexColors transparent opacity={0.9} sizeAttenuation depthWrite={false} />
    </points>
  );
}

function Crystal({ color }: { color: string }) {
  const ref = useRef<THREE.Mesh>(null);
  useFrame(({ clock }) => {
    const m = ref.current;
    if (!m) return;
    const t = clock.elapsedTime;
    m.rotation.x = t * 0.12 + pointer.y * 0.4;
    m.rotation.y = t * 0.18 + pointer.x * 0.6;
    m.position.y = 2.6 + Math.sin(t * 0.8) * 0.18;
  });
  return (
    <mesh ref={ref} position={[4.6, 2.6, -3]}>
      <icosahedronGeometry args={[1.5, 1]} />
      <meshBasicMaterial color={color} wireframe transparent opacity={0.22} />
    </mesh>
  );
}

export default function ParticleField() {
  const { theme } = useTheme();
  const pal = PALETTE[theme];
  const reduce = typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  useEffect(() => {
    const move = (e: PointerEvent) => {
      pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
      pointer.y = -(e.clientY / window.innerHeight) * 2 + 1;
      pointer.active = 1;
    };
    const leave = () => { pointer.active = 0; };
    window.addEventListener("pointermove", move, { passive: true });
    document.addEventListener("pointerleave", leave);
    return () => { window.removeEventListener("pointermove", move); document.removeEventListener("pointerleave", leave); };
  }, []);

  return (
    <Canvas
      aria-hidden
      frameloop={reduce ? "demand" : "always"}
      dpr={[1, 1.5]}
      camera={{ position: [0, 4, 10], fov: 50, near: 0.1, far: 60 }}
      gl={{ antialias: false, alpha: true, powerPreference: "low-power" }}
      style={{ position: "absolute", inset: 0, pointerEvents: "none" }}
    >
      <fog attach="fog" args={[pal.fog, 7, 22]} />
      <Field light={theme === "light"} />
      <Crystal color={pal.wire} />
    </Canvas>
  );
}
