"use client";

import { useLayoutEffect, useMemo, useRef } from "react";
import { Environment, Lightformer } from "@react-three/drei";
import { Bloom, EffectComposer, N8AO, SMAA, ToneMapping, Vignette } from "@react-three/postprocessing";
import { ToneMappingMode } from "postprocessing";
import * as THREE from "three";
import { mergeVertices } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import { MOODS, type Mood } from "./Sky";

/** Subtle greyscale grain so large ground planes don't read as flat CG */
function useGrain(repeat: number) {
  return useMemo(() => {
    const c = document.createElement("canvas");
    c.width = c.height = 256;
    const g = c.getContext("2d")!;
    const r = rng(99);
    g.fillStyle = "#c8c8c8";
    g.fillRect(0, 0, 256, 256);
    for (let i = 0; i < 90; i++) {
      const v = 170 + Math.floor(r() * 70);
      g.fillStyle = `rgba(${v},${v},${v},0.35)`;
      g.beginPath();
      g.arc(r() * 256, r() * 256, 10 + r() * 40, 0, Math.PI * 2);
      g.fill();
    }
    for (let i = 0; i < 9000; i++) {
      const v = 140 + Math.floor(r() * 115);
      g.fillStyle = `rgb(${v},${v},${v})`;
      g.fillRect(r() * 256, r() * 256, 1, 1);
    }
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.repeat.set(repeat, repeat);
    t.anisotropy = 8;
    return t;
  }, [repeat]);
}

export function rng(seed: number) {
  let s = seed;
  return () => (s = (s * 16807) % 2147483647) / 2147483647;
}

type InstItem = { m: THREE.Matrix4; c?: THREE.Color };

/** Generic instanced mesh from a list of matrices (+ optional per-instance colours) */
export function Instanced({
  items,
  children,
  shadows = false,
}: {
  items: InstItem[];
  children: React.ReactNode;
  shadows?: boolean;
}) {
  const ref = useRef<THREE.InstancedMesh>(null);
  useLayoutEffect(() => {
    const m = ref.current;
    if (!m) return;
    items.forEach((it, i) => {
      m.setMatrixAt(i, it.m);
      if (it.c) m.setColorAt(i, it.c);
    });
    m.instanceMatrix.needsUpdate = true;
    if (m.instanceColor) m.instanceColor.needsUpdate = true;
    m.computeBoundingSphere();
  }, [items]);
  if (!items.length) return null;
  return (
    <instancedMesh ref={ref} args={[undefined, undefined, items.length]} frustumCulled={false} castShadow={shadows} receiveShadow={shadows}>
      {children}
    </instancedMesh>
  );
}

const Q0 = new THREE.Quaternion();
const Q90 = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), Math.PI / 2);
const mtx = (x: number, y: number, z: number, sx: number, sy: number, sz: number, q = Q0) =>
  new THREE.Matrix4().compose(new THREE.Vector3(x, y, z), q, new THREE.Vector3(sx, sy, sz));

/** Facade texture: concrete with window grid (map) + randomly lit rooms (emissiveMap) */
function useFacadeTextures() {
  return useMemo(() => {
    const W = 128;
    const H = 256;
    const mk = () => {
      const c = document.createElement("canvas");
      c.width = W;
      c.height = H;
      return c;
    };
    const base = mk();
    const lit = mk();
    const b = base.getContext("2d")!;
    const l = lit.getContext("2d")!;
    b.fillStyle = "#d9d4cb";
    b.fillRect(0, 0, W, H);
    l.fillStyle = "#000";
    l.fillRect(0, 0, W, H);
    const r = rng(5);
    const cols = 8;
    const rows = 16;
    for (let y = 0; y < rows; y++)
      for (let x = 0; x < cols; x++) {
        const px = x * (W / cols) + 3;
        const py = y * (H / rows) + 4;
        const w = W / cols - 6;
        const h = H / rows - 7;
        b.fillStyle = "#3b4048";
        b.fillRect(px, py, w, h);
        const k = r();
        if (k < 0.32) {
          const tone = ["#ffcf86", "#ffe0ad", "#ffc06a", "#fff1da"][Math.floor(r() * 4)];
          l.fillStyle = tone;
          l.globalAlpha = 0.55 + r() * 0.45;
          l.fillRect(px, py, w, h);
          l.globalAlpha = 1;
        }
      }
    const t1 = new THREE.CanvasTexture(base);
    const t2 = new THREE.CanvasTexture(lit);
    for (const t of [t1, t2]) {
      t.colorSpace = THREE.SRGBColorSpace;
      t.anisotropy = 8;
      t.wrapS = t.wrapT = THREE.RepeatWrapping;
    }
    return { map: t1, emissive: t2 };
  }, []);
}

