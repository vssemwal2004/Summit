"use client";

import { useMemo } from "react";
import { Environment, Lightformer } from "@react-three/drei";
import * as THREE from "three";

export type Mood = "night" | "dusk" | "day";

/** Lighting presets. Colours are artistic, not a simulation of a real place. */
export const MOODS = {
  night: {
    // midnight navy sky with a faint champagne city-glow on the horizon
    zenith: "#030714", mid: "#0a1430", horizon: "#2c3350", ground: "#070d1a",
    sun: "#ffd9a8", sunDir: [0.25, 0.02, -1], glow: 0.3, disc: 0, clouds: 0.2, cloud: "#18203a",
    fog: "#0b1324", hemiSky: "#3a4a70", hemiGround: "#141a28", hemi: 0.32, key: "#b3c3e3", keyI: 0.38, keyPos: [-6, 10, 6],
    windows: 1, cityWindows: 1.2, facade: "#171d2c", street: 1, exposure: 1.05,
  },
  dusk: {
    zenith: "#0c1733", mid: "#2b4473", horizon: "#f2a468", ground: "#141318",
    sun: "#ffae6b", sunDir: [-0.55, 0.035, -1], glow: 1, disc: 0, clouds: 0.55, cloud: "#6d5a6e",
    fog: "#4b4a5c", hemiSky: "#7088bb", hemiGround: "#3a2a1e", hemi: 0.75, key: "#ffb37a", keyI: 1.1, keyPos: [-8, 3, -9],
    windows: 0.95, cityWindows: 0.9, facade: "#3a3a42", street: 0.85, exposure: 1.1,
  },
  day: {
    zenith: "#2c5ea3", mid: "#7ea8d6", horizon: "#e7edf1", ground: "#8d877d",
    sun: "#fff3dc", sunDir: [0.55, 0.6, 0.55], glow: 0.35, disc: 1, clouds: 0.5, cloud: "#ffffff",
    fog: "#c7d4e0", hemiSky: "#c3d8ef", hemiGround: "#7b6f60", hemi: 1.1, key: "#fff1da", keyI: 3.2, keyPos: [9, 11, 8],
    windows: 0.1, cityWindows: 0, facade: "#bdb5a8", street: 0, exposure: 1,
  },
} as const;

const vert = /* glsl */ `
varying vec3 vDir;
void main() {
  vDir = normalize(position);
  vec4 p = modelViewMatrix * vec4(position, 1.0);
  gl_Position = projectionMatrix * p;
}`;

const frag = /* glsl */ `
uniform vec3 zenith; uniform vec3 mid; uniform vec3 horizon; uniform vec3 ground;
uniform vec3 sunColor; uniform vec3 sunDir; uniform float glow; uniform float disc;
uniform vec3 cloudColor; uniform float clouds;
varying vec3 vDir;
float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float noise(vec2 p){ vec2 i = floor(p), f = fract(p); f = f*f*(3.0-2.0*f);
  return mix(mix(hash(i), hash(i+vec2(1,0)), f.x), mix(hash(i+vec2(0,1)), hash(i+vec2(1,1)), f.x), f.y); }
float fbm(vec2 p){ float v = 0.0, a = 0.5; for (int i = 0; i < 5; i++){ v += a*noise(p); p = p*2.03 + 1.7; a *= 0.5; } return v; }
void main() {
  vec3 d = normalize(vDir);
  float h = d.y;
  vec3 c = mix(horizon, mid, smoothstep(0.0, 0.22, h));
  c = mix(c, zenith, smoothstep(0.18, 0.85, h));
  vec3 s = normalize(sunDir);
  float sd = max(dot(d, s), 0.0);
  // glow fades in just above the horizon so the sky meets the fogged ground without a seam
  c += sunColor * glow * (pow(sd, 6.0) * 0.35 + pow(sd, 40.0) * 0.5) * (1.0 - smoothstep(0.0, 0.6, h)) * smoothstep(0.0, 0.1, h);
  c += sunColor * disc * (pow(sd, 2500.0) * 18.0 + pow(sd, 200.0) * 0.6);
  // soft cloud banks, lit by the sun near the horizon
  vec2 uv = d.xz / (h + 0.12);
  float cl = smoothstep(0.52, 0.85, fbm(uv * 0.9 + vec2(4.0, 1.0)));
  cl *= smoothstep(0.0, 0.06, h) * (1.0 - smoothstep(0.3, 0.75, h));
  vec3 cc = mix(cloudColor, sunColor, pow(sd, 3.0) * glow * 0.7);
  c = mix(c, cc, cl * clouds);
  c = mix(c, ground, smoothstep(0.0, -0.04, h));
  gl_FragColor = vec4(c, 1.0);
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}`;

