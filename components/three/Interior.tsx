"use client";

import { useMemo } from "react";
import { MeshReflectorMaterial, RoundedBox } from "@react-three/drei";
import * as THREE from "three";
import { City, Instanced, rng, Site } from "./Surroundings";
import { MOODS, SkyDome, type Mood } from "./Sky";

/**
 * Conceptual interiors (artist's impressions) in metres. Furniture and finishes are illustrative only.
 */
export type InteriorKind = "living" | "dining" | "lounge" | "lobby" | "terrace";

type V3 = [number, number, number];
const M = (p: V3, s: V3, rotY = 0, rotX = 0, rotZ = 0) =>
  new THREE.Matrix4().compose(new THREE.Vector3(...p), new THREE.Quaternion().setFromEuler(new THREE.Euler(rotX, rotY, rotZ)), new THREE.Vector3(...s));

/* ---------------- shared pieces ---------------- */

/** View out of the window: sky + city far below (tower units scaled to metres) */
function Outside({ mood, elevation }: { mood: Mood; elevation: number }) {
  return (
    <>
      <SkyDome mood={mood} radius={3000} />
      <group scale={19} position-y={-elevation}>
        <City mood={mood} lights={2200} />
        <City mood={mood} lights={0} inner={27} outer={120} density={0.55} seed={77} />
        <Site mood={mood} />
        <mesh rotation-x={-Math.PI / 2} position-y={-0.01}>
          <circleGeometry args={[160, 48]} />
          <meshBasicMaterial color={MOODS[mood].fog} />
        </mesh>
      </group>
    </>
  );
}

function Floor({ w, d, color, mirror = 0.5, roughness = 0.35, blur = 400 }: { w: number; d: number; color: string; mirror?: number; roughness?: number; blur?: number }) {
  return (
    <mesh rotation-x={-Math.PI / 2} receiveShadow>
      <planeGeometry args={[w, d]} />
      <MeshReflectorMaterial
        color={color}
        mirror={mirror}
        blur={[blur, blur / 3]}
        resolution={1024}
        mixBlur={1}
        mixStrength={1.4}
        roughness={roughness}
        metalness={0.05}
        depthScale={0}
      />
    </mesh>
  );
}

function Box({ p, s, color, rough = 0.6, metal = 0, rotY = 0, emissive, ei = 0 }: { p: V3; s: V3; color: string; rough?: number; metal?: number; rotY?: number; emissive?: string; ei?: number }) {
  return (
    <mesh position={p} rotation-y={rotY} castShadow receiveShadow>
      <boxGeometry args={s} />
      <meshStandardMaterial color={color} roughness={rough} metalness={metal} emissive={emissive ?? "#000"} emissiveIntensity={ei} />
    </mesh>
  );
}

/** Glow strip that blooms (cove lights, backlit panels) */
function Glow({ p, s, color = "#ffcf96", k = 2.5, rotY = 0 }: { p: V3; s: V3; color?: string; k?: number; rotY?: number }) {
  return (
    <mesh position={p} rotation-y={rotY}>
      <boxGeometry args={s} />
      <meshBasicMaterial color={new THREE.Color(color).multiplyScalar(k)} toneMapped={false} />
    </mesh>
  );
}

/** Full-height glazing with bronze mullions along x at depth z */
function WindowWall({ z, w, h, bay = 1.5, glass = true }: { z: number; w: number; h: number; bay?: number; glass?: boolean }) {
  const items = useMemo(() => {
    const out: { m: THREE.Matrix4 }[] = [];
    const n = Math.round(w / bay);
    for (let i = 0; i <= n; i++) out.push({ m: M([-w / 2 + (i * w) / n, h / 2, z], [0.06, h, 0.1]) });
    out.push({ m: M([0, h - 0.05, z], [w, 0.1, 0.12]) });
    out.push({ m: M([0, 0.04, z], [w, 0.08, 0.14]) });
    return out;
  }, [z, w, h, bay]);
  return (
    <>
      <Instanced items={items} shadows>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color="#3d3022" metalness={0.9} roughness={0.35} />
      </Instanced>
      {glass && (
        <mesh position={[0, h / 2, z]}>
          <planeGeometry args={[w, h]} />
          <meshBasicMaterial color="#c8d4dc" transparent opacity={0.025} depthWrite={false} />
        </mesh>
      )}
    </>
  );
}

/** Soft sheer curtain with folds */
function Curtain({ p, w, h, rotY = 0 }: { p: V3; w: number; h: number; rotY?: number }) {
  const geo = useMemo(() => {
    const g = new THREE.PlaneGeometry(w, h, 96, 1);
    const pos = g.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      pos.setZ(i, Math.sin(x * 14) * 0.035 + Math.sin(x * 5.3) * 0.02);
    }
    g.computeVertexNormals();
    return g;
  }, [w, h]);
  return (
    <mesh geometry={geo} position={p} rotation-y={rotY} castShadow receiveShadow>
      <meshStandardMaterial color="#efe8dc" roughness={1} side={THREE.DoubleSide} transparent opacity={0.88} />
    </mesh>
  );
}