/**
 * Scale facade UVs by each instance's real size so windows keep a constant (~3 m) pitch,
 * offset per building so lit patterns differ, and keep roofs plain.
 */
function patchFacadeUVs(shader: THREE.WebGLProgramParametersWithUniforms) {
  shader.vertexShader = shader.vertexShader.replace(
    "#include <uv_vertex>",
    /* glsl */ `#include <uv_vertex>
#ifdef USE_INSTANCING
  vec3 sc = vec3(length(instanceMatrix[0].xyz), length(instanceMatrix[1].xyz), length(instanceMatrix[2].xyz));
  float horiz = abs(normal.x) > 0.5 ? sc.z : sc.x;
  vec2 rep = vec2(horiz * 0.8, sc.y * 0.375);
  vec2 off = fract(instanceMatrix[3].xz * vec2(0.37, 0.61) + normal.xz * 0.21);
  vec2 fuv = uv * rep + vec2(off.x, floor(off.y * 8.0) / 16.0);
  if (abs(normal.y) > 0.5) fuv = vec2(0.005, 0.005);
  vMapUv = fuv;
  vEmissiveMapUv = fuv;
#endif`,
  );
}

// Road layout (tower units, ~1 unit ≈ 19 m)
export const ROAD_FRONT_Z = 2.45;
export const ROAD_SIDE_X = -2.95;
const onRoad = (x: number, z: number, pad = 0.6) => Math.abs(z - ROAD_FRONT_Z) < 0.45 + pad || Math.abs(x - ROAD_SIDE_X) < 0.35 + pad;

/** distance from point to segment a→b (xz) */
function segDist(px: number, pz: number, ax: number, az: number, bx: number, bz: number) {
  const vx = bx - ax;
  const vz = bz - az;
  const t = Math.max(0, Math.min(1, ((px - ax) * vx + (pz - az) * vz) / (vx * vx + vz * vz)));
  return Math.hypot(px - (ax + t * vx), pz - (az + t * vz));
}

/** Generic low/mid-rise city on a street grid. Not a model of any real neighbourhood. */
export function City({
  mood = "night",
  lights = 1400,
  density = 1,
  inner = 3.6,
  outer = 27,
  seed = 23,
  viewFrom,
}: {
  mood?: Mood;
  lights?: number;
  density?: number;
  blocks?: number;
  inner?: number;
  outer?: number;
  seed?: number;
  /** keep a clear sight-line (open ground / boulevard) from this xz point to the tower */
  viewFrom?: [number, number];
}) {
  const m = MOODS[mood];
  const tex = useFacadeTextures();

  const blocks = useMemo(() => {
    const r = rng(seed);
    const out: InstItem[] = [];
    const step = 1.25;
    const n = Math.ceil(outer / step);
    for (let gx = -n; gx <= n; gx++)
      for (let gz = -n; gz <= n; gz++) {
        if (gx % 4 === 0 || gz % 4 === 0) continue; // secondary streets
        const x = gx * step + 0.3;
        const z = gz * step + 0.15;
        const dist = Math.hypot(x, z);
        if (dist < inner || dist > outer || onRoad(x, z) || r() > 0.82 * density) continue;
        if (viewFrom) {
          const [vx, vz] = viewFrom;
          const camD = Math.hypot(vx, vz);
          // corridor widens towards the camera; nothing behind the camera within 6 units
          const d = segDist(x, z, 0, 0, vx * 1.6, vz * 1.6);
          const along = (x * vx + z * vz) / camD;
          if (d < 1.2 + Math.max(0, along) * 0.5 || Math.hypot(x - vx, z - vz) < 6) continue;
        }
        const tall = r() < 0.06;
        const h = tall ? 0.7 + r() * 1.3 : 0.14 + Math.pow(r(), 2.2) * 0.55;
        const sx = 0.55 + r() * 0.55;
        const sz = 0.55 + r() * 0.55;
        const tint = new THREE.Color(m.facade).multiplyScalar(0.75 + r() * 0.45);
        if (mood === "day") tint.lerp(new THREE.Color(["#d8cbb5", "#c9c2b6", "#e2d9c8", "#b8a68c"][Math.floor(r() * 4)]), 0.5);
        out.push({ m: mtx(x, h / 2, z, sx, h, sz, r() < 0.5 ? Q0 : Q90), c: tint });
      }
    return out;
  }, [m, mood, density, inner, outer, seed, viewFrom]);

  const points = useMemo(() => {
    const r = rng(11);
    const arr = new Float32Array(lights * 3);
    for (let i = 0; i < lights; i++) {
      const a = r() * Math.PI * 2;
      const d = 5 + Math.pow(r(), 0.55) * 32;
      arr[i * 3] = Math.cos(a) * d;
      arr[i * 3 + 1] = 0.02 + r() * r() * 0.5;
      arr[i * 3 + 2] = Math.sin(a) * d;
    }
    return arr;
  }, [lights]);

  return (
    <group>
      <Instanced items={blocks} shadows>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial
          map={tex.map}
          emissiveMap={tex.emissive}
          emissive="#ffffff"
          emissiveIntensity={m.cityWindows}
          roughness={0.85}
          metalness={0.05}
          onBeforeCompile={patchFacadeUVs}
        />
      </Instanced>
      {m.street > 0 && (
        <points>
          <bufferGeometry>
            <bufferAttribute attach="attributes-position" args={[points, 3]} />
          </bufferGeometry>
          <pointsMaterial color={new THREE.Color("#ffd28f").multiplyScalar(1.6 * m.street)} size={0.045} sizeAttenuation transparent opacity={0.9} depthWrite={false} toneMapped={false} />
        </points>
      )}
    </group>
  );
}

