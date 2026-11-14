"use client";

import { useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { Instanced, rng, Trees } from "./Surroundings";
import { MOODS, type Mood } from "./Sky";

/**
 * Procedural CONCEPT tower — an artist's impression, not the approved design.
 * G+2 stone-clad commercial podium with landscaped roof deck, two interlocking glass residential
 * volumes with balconies, and a lit lantern crown. Swap for the architect's GLB when available.
 */
export type Highlight = "none" | "commercial" | "residential";

const PODIUM = 3;
const PH = 0.3; // podium floor height (~5.7 m)
const FLOORS = 30;
const FH = 0.17; // residential floor height (~3.2 m)
const BASE_Y = PODIUM * PH;
export const TOWER_TOP = BASE_Y + FLOORS * FH;
export const TOWER_CENTER_Y = (TOWER_TOP + 1.6) / 2;

export const PODIUM_W = 2.3;
export const PODIUM_D = 1.7;
const GOLD = new THREE.Color("#d4b483"); // champagne
const WARM = ["#ffcf86", "#ffc06a", "#ffe0ad", "#fff1da", "#ffb85c"].map((c) => new THREE.Color(c));
const SLAB = 0.024;

type Face = 0 | 1 | 2 | 3; // front(+z) back(-z) right(+x) left(-x)
type Vol = { x: number; z: number; w: number; d: number; floors: number; balconies: Face[] };
const VOLS: Vol[] = [
  { x: -0.22, z: -0.08, w: 1.06, d: 1.0, floors: FLOORS, balconies: [3] },
  { x: 0.42, z: 0.14, w: 0.64, d: 0.94, floors: 25, balconies: [0, 2] },
];

const UP = new THREE.Vector3(0, 1, 0);
const FACE_ROT = [0, Math.PI, Math.PI / 2, -Math.PI / 2];

/** Slots along each face of a w×d rectangle: centre (local), rotation, slot width, face, slot index */
function eachSlot(w: number, d: number, spacing: number, cb: (p: THREE.Vector3, q: THREE.Quaternion, sw: number, face: Face, i: number) => void) {
  const faces = [
    { len: w, at: (a: number) => new THREE.Vector3(a, 0, d / 2) },
    { len: w, at: (a: number) => new THREE.Vector3(-a, 0, -d / 2) },
    { len: d, at: (a: number) => new THREE.Vector3(w / 2, 0, -a) },
    { len: d, at: (a: number) => new THREE.Vector3(-w / 2, 0, a) },
  ];
  faces.forEach((f, fi) => {
    const n = Math.max(2, Math.round(f.len / spacing));
    const sw = f.len / n;
    const q = new THREE.Quaternion().setFromAxisAngle(UP, FACE_ROT[fi]);
    for (let i = 0; i < n; i++) cb(f.at(-f.len / 2 + (i + 0.5) * sw), q, sw, fi as Face, i);
  });
}

const V = (x = 0, y = 0, z = 0) => new THREE.Vector3(x, y, z);
const M = (p: THREE.Vector3, s: THREE.Vector3, q = new THREE.Quaternion()) => new THREE.Matrix4().compose(p, q, s);
type Item = { m: THREE.Matrix4; c?: THREE.Color };

/**
 * 4-tile atlas of lit-room "interiors" (ceiling glow, sheer curtain, blinds, lamp-lit room) for apartments,
 * or shop interiors for the podium. Greyscale; tinted per instance; tile chosen by gl_InstanceID.
 */
function makeRoomAtlas(kind: "home" | "shop") {
  const TW = 64;
  const TH = 112;
  const c = document.createElement("canvas");
  c.width = TW * 4;
  c.height = TH;
  const g = c.getContext("2d")!;
  const grad = (x: number, top: number, bottom: number) => {
    const gr = g.createLinearGradient(0, 0, 0, TH);
    gr.addColorStop(0, `rgb(${top},${top},${top})`);
    gr.addColorStop(1, `rgb(${bottom},${bottom},${bottom})`);
    g.fillStyle = gr;
    g.fillRect(x, 0, TW, TH);
  };
  const glow = (x: number, y: number, r: number, a: number) => {
    const gr = g.createRadialGradient(x, y, 0, x, y, r);
    gr.addColorStop(0, `rgba(255,255,255,${a})`);
    gr.addColorStop(1, "rgba(255,255,255,0)");
    g.fillStyle = gr;
    g.fillRect(x - r, y - r, r * 2, r * 2);
  };
  for (let t = 0; t < 4; t++) {
    const x = t * TW;
    g.save();
    g.beginPath();
    g.rect(x, 0, TW, TH);
    g.clip();
    if (kind === "home") {
      if (t === 0) {
        grad(x, 235, 120);
        glow(x + TW / 2, 6, 40, 0.6);
      } else if (t === 1) {
        grad(x, 200, 110);
        for (let i = 0; i < 26; i++) {
          const v = 200 + ((i * 37) % 40);
          g.fillStyle = `rgb(${v},${v},${v})`;
          g.fillRect(x + i, 0, 1, TH);
        }
        glow(x + TW * 0.7, 10, 34, 0.45);
      } else if (t === 2) {
        grad(x, 210, 130);
        g.fillStyle = "rgba(0,0,0,0.35)";
        for (let y = 2; y < TH; y += 6) g.fillRect(x, y, TW, 2);
      } else {
        grad(x, 90, 60);
        glow(x + TW * 0.72, TH * 0.62, 42, 0.95);
        g.fillStyle = "rgba(0,0,0,0.55)";
        g.fillRect(x + 4, TH * 0.78, TW * 0.6, TH * 0.22);
      }
    } else {
      grad(x, 250, 170);
      if (t === 0) {
        g.fillStyle = "rgba(0,0,0,0.25)";
        for (let y = 30; y < TH; y += 22) g.fillRect(x, y, TW, 3);
      } else if (t === 1) {
        g.fillStyle = "rgba(0,0,0,0.3)";
        for (const px of [14, 34, 50]) g.fillRect(x + px, TH * 0.45, 7, TH * 0.5);
      } else if (t === 2) {
        for (const px of [12, 32, 52]) glow(x + px, 14, 10, 0.9);
        g.fillStyle = "rgba(0,0,0,0.3)";
        g.fillRect(x, TH * 0.7, TW, TH * 0.3);
      } else {
        glow(x + TW / 2, TH * 0.3, 50, 0.5);
      }
    }
    g.restore();
  }
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

function patchAtlasUV(shader: THREE.WebGLProgramParametersWithUniforms) {
  shader.vertexShader = shader.vertexShader.replace(
    "#include <uv_vertex>",
    `#include <uv_vertex>
#ifdef USE_INSTANCING
  vMapUv = vec2((uv.x + mod(float(gl_InstanceID) * 7.0, 4.0)) / 4.0, uv.y);
#endif`,
  );
}

/** Canvas texture for the "THE SUMMIT" fascia sign */
function useSignTexture() {
  return useMemo(() => {
    const c = document.createElement("canvas");
    c.width = 1024;
    c.height = 96;
    const g = c.getContext("2d")!;
    g.fillStyle = "#17140f";
    g.fillRect(0, 0, c.width, c.height);
    g.fillStyle = "#e5d2a0";
    g.font = "500 58px Georgia, 'Times New Roman', serif";
    g.textAlign = "center";
    g.textBaseline = "middle";
    (g as CanvasRenderingContext2D & { letterSpacing?: string }).letterSpacing = "22px";
    g.fillText("THE SUMMIT", c.width / 2 + 11, c.height / 2 + 3);
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    t.anisotropy = 8;
    return t;
  }, []);
}

export default function Tower({ highlight = "none", detail = 1, mood = "night" }: { highlight?: Highlight; detail?: number; mood?: Mood }) {
  const mo = MOODS[mood];
  const day = mood === "day";
  const sign = useSignTexture();

  const mats = useMemo(
    () => ({
      resWin: Object.assign(new THREE.MeshBasicMaterial({ toneMapped: false, map: makeRoomAtlas("home") }), { onBeforeCompile: patchAtlasUV }),
      comWin: Object.assign(new THREE.MeshBasicMaterial({ toneMapped: false, map: makeRoomAtlas("shop") }), { onBeforeCompile: patchAtlasUV }),
      // Mirror-like curtain wall: colour acts as reflectance tint, so it picks up the sky
      glass: new THREE.MeshStandardMaterial({ color: day ? "#8a9aa8" : "#6b7a88", metalness: 1, roughness: 0.04, envMapIntensity: 1 }),
      podiumGlass: new THREE.MeshStandardMaterial({ color: "#6e665a", metalness: 1, roughness: 0.06, envMapIntensity: 0.9 }),
      slab: new THREE.MeshStandardMaterial({ color: "#e7e1d5", roughness: 0.6, emissive: GOLD, emissiveIntensity: 0 }),
      stone: new THREE.MeshStandardMaterial({ color: "#cdbfa6", roughness: 0.55, emissive: GOLD, emissiveIntensity: 0 }),
      bronze: new THREE.MeshStandardMaterial({ color: "#4a3b28", metalness: 1, roughness: 0.35 }),
      gold: new THREE.MeshStandardMaterial({ color: GOLD, metalness: 1, roughness: 0.22, emissive: GOLD, emissiveIntensity: day ? 0 : 0.35 }),
      railGlass: new THREE.MeshStandardMaterial({ color: "#a9bcc6", metalness: 0.6, roughness: 0.05, transparent: true, opacity: 0.3, depthWrite: false }),
      lantern: new THREE.MeshStandardMaterial({ color: "#2a2318", emissive: "#ffcf86", emissiveIntensity: day ? 0.08 : 1.1, roughness: 0.4 }),
      planter: new THREE.MeshStandardMaterial({ color: "#5d564d", roughness: 0.8 }),
      hedge: new THREE.MeshStandardMaterial({ color: day ? "#4f6e3c" : "#22331d", roughness: 0.95 }),
      signMat: new THREE.MeshStandardMaterial({ map: sign, emissiveMap: sign, emissive: "#ffffff", emissiveIntensity: day ? 0.15 : 1.2, roughness: 0.5 }),
      downlight: new THREE.MeshBasicMaterial({ color: new THREE.Color("#fff0d0").multiplyScalar(day ? 1 : 3), toneMapped: false }),
    }),
    [day, sign],
  );

  const geo = useMemo(() => {
    const r = rng(7);
    const glass: Item[] = [];
    const slabs: Item[] = [];
    const mull: Item[] = [];
    const res: Item[] = [];
    const com: Item[] = [];
    const stone: Item[] = [];
    const pglass: Item[] = [];
    const railGlass: Item[] = [];
    const gold: Item[] = [];
    const spacing = 0.075 / detail;

    // ---------- Residential volumes ----------
    for (const v of VOLS) {
      for (let i = 0; i < v.floors; i++) {
        const y0 = BASE_Y + i * FH;
        const gh = FH - SLAB;
        glass.push({ m: M(V(v.x, y0 + gh / 2, v.z), V(v.w, gh, v.d)) });
        slabs.push({ m: M(V(v.x, y0 + FH - SLAB / 2, v.z), V(v.w + 0.024, SLAB, v.d + 0.024)) });

        let state = 0;
        eachSlot(v.w, v.d, spacing, (p, q, sw, face, si) => {
          const n = V(0, 0, 1).applyQuaternion(q);
          const t = V(1, 0, 0).applyQuaternion(q);
          const c = p.clone().add(V(v.x, y0 + gh / 2, v.z));
          // bronze mullion at the slot edge
          mull.push({ m: M(c.clone().addScaledVector(n, 0.006).addScaledVector(t, sw / 2), V(0.006, gh, 0.012), q) });
          // rooms lit in clusters (one apartment = several panes)
          if (si % 3 === 0) state = r();
          if (state < 0.42) {
            const col = WARM[Math.floor(r() * WARM.length)].clone().multiplyScalar(0.55 + r() * 0.55);
            res.push({ m: M(c.clone().addScaledVector(n, 0.0025), V(sw * 0.94, gh * 0.86, 1), q), c: col });
          } else if (state < 0.56) {
            res.push({ m: M(c.clone().addScaledVector(n, 0.0025), V(sw * 0.94, gh * 0.86, 1), q), c: new THREE.Color("#8a7458").multiplyScalar(0.22) });
          }
          void face;
        });

        // balconies with glass balustrade + gold handrail
        if (i > 0)
          for (const f of v.balconies) {
            const q = new THREE.Quaternion().setFromAxisAngle(UP, FACE_ROT[f]);
            const n = V(0, 0, 1).applyQuaternion(q);
            const half = f < 2 ? v.d / 2 : v.w / 2;
            const len = (f < 2 ? v.w : v.d) - 0.02;
            const base = V(v.x, y0 - SLAB / 2, v.z).addScaledVector(n, half + 0.065);
            slabs.push({ m: M(base, V(len, SLAB, 0.13), q) });
            const edge = V(v.x, y0, v.z).addScaledVector(n, half + 0.127);
            railGlass.push({ m: M(edge.clone().setY(y0 + 0.028), V(len, 0.052, 0.003), q) });
            gold.push({ m: M(edge.clone().setY(y0 + 0.056), V(len, 0.004, 0.006), q) });
          }
      }
    }

    // signature gold fin at the corner where the two volumes meet
    const B = VOLS[1];
    const finH = B.floors * FH;
    gold.push({ m: M(V(B.x - B.w / 2 - 0.012, BASE_Y + finH / 2, B.z + B.d / 2 + 0.07), V(0.026, finH, 0.15)) });

    // ---------- Commercial podium (G+2) ----------
    for (let i = 0; i < PODIUM; i++) {
      const y0 = i * PH;
      const gh = PH - 0.05;
      pglass.push({ m: M(V(0, y0 + gh / 2, 0), V(PODIUM_W - 0.06, gh, PODIUM_D - 0.06)) });
      stone.push({ m: M(V(0, y0 + PH - 0.025, 0), V(PODIUM_W + 0.03, 0.05, PODIUM_D + 0.03)) });
      eachSlot(PODIUM_W - 0.06, PODIUM_D - 0.06, 0.34, (p, q, sw, face, si) => {
        const n = V(0, 0, 1).applyQuaternion(q);
        const t = V(1, 0, 0).applyQuaternion(q);
        const c = p.clone().setY(y0 + gh / 2);
        // stone pier between bays (skip the central entrance bay on the ground floor)
        stone.push({ m: M(c.clone().addScaledVector(n, 0.02).addScaledVector(t, sw / 2), V(0.05, gh, 0.06), q) });
        const entrance = i === 0 && face === 0 && Math.abs(p.x) < 0.3;
        if (r() < 0.86 || entrance) {
          const col = (r() < 0.3 ? new THREE.Color("#fff3e0") : WARM[Math.floor(r() * 3)].clone()).multiplyScalar(entrance ? 1.2 : 0.55 + r() * 0.35);
          com.push({ m: M(c.clone().addScaledVector(n, 0.0025), V(sw * 0.9, gh * 0.92, 1), q), c: col });
        }
        void si;
      });
    }
    // roof deck + glass balustrade around the podium terrace
    stone.push({ m: M(V(0, BASE_Y + 0.008, 0), V(PODIUM_W + 0.03, 0.016, PODIUM_D + 0.03)) });
    for (const [px, pz, sx, sz] of [
      [0, PODIUM_D / 2 + 0.01, PODIUM_W, 0.003],
      [0, -PODIUM_D / 2 - 0.01, PODIUM_W, 0.003],
      [PODIUM_W / 2 + 0.01, 0, 0.003, PODIUM_D],
      [-PODIUM_W / 2 - 0.01, 0, 0.003, PODIUM_D],
    ]) {
      railGlass.push({ m: M(V(px, BASE_Y + 0.045, pz), V(sx, 0.06, sz)) });
      gold.push({ m: M(V(px, BASE_Y + 0.077, pz), V(Math.max(sx, 0.005), 0.004, Math.max(sz, 0.005))) });
    }

    // ---------- Lantern crown on the tall volume ----------
    const A = VOLS[0];
    const top = BASE_Y + A.floors * FH;
    const LH = 0.46;
    for (const sx of [-1, 1])
      for (const sz of [-1, 1]) gold.push({ m: M(V(A.x + (sx * (A.w - 0.03)) / 2, top + LH / 2, A.z + (sz * (A.d - 0.03)) / 2), V(0.03, LH, 0.03)) });
    gold.push({ m: M(V(A.x, top + LH, A.z), V(A.w + 0.02, 0.025, A.d + 0.02)) });
    gold.push({ m: M(V(A.x, top + 0.01, A.z), V(A.w + 0.02, 0.02, A.d + 0.02)) });
    // vertical gold blades on the lantern
    eachSlot(A.w - 0.03, A.d - 0.03, 0.09, (p, q) => {
      gold.push({ m: M(p.clone().add(V(A.x, top + LH / 2, A.z)), V(0.008, LH - 0.03, 0.03), q) });
    });

    // rooftop of the lower volume: parapet + plant room
    const btop = BASE_Y + B.floors * FH;
    slabs.push({ m: M(V(B.x, btop + 0.02, B.z), V(B.w + 0.024, 0.04, B.d + 0.024)) });
    pglass.push({ m: M(V(B.x + 0.08, btop + 0.09, B.z - 0.1), V(0.3, 0.12, 0.4)) });

    return { glass, slabs, mull, res, com, stone, pglass, railGlass, gold, lanternTop: top, LH };
  }, [detail]);

  // planters + small trees on the podium roof terrace
  const terrace = useMemo(() => {
    const items: Item[] = [];
    const hedges: Item[] = [];
    const trees: [number, number, number][] = [];
    const y = BASE_Y + 0.016;
    for (let x = -1.0; x <= 1.0; x += 0.25) {
      if (x > -0.3 && x < 0.9) continue; // tower footprint side
      items.push({ m: M(V(x, y + 0.025, PODIUM_D / 2 - 0.12), V(0.2, 0.05, 0.08)) });
      hedges.push({ m: M(V(x, y + 0.058, PODIUM_D / 2 - 0.12), V(0.19, 0.02, 0.07)) });
    }
    trees.push([-0.95, y, 0.62], [-0.95, y, -0.55], [1.0, y, -0.6], [-0.95, y, 0.05]);
    return { items, hedges, trees };
  }, []);

  // Smoothly blend lighting towards the selected zone
  useFrame((_, dt) => {
    const k = 1 - Math.pow(0.002, Math.min(dt, 0.1));
    const base = mo.windows;
    const t = {
      res: (highlight === "commercial" ? 0.22 : highlight === "residential" ? 1.6 : 1) * base,
      com: (highlight === "residential" ? 0.3 : highlight === "commercial" ? 1.7 : 1.05) * Math.max(base, day ? 0.35 : 0),
      stone: highlight === "commercial" ? 0.9 : 0,
      slab: highlight === "residential" ? 0.6 : 0,
    };
    const blend = (mat: THREE.MeshBasicMaterial, v: number) => {
      const cur = (mat.userData.k as number | undefined) ?? v;
      const next = cur + (v - cur) * k;
      mat.userData.k = next;
      mat.color.setScalar(next);
    };
    blend(mats.resWin, t.res);
    blend(mats.comWin, t.com);
    mats.stone.emissiveIntensity += (t.stone - mats.stone.emissiveIntensity) * k;
    mats.slab.emissiveIntensity += (t.slab - mats.slab.emissiveIntensity) * k;
  });

  return (
    <group>
      <Instanced items={geo.glass} shadows>
        <boxGeometry args={[1, 1, 1]} />
        <primitive object={mats.glass} attach="material" />
      </Instanced>
      <Instanced items={geo.slabs} shadows>
        <boxGeometry args={[1, 1, 1]} />
        <primitive object={mats.slab} attach="material" />
      </Instanced>
      <Instanced items={geo.mull} shadows>
        <boxGeometry args={[1, 1, 1]} />
        <primitive object={mats.bronze} attach="material" />
      </Instanced>
      {!day && (
        <Instanced items={geo.res}>
          <planeGeometry args={[1, 1]} />
          <primitive object={mats.resWin} attach="material" />
        </Instanced>
      )}
      <Instanced items={geo.pglass} shadows>
        <boxGeometry args={[1, 1, 1]} />
        <primitive object={mats.podiumGlass} attach="material" />
      </Instanced>
      <Instanced items={geo.com}>
        <planeGeometry args={[1, 1]} />
        <primitive object={mats.comWin} attach="material" />
      </Instanced>
      <Instanced items={geo.stone} shadows>
        <boxGeometry args={[1, 1, 1]} />
        <primitive object={mats.stone} attach="material" />
      </Instanced>
      <Instanced items={geo.gold} shadows>
        <boxGeometry args={[1, 1, 1]} />
        <primitive object={mats.gold} attach="material" />
      </Instanced>
      <Instanced items={geo.railGlass}>
        <boxGeometry args={[1, 1, 1]} />
        <primitive object={mats.railGlass} attach="material" />
      </Instanced>

      {/* Lantern glow volume */}
      <mesh position={[VOLS[0].x, geo.lanternTop + geo.LH / 2, VOLS[0].z]} material={mats.lantern}>
        <boxGeometry args={[VOLS[0].w - 0.1, geo.LH - 0.04, VOLS[0].d - 0.1]} />
      </mesh>

      {/* Entrance: cantilevered canopy, fascia sign, downlights */}
      <mesh position={[0, 0.255, PODIUM_D / 2 + 0.19]} material={mats.stone} castShadow receiveShadow>
        <boxGeometry args={[1.0, 0.03, 0.4]} />
      </mesh>
      <mesh position={[0, 0.262, PODIUM_D / 2 + 0.391]} material={mats.signMat}>
        <planeGeometry args={[1.0, 0.044]} />
      </mesh>
      {[-0.36, -0.12, 0.12, 0.36].map((x) => (
        <mesh key={x} position={[x, 0.239, PODIUM_D / 2 + 0.2]} rotation-x={Math.PI / 2} material={mats.downlight}>
          <circleGeometry args={[0.012, 12]} />
        </mesh>
      ))}

      {/* Podium roof terrace landscaping */}
      <Instanced items={terrace.items} shadows>
        <boxGeometry args={[1, 1, 1]} />
        <primitive object={mats.planter} attach="material" />
      </Instanced>
      <Instanced items={terrace.hedges}>
        <boxGeometry args={[1, 1, 1]} />
        <primitive object={mats.hedge} attach="material" />
      </Instanced>
      <Trees spots={terrace.trees} scale={0.8} mood={mood} />

      {/* Warm spill from the lobby onto the forecourt */}
      {!day && <pointLight position={[0, 0.2, PODIUM_D / 2 + 0.45]} color="#ffcf8a" intensity={0.6} distance={1.6} />}
    </group>
  );
}