function Sofa({ p, rotY = 0, length = 3, depth = 1, color = "#d8cdb9", cushions = ["#8b6a4a", "#2e2b28", "#c9b48f"] }: { p: V3; rotY?: number; length?: number; depth?: number; color?: string; cushions?: string[] }) {
  const fabric = <meshStandardMaterial color={color} roughness={0.95} />;
  const seats = 3;
  return (
    <group position={p} rotation-y={rotY}>
      <RoundedBox args={[length, 0.38, depth]} radius={0.05} smoothness={4} position={[0, 0.23, 0]} castShadow receiveShadow>
        {fabric}
      </RoundedBox>
      {Array.from({ length: seats }, (_, i) => (
        <RoundedBox key={i} args={[(length - 0.4) / seats - 0.02, 0.15, depth - 0.3]} radius={0.06} smoothness={4} position={[-(length - 0.4) / 2 + ((i + 0.5) * (length - 0.4)) / seats, 0.48, 0.12]} castShadow receiveShadow>
          {fabric}
        </RoundedBox>
      ))}
      <RoundedBox args={[length, 0.5, 0.24]} radius={0.08} smoothness={4} position={[0, 0.62, -depth / 2 + 0.12]} castShadow receiveShadow>
        {fabric}
      </RoundedBox>
      {[-1, 1].map((s) => (
        <RoundedBox key={s} args={[0.2, 0.6, depth]} radius={0.07} smoothness={4} position={[s * (length / 2 - 0.1), 0.34, 0]} castShadow receiveShadow>
          {fabric}
        </RoundedBox>
      ))}
      {cushions.map((c, i) => (
        <RoundedBox key={i} args={[0.46, 0.42, 0.14]} radius={0.07} smoothness={4} position={[-length / 2 + 0.55 + i * 0.5 + (i > 1 ? length - 2.1 : 0), 0.72, -depth / 2 + 0.3]} rotation={[-0.25, 0, (i - 1) * 0.12]} castShadow>
          <meshStandardMaterial color={c} roughness={0.9} />
        </RoundedBox>
      ))}
      {/* brass plinth */}
      <mesh position={[0, 0.02, 0]}>
        <boxGeometry args={[length - 0.1, 0.04, depth - 0.1]} />
        <meshStandardMaterial color="#9c7a49" metalness={1} roughness={0.3} />
      </mesh>
    </group>
  );
}

function Armchair({ p, rotY = 0, color = "#8a5a36" }: { p: V3; rotY?: number; color?: string }) {
  const mat = <meshStandardMaterial color={color} roughness={0.55} />;
  return (
    <group position={p} rotation-y={rotY}>
      <RoundedBox args={[0.85, 0.3, 0.85]} radius={0.08} smoothness={4} position={[0, 0.33, 0]} castShadow receiveShadow>
        {mat}
      </RoundedBox>
      <RoundedBox args={[0.85, 0.5, 0.18]} radius={0.08} smoothness={4} position={[0, 0.62, -0.34]} rotation-x={-0.12} castShadow>
        {mat}
      </RoundedBox>
      {[-1, 1].map((s) => (
        <RoundedBox key={s} args={[0.14, 0.32, 0.8]} radius={0.06} smoothness={4} position={[s * 0.38, 0.55, -0.02]} castShadow>
          {mat}
        </RoundedBox>
      ))}
      {[
        [-0.34, -0.34],
        [0.34, -0.34],
        [-0.34, 0.34],
        [0.34, 0.34],
      ].map(([x, z], i) => (
        <mesh key={i} position={[x, 0.09, z]} castShadow>
          <cylinderGeometry args={[0.015, 0.012, 0.18, 8]} />
          <meshStandardMaterial color="#9c7a49" metalness={1} roughness={0.3} />
        </mesh>
      ))}
    </group>
  );
}

function DiningChair({ p, rotY = 0, color = "#2f3b33" }: { p: V3; rotY?: number; color?: string }) {
  return (
    <group position={p} rotation-y={rotY}>
      <RoundedBox args={[0.5, 0.1, 0.5]} radius={0.04} smoothness={3} position={[0, 0.47, 0]} castShadow receiveShadow>
        <meshStandardMaterial color={color} roughness={0.85} />
      </RoundedBox>
      <RoundedBox args={[0.5, 0.48, 0.08]} radius={0.04} smoothness={3} position={[0, 0.74, -0.22]} castShadow>
        <meshStandardMaterial color={color} roughness={0.85} />
      </RoundedBox>
      {[
        [-0.21, -0.21],
        [0.21, -0.21],
        [-0.21, 0.21],
        [0.21, 0.21],
      ].map(([x, z], i) => (
        <mesh key={i} position={[x, 0.21, z]} castShadow>
          <cylinderGeometry args={[0.013, 0.01, 0.42, 8]} />
          <meshStandardMaterial color="#9c7a49" metalness={1} roughness={0.3} />
        </mesh>
      ))}
    </group>
  );
}

/** Instanced foliage: "olive" (tree with trunk) or "leafy" (tall broad leaves) */
function Plant({ p, height = 1.8, seed = 1, kind = "olive" }: { p: V3; height?: number; seed?: number; kind?: "olive" | "leafy" }) {
  const leaves = useMemo(() => {
    const r = rng(seed * 97 + 3);
    const out: { m: THREE.Matrix4; c: THREE.Color }[] = [];
    const greens = ["#56683d", "#6b7d4c", "#465a33", "#7a8b58"];
    const n = kind === "olive" ? 520 : 26;
    for (let i = 0; i < n; i++) {
      const c = new THREE.Color(greens[Math.floor(r() * greens.length)]);
      if (kind === "olive") {
        const a = r() * Math.PI * 2;
        const rad = Math.sqrt(r()) * height * 0.26;
        const y = height * (0.6 + r() * 0.38);
        out.push({ m: M([Math.cos(a) * rad, y, Math.sin(a) * rad], [0.045, 0.008, 0.018], r() * 6, r() * 2, r() * 2), c });
      } else {
        const a = r() * Math.PI * 2;
        const tilt = 0.25 + r() * 0.5;
        const len = height * (0.45 + r() * 0.35);
        const y = 0.45 + r() * height * 0.35;
        out.push({ m: M([Math.cos(a) * 0.12, y + len * 0.45, Math.sin(a) * 0.12], [0.16, len * 0.5, 0.02], -a + Math.PI / 2, 0, tilt), c });
      }
    }
    return out;
  }, [height, seed, kind]);
  return (
    <group position={p}>
      <mesh position-y={0.25} castShadow receiveShadow>
        <cylinderGeometry args={[0.3, 0.24, 0.5, 32]} />
        <meshStandardMaterial color="#3a3632" roughness={0.6} />
      </mesh>
      {kind === "olive" && (
        <mesh position-y={height * 0.4} rotation-z={0.08} castShadow>
          <cylinderGeometry args={[0.025, 0.045, height * 0.6, 8]} />
          <meshStandardMaterial color="#5a4a3a" roughness={0.9} />
        </mesh>
      )}
      <Instanced items={leaves} shadows>
        <icosahedronGeometry args={[1, 1]} />
        <meshStandardMaterial roughness={0.75} side={THREE.DoubleSide} />
      </Instanced>
    </group>
  );
}