/** Lumpy, organic blob for foliage (merged + noise-displaced icosphere) */
function useFoliageGeometry() {
  return useMemo(() => {
    let g: THREE.BufferGeometry = new THREE.IcosahedronGeometry(1, 3);
    g.deleteAttribute("normal");
    g.deleteAttribute("uv");
    g = mergeVertices(g);
    const p = g.attributes.position;
    const v = new THREE.Vector3();
    for (let i = 0; i < p.count; i++) {
      v.fromBufferAttribute(p, i);
      const n = Math.sin(v.x * 5.1 + v.y * 2.3) * Math.cos(v.z * 4.7 - v.x * 1.9) * 0.16 + Math.sin(v.y * 11 + v.z * 9) * 0.06;
      v.multiplyScalar(1 + n);
      p.setXYZ(i, v.x, v.y, v.z);
    }
    g.computeVertexNormals();
    return g;
  }, []);
}

/** Instanced trees (trunk + clustered organic canopy) */
export function Trees({ spots, scale = 1, mood = "night" }: { spots: [number, number, number][]; scale?: number; mood?: Mood }) {
  const foliage = useFoliageGeometry();
  const { trunks, leaves } = useMemo(() => {
    const r = rng(41);
    const trunks: InstItem[] = [];
    const leaves: InstItem[] = [];
    const greens = ["#2f4a2a", "#3a5a31", "#274024", "#456b37", "#52763c"];
    for (const [x, y, z] of spots) {
      const s = scale * (0.8 + r() * 0.45);
      trunks.push({ m: mtx(x, y + 0.08 * s, z, 0.01 * s, 0.16 * s, 0.01 * s) });
      for (let k = 0; k < 7; k++) {
        const a = r() * Math.PI * 2;
        const rr = 0.06 * s * Math.sqrt(r());
        const c = new THREE.Color(greens[Math.floor(r() * greens.length)]);
        if (mood !== "day") c.multiplyScalar(0.7);
        const sz = (0.045 + r() * 0.03) * s;
        leaves.push({
          m: new THREE.Matrix4().compose(
            new THREE.Vector3(x + Math.cos(a) * rr, y + (0.17 + r() * 0.09) * s, z + Math.sin(a) * rr),
            new THREE.Quaternion().setFromEuler(new THREE.Euler(r() * 6, r() * 6, r() * 6)),
            new THREE.Vector3(sz, sz * (0.75 + r() * 0.3), sz),
          ),
          c,
        });
      }
    }
    return { trunks, leaves };
  }, [spots, scale, mood]);
  return (
    <>
      <Instanced items={trunks} shadows>
        <cylinderGeometry args={[0.5, 0.7, 1, 6]} />
        <meshStandardMaterial color="#3b2d22" roughness={0.9} />
      </Instanced>
      <Instanced items={leaves} shadows>
        <primitive object={foliage} attach="geometry" />
        <meshStandardMaterial roughness={0.85} />
      </Instanced>
    </>
  );
}