/** Gradient sky dome with sun glow and procedural clouds */
export function SkyDome({ mood = "night", radius = 80 }: { mood?: Mood; radius?: number }) {
  const m = MOODS[mood];
  const mat = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader: vert,
        fragmentShader: frag,
        side: THREE.BackSide,
        depthWrite: false,
        fog: false,
        uniforms: {
          zenith: { value: new THREE.Color(m.zenith) },
          mid: { value: new THREE.Color(m.mid) },
          horizon: { value: new THREE.Color(m.horizon) },
          ground: { value: new THREE.Color(m.ground) },
          sunColor: { value: new THREE.Color(m.sun) },
          sunDir: { value: new THREE.Vector3(...m.sunDir).normalize() },
          glow: { value: m.glow },
          disc: { value: m.disc },
          cloudColor: { value: new THREE.Color(m.cloud) },
          clouds: { value: m.clouds },
        },
      }),
    [m],
  );
  return (
    <mesh material={mat} renderOrder={-1} frustumCulled={false}>
      <sphereGeometry args={[radius, 48, 24]} />
    </mesh>
  );
}

/** Reflections for glass/metal: the same sky plus a few soft light panels, rendered locally once (no HDR download) */
export function MoodEnvironment({ mood = "night", interior = false }: { mood?: Mood; interior?: boolean }) {
  const warm = mood === "day" ? 0.4 : 1;
  return (
    <Environment resolution={256} frames={1}>
      <SkyDome mood={mood} radius={40} />
      {interior ? (
        <>
          <Lightformer form="rect" intensity={1.6 * warm} color="#ffd7a3" position={[0, 6, 0]} rotation-x={Math.PI / 2} scale={[8, 6, 1]} />
          <Lightformer form="rect" intensity={1.2 * warm} color="#ffcf96" position={[-8, 2, 0]} rotation-y={Math.PI / 2} scale={[10, 2, 1]} />
          <Lightformer form="rect" intensity={1.2 * warm} color="#ffcf96" position={[8, 2, 0]} rotation-y={-Math.PI / 2} scale={[10, 2, 1]} />
        </>
      ) : (
        <>
          <Lightformer form="rect" intensity={mood === "day" ? 1 : 2.2} color="#f3d9a4" position={[7, 4, 6]} scale={[1, 14, 1]} />
          <Lightformer form="rect" intensity={mood === "day" ? 0.6 : 1.2} color="#e5c27e" position={[-6, 4, 7]} scale={[0.7, 14, 1]} />
        </>
      )}
    </Environment>
  );
}

/** Ambient + key light + fog for a mood */
export function MoodLights({ mood = "night", shadows = false, shadowSize = 12, fog = true }: { mood?: Mood; shadows?: boolean; shadowSize?: number; fog?: boolean }) {
  const m = MOODS[mood];
  return (
    <>
      {fog && <fog attach="fog" args={[m.fog, 18, 70]} />}
      <hemisphereLight args={[m.hemiSky, m.hemiGround, m.hemi]} />
      <directionalLight
        position={m.keyPos as unknown as [number, number, number]}
        intensity={m.keyI}
        color={m.key}
        castShadow={shadows}
        shadow-mapSize={[4096, 4096]}
        shadow-bias={-0.0004}
        shadow-normalBias={0.02}
        shadow-camera-left={-shadowSize}
        shadow-camera-right={shadowSize}
        shadow-camera-top={shadowSize}
        shadow-camera-bottom={-shadowSize}
        shadow-camera-near={0.5}
        shadow-camera-far={60}
      />
    </>
  );
}