function Pendant({ p, r = 0.28 }: { p: V3; r?: number }) {
  return (
    <group position={p}>
      <mesh position-y={0.8}>
        <cylinderGeometry args={[0.004, 0.004, 1.6, 4]} />
        <meshStandardMaterial color="#1a1a1a" />
      </mesh>
      <mesh rotation-x={Math.PI}>
        <sphereGeometry args={[r, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshStandardMaterial color="#b08d57" metalness={1} roughness={0.25} side={THREE.DoubleSide} />
      </mesh>
      <mesh position-y={-0.02} rotation-x={Math.PI / 2}>
        <circleGeometry args={[r * 0.92, 32]} />
        <meshBasicMaterial color={new THREE.Color("#ffe2b0").multiplyScalar(3)} toneMapped={false} side={THREE.DoubleSide} />
      </mesh>
      <pointLight position={[0, -0.25, 0]} color="#ffcf96" intensity={2.2} distance={6} decay={2} />
    </group>
  );
}

function FloorLamp({ p }: { p: V3 }) {
  return (
    <group position={p}>
      <mesh position-y={0.015}>
        <cylinderGeometry args={[0.16, 0.16, 0.03, 32]} />
        <meshStandardMaterial color="#9c7a49" metalness={1} roughness={0.3} />
      </mesh>
      <mesh position-y={0.7}>
        <cylinderGeometry args={[0.01, 0.01, 1.4, 8]} />
        <meshStandardMaterial color="#9c7a49" metalness={1} roughness={0.3} />
      </mesh>
      <mesh position-y={1.45}>
        <cylinderGeometry args={[0.2, 0.24, 0.32, 40, 1, true]} />
        <meshStandardMaterial color="#f1e6d2" emissive="#ffcf96" emissiveIntensity={1.4} side={THREE.DoubleSide} roughness={0.9} />
      </mesh>
      <pointLight position={[0, 1.4, 0]} color="#ffcf96" intensity={2.5} distance={6} decay={2} />
    </group>
  );
}

/** Abstract artwork texture (warm wash + gold strokes) — generated, not a real artwork */
const ART_PALETTE = ["#d9c7a6", "#a27b52", "#2b2724", "#c6a667"];
function useArt(seed = 3, palette = ART_PALETTE) {
  return useMemo(() => {
    const r = rng(seed);
    const c = document.createElement("canvas");
    c.width = 768;
    c.height = 512;
    const g = c.getContext("2d")!;
    const grd = g.createLinearGradient(0, 0, 768, 512);
    grd.addColorStop(0, palette[0]);
    grd.addColorStop(1, "#efe6d6");
    g.fillStyle = grd;
    g.fillRect(0, 0, 768, 512);
    for (let i = 0; i < 6; i++) {
      g.globalAlpha = 0.25 + r() * 0.4;
      g.fillStyle = palette[1 + Math.floor(r() * 2)];
      g.beginPath();
      g.arc(r() * 768, r() * 512, 60 + r() * 180, 0, Math.PI * 2);
      g.fill();
    }
    g.globalAlpha = 0.9;
    g.strokeStyle = palette[3];
    g.lineWidth = 6;
    for (let i = 0; i < 3; i++) {
      g.beginPath();
      g.moveTo(r() * 200, 100 + r() * 300);
      g.bezierCurveTo(200 + r() * 200, r() * 512, 400 + r() * 200, r() * 512, 600 + r() * 168, 100 + r() * 300);
      g.stroke();
    }
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    return t;
  }, [seed, palette]);
}

function Art({ p, w, h, rotY = 0, seed = 3 }: { p: V3; w: number; h: number; rotY?: number; seed?: number }) {
  const tex = useArt(seed);
  return (
    <group position={p} rotation-y={rotY}>
      <mesh position-z={-0.02} castShadow>
        <boxGeometry args={[w + 0.06, h + 0.06, 0.04]} />
        <meshStandardMaterial color="#9c7a49" metalness={1} roughness={0.3} />
      </mesh>
      <mesh position-z={0.001}>
        <planeGeometry args={[w, h]} />
        <meshStandardMaterial map={tex} roughness={0.9} />
      </mesh>
    </group>
  );
}

/** Vertical timber slats along a wall (x = const), facing +x or -x */
function Slats({ x, d, h, facing = 1, color = "#6b4a2f" }: { x: number; d: number; h: number; facing?: 1 | -1; color?: string }) {
  const items = useMemo(() => {
    const out: { m: THREE.Matrix4 }[] = [];
    for (let z = -d / 2 + 0.05; z <= d / 2; z += 0.09) out.push({ m: M([x + facing * 0.03, h / 2, z], [0.04, h, 0.045]) });
    return out;
  }, [x, d, h, facing]);
  return (
    <>
      <Instanced items={items} shadows>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color={color} roughness={0.55} />
      </Instanced>
      <mesh position={[x, h / 2, 0]} rotation-y={(facing * Math.PI) / 2}>
        <planeGeometry args={[d, h]} />
        <meshStandardMaterial color="#1c1612" roughness={0.9} />
      </mesh>
    </>
  );
}

/** Room shell: floor, ceiling with dropped panel + cove glow, side and back walls */
function Shell({
  w,
  d,
  h,
  floor,
  floorMirror = 0.45,
  wall = "#e9e3d8",
  ceiling = "#efebe4",
  cove = true,
  leftWall = true,
  rightWall = true,
}: {
  w: number;
  d: number;
  h: number;
  floor: string;
  floorMirror?: number;
  wall?: string;
  ceiling?: string;
  cove?: boolean;
  leftWall?: boolean;
  rightWall?: boolean;
}) {
  return (
    <>
      <Floor w={w} d={d} color={floor} mirror={floorMirror} />
      <mesh position-y={h} rotation-x={Math.PI / 2} receiveShadow>
        <planeGeometry args={[w, d]} />
        <meshStandardMaterial color={ceiling} roughness={0.9} />
      </mesh>
      {cove && (
        <>
          <mesh position={[0, h - 0.18, 0]} receiveShadow>
            <boxGeometry args={[w - 1.6, 0.14, d - 1.6]} />
            <meshStandardMaterial color={ceiling} roughness={0.9} />
          </mesh>
          {[-1, 1].map((s) => (
            <Glow key={`x${s}`} p={[0, h - 0.255, s * ((d - 1.6) / 2 + 0.01)]} s={[w - 1.6, 0.012, 0.012]} />
          ))}
          {[-1, 1].map((s) => (
            <Glow key={`z${s}`} p={[s * ((w - 1.6) / 2 + 0.01), h - 0.255, 0]} s={[0.012, 0.012, d - 1.6]} />
          ))}
        </>
      )}
      {leftWall && (
        <mesh position={[-w / 2, h / 2, 0]} rotation-y={Math.PI / 2} receiveShadow>
          <planeGeometry args={[d, h]} />
          <meshStandardMaterial color={wall} roughness={0.85} />
        </mesh>
      )}
      {rightWall && (
        <mesh position={[w / 2, h / 2, 0]} rotation-y={-Math.PI / 2} receiveShadow>
          <planeGeometry args={[d, h]} />
          <meshStandardMaterial color={wall} roughness={0.85} />
        </mesh>
      )}
      <mesh position={[0, h / 2, d / 2]} rotation-y={Math.PI} receiveShadow>
        <planeGeometry args={[w, h]} />
        <meshStandardMaterial color={wall} roughness={0.85} />
      </mesh>
      {/* skirting shadow gap */}
      <Box p={[0, 0.02, d / 2 - 0.01]} s={[w, 0.04, 0.02]} color="#2a2420" />
    </>
  );
}

function CoveLights({ w, d, h, k = 1 }: { w: number; d: number; h: number; k?: number }) {
  const pts: V3[] = [];
  for (const x of [-w / 3, 0, w / 3]) for (const z of [-d / 3, d / 4]) pts.push([x, h - 0.5, z]);
  return (
    <>
      {pts.map((p, i) => (
        <pointLight key={i} position={p} color="#ffd2a0" intensity={3.2 * k} distance={9} decay={2} />
      ))}
    </>
  );
}

/* ---------------- scenes ---------------- */

function Living({ mood }: { mood: Mood }) {
  const W = 9;
  const D = 7;
  const H = 3.2;
  return (
    <>
      <Outside mood={mood} elevation={78} />
      <Shell w={W} d={D} h={H} floor="#ddd5c8" wall="#ebe5da" />
      <WindowWall z={-D / 2} w={W} h={H} />
      <Curtain p={[-W / 2 + 0.55, H / 2 - 0.02, -D / 2 + 0.25]} w={1.0} h={H - 0.06} />
      <Curtain p={[W / 2 - 0.55, H / 2 - 0.02, -D / 2 + 0.25]} w={1.0} h={H - 0.06} />
      <Slats x={-W / 2} d={D} h={H} />
      {/* stone feature wall with art */}
      <mesh position={[W / 2 - 0.02, H / 2, 0]} rotation-y={-Math.PI / 2} receiveShadow>
        <planeGeometry args={[D, H]} />
        <meshStandardMaterial color="#d7cebf" roughness={0.45} />
      </mesh>
      <Art p={[W / 2 - 0.06, 1.75, 0.6]} w={1.9} h={1.2} rotY={-Math.PI / 2} />
      <Box p={[W / 2 - 0.3, 0.32, 0.6]} s={[0.45, 0.5, 2.6]} color="#5b3f28" rough={0.5} />
      <Box p={[W / 2 - 0.3, 0.575, 0.6]} s={[0.47, 0.02, 2.62]} color="#9c7a49" metal={1} rough={0.3} />
      <Plant p={[W / 2 - 0.35, 0.585, 1.5]} height={0.5} kind="leafy" seed={9} />

      {/* rug */}
      <mesh position={[-0.5, 0.006, -0.9]} rotation-x={-Math.PI / 2} receiveShadow>
        <planeGeometry args={[4.4, 3.1]} />
        <meshStandardMaterial color="#c4b69e" roughness={1} />
      </mesh>
      <mesh position={[-0.5, 0.005, -0.9]} rotation-x={-Math.PI / 2}>
        <planeGeometry args={[4.6, 3.3]} />
        <meshStandardMaterial color="#8a7a63" roughness={1} />
      </mesh>

      <Sofa p={[-2.55, 0, -0.9]} rotY={Math.PI / 2} length={3.1} />
      <Armchair p={[1.45, 0, -1.85]} rotY={-Math.PI / 2 - 0.35} />
      <Armchair p={[1.45, 0, 0.05]} rotY={-Math.PI / 2 + 0.2} />

      {/* nested coffee tables: marble tops, brass drums */}
      {[
        [-0.6, -1.15, 0.55, 0.38],
        [0.05, -0.45, 0.36, 0.3],
      ].map(([x, z, r, hh], i) => (
        <group key={i} position={[x, 0, z]}>
          <mesh position-y={hh / 2} castShadow receiveShadow>
            <cylinderGeometry args={[r * 0.6, r * 0.6, hh - 0.04, 48]} />
            <meshStandardMaterial color="#9c7a49" metalness={1} roughness={0.28} />
          </mesh>
          <mesh position-y={hh - 0.02} castShadow receiveShadow>
            <cylinderGeometry args={[r, r, 0.04, 64]} />
            <meshStandardMaterial color="#f1ede6" roughness={0.12} />
          </mesh>
        </group>
      ))}
      <Box p={[-0.75, 0.42, -1.2]} s={[0.36, 0.05, 0.26]} color="#2b2724" />
      <Box p={[-0.75, 0.465, -1.2]} s={[0.3, 0.04, 0.22]} color="#c9b48f" />
      <mesh position={[-0.35, 0.5, -1.0]} castShadow>
        <cylinderGeometry args={[0.06, 0.08, 0.2, 24]} />
        <meshStandardMaterial color="#2a2522" roughness={0.3} />
      </mesh>

      <FloorLamp p={[-3.75, 0, -2.75]} />
      <FloorLamp p={[-3.75, 0, 0.95]} />

      <Plant p={[-W / 2 + 0.75, 0, -D / 2 + 0.75]} height={2.3} seed={2} />
      <Plant p={[W / 2 - 0.7, 0, -D / 2 + 0.7]} height={1.7} kind="leafy" seed={5} />

      <CoveLights w={W} d={D} h={H} />
    </>
  );
}

function Dining({ mood }: { mood: Mood }) {
  const W = 12;
  const D = 9;
  const H = 3.6;
  const bottles = useMemo(() => {
    const r = rng(17);
    const out: { m: THREE.Matrix4; c: THREE.Color }[] = [];
    for (let shelf = 0; shelf < 4; shelf++)
      for (let z = -3.8; z < 2.8; z += 0.13 + r() * 0.06) {
        const h = 0.24 + r() * 0.12;
        out.push({ m: M([-W / 2 + 0.25, 1.05 + shelf * 0.5 + h / 2, z], [0.035, h, 0.035]), c: new THREE.Color(["#5a3a1a", "#2f4a2a", "#7a5a2a", "#c8b48a"][Math.floor(r() * 4)]) });
      }
    return out;
  }, []);
  const tables: V3[] = [
    [-1.6, 0, -2.4],
    [1.4, 0, -2.0],
    [-0.4, 0, 0.6],
  ];
  return (
    <>
      <Outside mood={mood} elevation={62} />
      <Shell w={W} d={D} h={H} floor="#3b2a1e" floorMirror={0.35} wall="#1f2a24" ceiling="#1d1a17" />
      <WindowWall z={-D / 2} w={W} h={H} bay={2} />
      {/* back-lit bar shelving on the left wall */}
      <mesh position={[-W / 2 + 0.01, 1.85, -0.5]} rotation-y={Math.PI / 2}>
        <planeGeometry args={[6.8, 2.2]} />
        <meshBasicMaterial color={new THREE.Color("#ffcf96").multiplyScalar(0.9)} toneMapped={false} />
      </mesh>
      {[0, 1, 2, 3, 4].map((i) => (
        <Box key={i} p={[-W / 2 + 0.25, 0.8 + i * 0.5, -0.5]} s={[0.5, 0.03, 6.8]} color="#9c7a49" metal={1} rough={0.3} />
      ))}
      <Instanced items={bottles}>
        <cylinderGeometry args={[1, 1, 1, 12]} />
        <meshStandardMaterial roughness={0.15} metalness={0.2} transparent opacity={0.85} />
      </Instanced>
      <Box p={[-W / 2 + 1.6, 0.55, -0.5]} s={[0.7, 1.1, 5.2]} color="#2b2420" rough={0.4} />
      <Box p={[-W / 2 + 1.6, 1.12, -0.5]} s={[0.8, 0.04, 5.3]} color="#e8e1d6" rough={0.15} />
      {/* velvet banquette on the right */}
      <RoundedBox args={[0.7, 0.48, 7]} radius={0.08} smoothness={4} position={[W / 2 - 0.4, 0.24, -0.6]} castShadow receiveShadow>
        <meshStandardMaterial color="#26392f" roughness={0.75} />
      </RoundedBox>
      <RoundedBox args={[0.25, 0.75, 7]} radius={0.08} smoothness={4} position={[W / 2 - 0.12, 0.85, -0.6]} castShadow>
        <meshStandardMaterial color="#26392f" roughness={0.75} />
      </RoundedBox>
      {[-3.2, -1.2, 0.8].map((z) => (
        <group key={z}>
          <mesh position={[W / 2 - 1.2, 0.74, z]} castShadow receiveShadow>
            <boxGeometry args={[0.8, 0.04, 0.8]} />
            <meshStandardMaterial color="#efe9df" roughness={0.6} />
          </mesh>
          <mesh position={[W / 2 - 1.2, 0.37, z]}>
            <cylinderGeometry args={[0.03, 0.03, 0.72, 8]} />
            <meshStandardMaterial color="#9c7a49" metalness={1} roughness={0.3} />
          </mesh>
          <DiningChair p={[W / 2 - 1.85, 0, z]} rotY={Math.PI / 2} color="#7a4e34" />
          <Pendant p={[W / 2 - 1.2, 1.9, z]} r={0.18} />
        </group>
      ))}
      {/* round tables with white linen */}
      {tables.map((t, i) => (
        <group key={i} position={t}>
          <mesh position-y={0.4} castShadow receiveShadow>
            <cylinderGeometry args={[0.62, 0.66, 0.78, 48, 1, true]} />
            <meshStandardMaterial color="#f3efe8" roughness={0.85} side={THREE.DoubleSide} />
          </mesh>
          <mesh position-y={0.79} castShadow receiveShadow>
            <cylinderGeometry args={[0.62, 0.62, 0.02, 48]} />
            <meshStandardMaterial color="#f6f2ea" roughness={0.85} />
          </mesh>
          <mesh position-y={0.84}>
            <cylinderGeometry args={[0.02, 0.02, 0.08, 12]} />
            <meshBasicMaterial color={new THREE.Color("#ffd9a0").multiplyScalar(2.5)} toneMapped={false} />
          </mesh>
          {[0, 1, 2, 3].map((k) => {
            const a = (k / 4) * Math.PI * 2 + 0.4;
            return <DiningChair key={k} p={[Math.sin(a) * 0.95, 0, Math.cos(a) * 0.95]} rotY={a + Math.PI} />;
          })}
          <Pendant p={[0, 2.0, 0]} />
        </group>
      ))}
      <Plant p={[-W / 2 + 0.9, 0, -D / 2 + 0.7]} height={2.1} kind="leafy" seed={4} />
      <Plant p={[W / 2 - 0.7, 0, -D / 2 + 0.7]} height={2.4} seed={8} />
      <CoveLights w={W} d={D} h={H} k={0.45} />
    </>
  );
}

function Lounge({ mood }: { mood: Mood }) {
  const W = 11;
  const D = 8;
  const H = 3.3;
  const chairs: [V3, number][] = [];
  for (let i = 0; i < 4; i++) {
    const x = -2.9 + i * 0.95;
    chairs.push([[x, 0, -1.55], 0]);
    chairs.push([[x, 0, -0.05], Math.PI]);
  }
  return (
    <>
      <Outside mood={mood} elevation={70} />
      <Shell w={W} d={D} h={H} floor="#b89a74" floorMirror={0.2} wall="#ece7de" />
      <WindowWall z={-D / 2} w={W} h={H} bay={1.375} />
      {/* meeting table */}
      <Box p={[-1.5, 0.74, -0.8]} s={[4.2, 0.05, 1.25]} color="#4a3322" rough={0.35} />
      {[-1, 1].map((s) => (
        <Box key={s} p={[-1.5 + s * 1.6, 0.36, -0.8]} s={[0.06, 0.72, 0.9]} color="#9c7a49" metal={1} rough={0.3} />
      ))}
      {chairs.map(([p, r], i) => (
        <DiningChair key={i} p={p} rotY={r} color="#3a3836" />
      ))}
      {/* linear pendant */}
      <Box p={[-1.5, 2.15, -0.8]} s={[3.4, 0.05, 0.08]} color="#9c7a49" metal={1} rough={0.3} />
      <Glow p={[-1.5, 2.12, -0.8]} s={[3.3, 0.01, 0.05]} color="#fff0d6" k={2} />
      {/* lounge corner */}
      <Armchair p={[3.0, 0, -2.4]} rotY={-0.6} color="#c9b48f" />
      <Armchair p={[3.6, 0, -0.7]} rotY={-Math.PI / 2 - 0.3} color="#c9b48f" />
      <mesh position={[2.6, 0.25, -1.1]} castShadow receiveShadow>
        <cylinderGeometry args={[0.35, 0.35, 0.5, 48]} />
        <meshStandardMaterial color="#2b2724" roughness={0.25} />
      </mesh>
      <Plant p={[W / 2 - 0.6, 0, -D / 2 + 0.6]} height={2.0} seed={6} />
      {/* credenza + art on the left wall */}
      <Box p={[-W / 2 + 0.3, 0.38, 0.6]} s={[0.45, 0.6, 3]} color="#4a3322" rough={0.4} />
      <Art p={[-W / 2 + 0.03, 1.7, 0.6]} w={1.8} h={1.1} rotY={Math.PI / 2} seed={11} />
      <CoveLights w={W} d={D} h={H} k={0.6} />
      {/* sunlight through the glazing */}
      <directionalLight position={[-7, 9, -14]} intensity={2.4} color="#fff1da" castShadow shadow-mapSize={[4096, 4096]} shadow-bias={-0.0003} shadow-camera-left={-9} shadow-camera-right={9} shadow-camera-top={9} shadow-camera-bottom={-9} shadow-camera-near={1} shadow-camera-far={40} />
    </>
  );
}

function Lobby({ mood }: { mood: Mood }) {
  const W = 16;
  const D = 16;
  const H = 7.5;
  const { fins, rods, tips, flutes } = useMemo(() => {
    const r = rng(29);
    const fins: { m: THREE.Matrix4 }[] = [];
    for (let x = -W / 2 + 0.2; x < W / 2; x += 0.32) fins.push({ m: M([x, H / 2, -D / 2 + 0.35], [0.05, H, 0.22]) });
    const rods: { m: THREE.Matrix4 }[] = [];
    const tips: { m: THREE.Matrix4 }[] = [];
    for (let i = 0; i < 420; i++) {
      const a = r() * Math.PI * 2;
      const rad = Math.sqrt(r()) * 2.4;
      const x = Math.cos(a) * rad;
      const z = -1.2 + Math.sin(a) * rad * 0.7;
      const len = 0.8 + (1 - rad / 2.4) * 2.2 + r() * 0.6;
      rods.push({ m: M([x, H - len / 2, z], [0.006, len, 0.006]) });
      tips.push({ m: M([x, H - len, z], [0.022, 0.022, 0.022]) });
    }
    const flutes: { m: THREE.Matrix4 }[] = [];
    for (let x = -2.4; x <= 2.4; x += 0.09) flutes.push({ m: M([x, 0.52, -D / 2 + 3.0], [0.045, 1.04, 0.045]) });
    return { fins, rods, tips, flutes };
  }, []);
  const logo = useMemo(() => {
    const c = document.createElement("canvas");
    c.width = 1024;
    c.height = 160;
    const g = c.getContext("2d")!;
    g.fillStyle = "#1a1714";
    g.fillRect(0, 0, 1024, 160);
    g.fillStyle = "#e5d2a0";
    g.font = "400 84px Georgia, serif";
    g.textAlign = "center";
    g.textBaseline = "middle";
    (g as CanvasRenderingContext2D & { letterSpacing?: string }).letterSpacing = "30px";
    g.fillText("THE SUMMIT", 527, 84);
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    return t;
  }, []);
  return (
    <>
      <Outside mood={mood} elevation={0.5} />
      <Shell w={W} d={D} h={H} floor="#e6dfd3" floorMirror={0.6} wall="#d9cfbf" ceiling="#2a241e" cove={false} rightWall={false} />
      {/* back-lit wall behind bronze fins */}
      <mesh position={[0, H / 2, -D / 2 + 0.02]}>
        <planeGeometry args={[W, H]} />
        <meshBasicMaterial color={new THREE.Color("#ffb877").multiplyScalar(0.42)} toneMapped={false} />
      </mesh>
      <Instanced items={fins} shadows>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color="#5a4630" metalness={1} roughness={0.35} />
      </Instanced>
      {/* logo panel */}
      <Box p={[0, 3.2, -D / 2 + 0.6]} s={[5.4, 1.1, 0.12]} color="#1a1714" rough={0.3} />
      <mesh position={[0, 3.2, -D / 2 + 0.665]}>
        <planeGeometry args={[5.2, 0.81]} />
        <meshStandardMaterial map={logo} emissiveMap={logo} emissive="#ffffff" emissiveIntensity={0.9} roughness={0.4} />
      </mesh>
      {/* reception desk: fluted travertine + dark marble top */}
      <Instanced items={flutes} shadows>
        <cylinderGeometry args={[1, 1, 1, 12]} />
        <meshStandardMaterial color="#d6c8ae" roughness={0.5} />
      </Instanced>
      <Box p={[0, 0.5, -D / 2 + 2.7]} s={[4.9, 1.0, 0.6]} color="#cdbfa6" rough={0.5} />
      <Box p={[0, 1.07, -D / 2 + 2.85]} s={[5.1, 0.06, 0.95]} color="#2b2522" rough={0.12} />
      {/* chandelier of brass rods */}
      <Instanced items={rods}>
        <cylinderGeometry args={[1, 1, 1, 4]} />
        <meshStandardMaterial color="#b08d57" metalness={1} roughness={0.25} />
      </Instanced>
      <Instanced items={tips}>
        <sphereGeometry args={[1, 8, 6]} />
        <meshBasicMaterial color={new THREE.Color("#ffe2b0").multiplyScalar(3.2)} toneMapped={false} />
      </Instanced>
      <pointLight position={[0, H - 2.5, -1.2]} color="#ffcf96" intensity={18} distance={20} decay={2} />
      {/* marble columns */}
      {[-4.2, 4.2].map((x) => (
        <mesh key={x} position={[x, H / 2, -2.5]} castShadow receiveShadow>
          <cylinderGeometry args={[0.45, 0.45, H, 48]} />
          <meshStandardMaterial color="#efe9e0" roughness={0.18} />
        </mesh>
      ))}
      {/* left wall: travertine with light slots */}
      {[-5, -1.5, 2, 5.5].map((z) => (
        <Glow key={z} p={[-W / 2 + 0.03, H / 2, z]} s={[0.02, H - 1.2, 0.08]} k={1.8} />
      ))}
      {/* right side: double-height glazing to the garden */}
      <group position={[W / 2, 0, 0]} rotation-y={Math.PI / 2}>
        <WindowWall z={0} w={D} h={H} bay={2} />
      </group>
      {/* seating */}
      <Sofa p={[-4.8, 0, 0.6]} rotY={Math.PI / 2} length={2.8} color="#cbbfa9" cushions={["#8b6a4a", "#26392f", "#c9b48f"]} />
      <Armchair p={[-2.6, 0, -0.2]} rotY={-Math.PI / 2 - 0.4} color="#26392f" />
      <Armchair p={[-2.6, 0, 1.4]} rotY={-Math.PI / 2 + 0.4} color="#26392f" />
      <mesh position={[-3.7, 0.22, 0.6]} castShadow receiveShadow>
        <cylinderGeometry args={[0.55, 0.55, 0.44, 48]} />
        <meshStandardMaterial color="#efe9e0" roughness={0.14} />
      </mesh>
      {/* floral centrepiece */}
      <group position={[-1.6, 0, -0.6]}>
        <mesh position-y={0.4} castShadow receiveShadow>
          <cylinderGeometry args={[0.6, 0.6, 0.8, 64]} />
          <meshStandardMaterial color="#2b2522" roughness={0.12} />
        </mesh>
        <Plant p={[0, 0.8, 0]} height={1.3} seed={13} />
      </group>
      <Plant p={[W / 2 - 1.0, 0, -D / 2 + 1.2]} height={3.2} seed={3} />
      <Plant p={[W / 2 - 1.0, 0, 3]} height={2.6} kind="leafy" seed={7} />
      <Plant p={[-W / 2 + 1.0, 0, -D / 2 + 1.2]} height={2.8} kind="leafy" seed={12} />
      <CoveLights w={W} d={D} h={H} k={1.4} />
    </>
  );
}

function useDeckTexture() {
  return useMemo(() => {
    const c = document.createElement("canvas");
    c.width = 512;
    c.height = 512;
    const g = c.getContext("2d")!;
    const r = rng(61);
    for (let i = 0; i < 16; i++) {
      const v = 0.85 + r() * 0.3;
      g.fillStyle = `rgb(${Math.round(150 * v)},${Math.round(108 * v)},${Math.round(74 * v)})`;
      g.fillRect(0, i * 32, 512, 30);
      g.fillStyle = "rgba(40,25,15,0.9)";
      g.fillRect(0, i * 32 + 30, 512, 2);
      g.fillRect(Math.floor(r() * 512), i * 32, 2, 30);
      for (let k = 0; k < 40; k++) {
        g.fillStyle = `rgba(60,38,20,${0.05 + r() * 0.1})`;
        g.fillRect(r() * 512, i * 32 + r() * 30, 30 + r() * 120, 1);
      }
    }
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.repeat.set(2, 1.2);
    t.anisotropy = 8;
    return t;
  }, []);
}

function Lounger({ p, rotY = 0 }: { p: V3; rotY?: number }) {
  return (
    <group position={p} rotation-y={rotY}>
      <RoundedBox args={[0.7, 0.12, 1.9]} radius={0.05} smoothness={4} position={[0, 0.3, 0.1]} castShadow receiveShadow>
        <meshStandardMaterial color="#e8e0d2" roughness={0.95} />
      </RoundedBox>
      <RoundedBox args={[0.7, 0.1, 0.75]} radius={0.05} smoothness={4} position={[0, 0.55, -0.95]} rotation-x={0.85} castShadow>
        <meshStandardMaterial color="#e8e0d2" roughness={0.95} />
      </RoundedBox>
      <mesh position={[0, 0.14, 0]} castShadow>
        <boxGeometry args={[0.66, 0.22, 1.8]} />
        <meshStandardMaterial color="#6b4a2f" roughness={0.6} />
      </mesh>
      <RoundedBox args={[0.42, 0.28, 0.12]} radius={0.05} smoothness={4} position={[0, 0.74, -0.78]} rotation-x={0.6} castShadow>
        <meshStandardMaterial color="#a27b52" roughness={0.9} />
      </RoundedBox>
    </group>
  );
}

/** Private terrace high above the city at dusk */
function Terrace({ mood }: { mood: Mood }) {
  const deck = useDeckTexture();
  const W = 8;
  const D = 4.4;
  const H = 3.2;
  return (
    <>
      <Outside mood={mood} elevation={88} />
      <mesh rotation-x={-Math.PI / 2} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[W, D]} />
        <meshStandardMaterial map={deck} roughness={0.7} />
      </mesh>
      <Box p={[0, -0.12, 0]} s={[W + 0.1, 0.22, D + 0.1]} color="#e7e1d5" />
      {/* soffit of the terrace above, with downlights */}
      <Box p={[0, H + 0.1, 0]} s={[W + 0.1, 0.22, D + 0.1]} color="#e7e1d5" />
      {[-3, -1, 1, 3].map((x) => (
        <Glow key={x} p={[x, H - 0.012, 0.4]} s={[0.12, 0.01, 0.12]} k={3} />
      ))}
      {[-2, 2].map((x) => (
        <pointLight key={x} position={[x, H - 0.4, 0.4]} color="#ffd2a0" intensity={2.2} distance={6} decay={2} />
      ))}
      {/* glass balustrade + gold rail */}
      <mesh position={[0, 0.55, -D / 2 + 0.03]}>
        <boxGeometry args={[W, 1.1, 0.02]} />
        <meshStandardMaterial color="#b9c8d0" metalness={0.5} roughness={0.05} transparent opacity={0.18} depthWrite={false} />
      </mesh>
      <Box p={[0, 1.12, -D / 2 + 0.03]} s={[W, 0.04, 0.06]} color="#c6a667" metal={1} rough={0.25} />
      <mesh position={[W / 2 - 0.03, 0.55, 0]} rotation-y={Math.PI / 2}>
        <boxGeometry args={[D, 1.1, 0.02]} />
        <meshStandardMaterial color="#b9c8d0" metalness={0.5} roughness={0.05} transparent opacity={0.18} depthWrite={false} />
      </mesh>
      <Box p={[W / 2 - 0.03, 1.12, 0]} s={[0.06, 0.04, D]} color="#c6a667" metal={1} rough={0.25} />
      {/* apartment glazing on the left, warmly lit inside */}
      <group position={[-W / 2, 0, 0]} rotation-y={-Math.PI / 2}>
        <WindowWall z={0} w={D} h={H} bay={1.1} glass={false} />
      </group>
      <mesh position={[-W / 2 - 0.05, H / 2, 0]} rotation-y={Math.PI / 2}>
        <planeGeometry args={[D, H]} />
        <meshBasicMaterial color={new THREE.Color("#ffcf96").multiplyScalar(0.55)} toneMapped={false} />
      </mesh>
      <Lounger p={[-1.7, 0, 0.1]} rotY={Math.PI} />
      <Lounger p={[-0.5, 0, 0.1]} rotY={Math.PI} />
      <mesh position={[-1.1, 0.22, -0.4]} castShadow receiveShadow>
        <cylinderGeometry args={[0.22, 0.22, 0.44, 32]} />
        <meshStandardMaterial color="#c6a667" metalness={1} roughness={0.3} />
      </mesh>
      <mesh position={[-1.1, 0.5, -0.4]}>
        <cylinderGeometry args={[0.05, 0.05, 0.12, 16]} />
        <meshBasicMaterial color={new THREE.Color("#ffd9a0").multiplyScalar(2.2)} toneMapped={false} />
      </mesh>
      <Plant p={[W / 2 - 0.6, 0, -D / 2 + 0.6]} height={2.0} seed={21} />
      <Plant p={[-W / 2 + 0.6, 0, -D / 2 + 0.55]} height={1.4} kind="leafy" seed={22} />
    </>
  );
}

export function InteriorScene({ kind, mood = "dusk" }: { kind: InteriorKind; mood?: Mood }) {
  const m = MOODS[mood];
  return (
    <>
      <fog attach="fog" args={[m.fog, 120, 2600]} />
      <hemisphereLight args={[m.hemiSky, "#3a2c20", mood === "day" ? 0.9 : kind === "terrace" ? 0.8 : 0.3]} />
      {kind === "terrace" && <Terrace mood={mood} />}
      {kind === "living" && <Living mood={mood} />}
      {kind === "dining" && <Dining mood={mood} />}
      {kind === "lounge" && <Lounge mood={mood} />}
      {kind === "lobby" && <Lobby mood={mood} />}
    </>
  );
}