/** Ground, plaza, roads, street trees, streetlights and (dusk/night) long-exposure traffic trails */
export function Site({ mood = "night" }: { mood?: Mood }) {
  const m = MOODS[mood];
  const night = mood !== "day";
  const grainGround = useGrain(140);
  const grainPlaza = useGrain(5);

  const trees = useMemo(() => {
    const out: [number, number, number][] = [];
    for (let x = -9; x <= 9; x += 0.42) {
      if (Math.abs(x) < 0.75) continue; // keep the entrance open
      out.push([x, 0.012, ROAD_FRONT_Z - 0.62]);
      out.push([x + 0.2, 0, ROAD_FRONT_Z + 0.62]);
    }
    for (let z = -9; z <= 9; z += 0.45) {
      if (Math.abs(z - ROAD_FRONT_Z) < 0.8) continue;
      out.push([ROAD_SIDE_X + 0.5, 0, z]);
      out.push([ROAD_SIDE_X - 0.5, 0, z + 0.2]);
    }
    return out;
  }, []);

  const { dashes, poles, heads, trails } = useMemo(() => {
    const dashes: InstItem[] = [];
    const poles: InstItem[] = [];
    const heads: InstItem[] = [];
    for (let x = -40; x <= 40; x += 0.22) dashes.push({ m: mtx(x, 0.004, ROAD_FRONT_Z, 0.1, 0.002, 0.008) });
    for (let z = -40; z <= 40; z += 0.22) if (Math.abs(z - ROAD_FRONT_Z) > 0.5) dashes.push({ m: mtx(ROAD_SIDE_X, 0.004, z, 0.008, 0.002, 0.1) });
    for (let x = -12; x <= 12; x += 0.85) {
      for (const side of [-1, 1]) {
        const z = ROAD_FRONT_Z + side * 0.5;
        poles.push({ m: mtx(x, 0.2, z, 0.006, 0.4, 0.006) });
        heads.push({ m: mtx(x, 0.4, z - side * 0.04, 0.03, 0.008, 0.012) });
      }
    }
    const trails: { pts: number; z: number; color: string; w: number }[] = [
      { pts: 0, z: ROAD_FRONT_Z - 0.2, color: "#ffffff", w: 0.012 },
      { pts: 0, z: ROAD_FRONT_Z - 0.1, color: "#fff2d6", w: 0.008 },
      { pts: 0, z: ROAD_FRONT_Z + 0.11, color: "#ff3b2a", w: 0.01 },
      { pts: 0, z: ROAD_FRONT_Z + 0.22, color: "#ff5a30", w: 0.008 },
    ];
    return { dashes, poles, heads, trails };
  }, []);

  return (
    <group>
      {/* ground */}
      <mesh rotation-x={-Math.PI / 2} position-y={-0.002} receiveShadow>
        <circleGeometry args={[120, 64]} />
        <meshStandardMaterial map={grainGround} color={night ? "#1a1a1d" : "#8f897d"} roughness={0.9} />
      </mesh>
      {/* roads (slightly glossy so they catch lights) */}
      <mesh rotation-x={-Math.PI / 2} position={[0, 0.001, ROAD_FRONT_Z]} receiveShadow>
        <planeGeometry args={[90, 0.9]} />
        <meshStandardMaterial color={night ? "#101114" : "#4a4a4c"} roughness={night ? 0.32 : 0.8} metalness={night ? 0.35 : 0} />
      </mesh>
      <mesh rotation-x={-Math.PI / 2} position={[ROAD_SIDE_X, 0.0012, 0]} receiveShadow>
        <planeGeometry args={[0.7, 90]} />
        <meshStandardMaterial color={night ? "#101114" : "#4a4a4c"} roughness={night ? 0.32 : 0.8} metalness={night ? 0.35 : 0} />
      </mesh>
      {/* plaza / forecourt in stone */}
      <mesh rotation-x={-Math.PI / 2} position={[0, 0.002, 0.15]} receiveShadow>
        <planeGeometry args={[5.4, 3.7]} />
        <meshStandardMaterial map={grainPlaza} color={night ? "#45403a" : "#d8cfbf"} roughness={night ? 0.45 : 0.7} metalness={night ? 0.15 : 0} />
      </mesh>
      {/* lawns flanking the entrance */}
      {[-1, 1].map((s) => (
        <mesh key={s} rotation-x={-Math.PI / 2} position={[s * 1.7, 0.003, 1.55]} receiveShadow>
          <planeGeometry args={[1.6, 0.42]} />
          <meshStandardMaterial color={night ? "#1d2a1a" : "#5d7a45"} roughness={0.95} />
        </mesh>
      ))}

      <Instanced items={dashes}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color="#d9d4c8" roughness={0.6} />
      </Instanced>
      <Instanced items={poles} shadows>
        <cylinderGeometry args={[1, 1, 1, 6]} />
        <meshStandardMaterial color="#2a2724" metalness={0.6} roughness={0.4} />
      </Instanced>
      <Instanced items={heads}>
        <boxGeometry args={[1, 1, 1]} />
        <meshBasicMaterial color={new THREE.Color("#ffe1aa").multiplyScalar(night ? 3 : 0.6)} toneMapped={!night} />
      </Instanced>

      <Trees spots={trees} mood={mood} />

      {night &&
        trails.map((t, i) => (
          <mesh key={i} rotation-x={-Math.PI / 2} position={[0, 0.006, t.z]}>
            <planeGeometry args={[90, t.w]} />
            <meshBasicMaterial color={new THREE.Color(t.color).multiplyScalar(m.street * 2.4)} toneMapped={false} transparent opacity={0.85} />
          </mesh>
        ))}
    </group>
  );
}

