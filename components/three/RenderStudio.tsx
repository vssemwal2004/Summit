"use client";

import { useEffect, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import Tower from "./Tower";
import { City, Site, StudioEffects } from "./Surroundings";
import { MoodEnvironment, MoodLights, SkyDome, type Mood } from "./Sky";
import { InteriorScene, type InteriorKind } from "./Interior";

/**
 * Offline still renderer (dev only, /render?shot=…). Produces the artist's-impression images in
 * /public/images/renders via scripts/render-stills.mjs. Architectural shots keep verticals straight
 * by levelling the camera and shifting the lens (view offset) instead of tilting.
 */
type Shot = {
  scene: "exterior" | InteriorKind;
  mood: Mood;
  pos: [number, number, number];
  look: [number, number, number];
  /** level camera + lens shift: visible angles above / below the horizon (deg) */
  vTop?: number;
  vBottom?: number;
  /** tilted camera (aerials, worm's-eye): plain vertical fov */
  fov?: number;
  ao?: number;
  bloom?: number;
};

export const SHOTS: Record<string, Shot> = {
  "exterior-dusk": { scene: "exterior", mood: "dusk", pos: [5.6, 0.32, 10.4], look: [-0.5, 0, 0], vTop: 30, vBottom: -6 },
  "exterior-day": { scene: "exterior", mood: "day", pos: [-6.4, 0.36, 10.6], look: [0.5, 0, 0], vTop: 30, vBottom: -6 },
  "retail-street": { scene: "exterior", mood: "dusk", pos: [2.05, 0.09, 4.05], look: [-0.5, 0, 0.4], vTop: 40, vBottom: -12, ao: 0.08 },
  terrace: { scene: "terrace", mood: "dusk", pos: [2.7, 1.45, 2.05], look: [-1.6, 1.45, -6], vTop: 22, vBottom: -27, ao: 0.8, bloom: 0.5 },
  night: { scene: "exterior", mood: "night", pos: [-3.6, 0.3, 10.2], look: [-2.9, 0, 0], vTop: 36, vBottom: -6 },
  "interior-living": { scene: "living", mood: "dusk", pos: [0.6, 1.3, 3.2], look: [-0.4, 1.3, -3.5], vTop: 26, vBottom: -24, ao: 0.9, bloom: 0.5 },
  lobby: { scene: "lobby", mood: "dusk", pos: [2.2, 1.6, 7.2], look: [-0.6, 1.6, -8], vTop: 36, vBottom: -18, ao: 1.2, bloom: 0.7 },
  dining: { scene: "dining", mood: "dusk", pos: [-1.5, 1.45, 4.1], look: [0.8, 1.45, -4.5], vTop: 22, vBottom: -24, ao: 1, bloom: 0.7 },
  lounge: { scene: "lounge", mood: "day", pos: [3.2, 1.35, 3.6], look: [-1.4, 1.35, -4], vTop: 24, vBottom: -24, ao: 0.9, bloom: 0.3 },
};

const rad = THREE.MathUtils.degToRad;
// stable per-shot sight-lines (kept clear of city blocks)
const VIEW: Record<string, [number, number]> = Object.fromEntries(Object.entries(SHOTS).map(([k, s]) => [k, [s.pos[0], s.pos[2]]]));

function CameraRig({ shot, onReady }: { shot: Shot; onReady: () => void }) {
  const { camera, size } = useThree();
  const frames = useRef(0);
  useFrame(() => {
    const cam = camera as THREE.PerspectiveCamera;
    cam.position.set(...shot.pos);
    if (shot.vTop !== undefined && shot.vBottom !== undefined) {
      // Level camera; lens shift so the frame spans vBottom..vTop around the horizon
      cam.lookAt(shot.look[0], shot.pos[1], shot.look[2]);
      const tt = Math.tan(rad(shot.vTop));
      const tb = Math.tan(rad(-shot.vBottom));
      const half = Math.max(tt, tb);
      const fullH = (size.height * 2 * half) / (tt + tb);
      cam.fov = THREE.MathUtils.radToDeg(2 * Math.atan(half));
      cam.aspect = size.width / fullH;
      const offY = tt >= tb ? 0 : fullH - size.height;
      cam.setViewOffset(size.width, fullH, 0, offY, size.width, size.height);
    } else {
      cam.lookAt(...shot.look);
      cam.fov = shot.fov ?? 40;
      cam.aspect = size.width / size.height;
      cam.clearViewOffset();
    }
    cam.updateProjectionMatrix();
    frames.current++;
    if (frames.current === 90) onReady();
  });
  return null;
}

export default function RenderStudio() {
  const [name, setName] = useState<string | null>(null);
  useEffect(() => setName(new URLSearchParams(location.search).get("shot") ?? "exterior-dusk"), []);
  if (!name) return null;
  const shot = SHOTS[name];
  if (!shot) return <p style={{ color: "#fff", padding: 24 }}>Unknown shot. Options: {Object.keys(SHOTS).join(", ")}</p>;
  const exterior = shot.scene === "exterior";

  return (
    <div style={{ position: "fixed", inset: 0, background: "#000" }}>
      <Canvas
        shadows="soft"
        dpr={1}
        gl={{ antialias: false, preserveDrawingBuffer: true, powerPreference: "high-performance" }}
        camera={{ near: exterior ? 0.05 : 0.05, far: exterior ? 200 : 8000 }}
        onCreated={({ gl }) => {
          gl.toneMapping = THREE.NoToneMapping; // AgX applied in post
        }}
      >
        <CameraRig
          shot={shot}
          onReady={() => {
            (window as unknown as { __renderReady: boolean }).__renderReady = true;
          }}
        />
        <MoodEnvironment mood={shot.mood} interior={!exterior} />
        {exterior ? (
          <>
            <SkyDome mood={shot.mood} radius={150} />
            <MoodLights mood={shot.mood} shadows shadowSize={9} />
            <Tower mood={shot.mood} detail={1.2} />
            <Site mood={shot.mood} />
            <City mood={shot.mood} lights={2600} viewFrom={VIEW[name]} />
            <City mood={shot.mood} lights={0} inner={27} outer={70} density={0.5} seed={77} />
          </>
        ) : (
          <InteriorScene kind={shot.scene as InteriorKind} mood={shot.mood} />
        )}
        <StudioEffects aoRadius={shot.ao ?? 0.18} bloom={shot.bloom ?? 0.55} />
      </Canvas>
    </div>
  );
}