/** Soft warm haze behind the tower (radial gradient texture drawn once) */
export function SkyGlow({ x = 0, y = 4, z = -14, scale = 26 }: { x?: number; y?: number; z?: number; scale?: number }) {
  const tex = useMemo(() => {
    const c = document.createElement("canvas");
    c.width = c.height = 256;
    const g = c.getContext("2d")!;
    const grd = g.createRadialGradient(128, 128, 0, 128, 128, 128);
    grd.addColorStop(0, "rgba(120,92,50,0.55)");
    grd.addColorStop(0.45, "rgba(60,46,28,0.25)");
    grd.addColorStop(1, "rgba(8,9,11,0)");
    g.fillStyle = grd;
    g.fillRect(0, 0, 256, 256);
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    return t;
  }, []);
  return (
    <mesh position={[x, y, z]} scale={[scale, scale * 0.75, 1]}>
      <planeGeometry args={[1, 1]} />
      <meshBasicMaterial map={tex} transparent depthWrite={false} fog={false} />
    </mesh>
  );
}

/** Studio-style reflections rendered locally (no HDR download): vertical light strips read as glass highlights */
export function NightEnvironment() {
  return (
    <Environment resolution={256} frames={1}>
      <Lightformer form="rect" intensity={3} color="#f3d9a4" position={[6, 4, 5]} scale={[1.2, 12, 1]} />
      <Lightformer form="rect" intensity={1.6} color="#e5c27e" position={[-5, 4, 6]} scale={[0.8, 12, 1]} />
      <Lightformer form="rect" intensity={0.9} color="#c6a667" position={[-7, 2, -4]} scale={[4, 6, 1]} />
      <Lightformer form="ring" intensity={1.4} color="#ffe6b8" position={[0, 10, -6]} scale={3} />
      <Lightformer form="rect" intensity={0.4} color="#8fa3c4" position={[0, 1, 9]} scale={[14, 1.5, 1]} />
    </Environment>
  );
}

/** Live scenes: bloom on the warm lights + gentle vignette. Desktop only (quality="high"). */
export function Effects() {
  return (
    <EffectComposer multisampling={0}>
      <Bloom mipmapBlur intensity={0.85} luminanceThreshold={0.62} luminanceSmoothing={0.25} radius={0.7} />
      <ToneMapping mode={ToneMappingMode.ACES_FILMIC} />
      <Vignette eskil={false} offset={0.25} darkness={0.55} />
    </EffectComposer>
  );
}

/** Still renders: ambient occlusion, bloom, filmic tone mapping, anti-aliasing */
export function StudioEffects({ aoRadius = 0.2, bloom = 0.6 }: { aoRadius?: number; bloom?: number }) {
  return (
    <EffectComposer multisampling={0} enableNormalPass={false}>
      <N8AO aoRadius={aoRadius} intensity={2.2} distanceFalloff={1} quality="ultra" />
      <Bloom mipmapBlur intensity={bloom} luminanceThreshold={0.85} luminanceSmoothing={0.2} radius={0.65} />
      <ToneMapping mode={ToneMappingMode.AGX} />
      <Vignette eskil={false} offset={0.3} darkness={0.4} />
      <SMAA />
    </EffectComposer>
  );
}
