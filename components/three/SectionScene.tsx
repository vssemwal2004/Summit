"use client";

import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import Tower, { TOWER_CENTER_Y, type Highlight } from "./Tower";
import { City, Effects, Site } from "./Surroundings";
import { MOODS, MoodEnvironment, MoodLights, SkyDome } from "./Sky";
import type { SceneProps } from "./HeroScene";

/** Interactive tower: drag to rotate (fine pointers only, so touch scrolling is never trapped) + zone highlight */
export default function SectionScene({ active, reduced, quality, onReady, highlight, canDrag }: SceneProps & { highlight: Highlight; canDrag: boolean }) {
  const high = quality === "high";
  return (
    <Canvas
      dpr={high ? [1, 1.75] : [1, 1.25]}
      gl={{ antialias: !high }}
      camera={{ fov: 30, near: 0.1, far: 110, position: [8, 4, 11] }}
      frameloop={active ? "always" : "demand"}
      onCreated={({ gl }) => {
        gl.toneMapping = THREE.ACESFilmicToneMapping;
        gl.toneMappingExposure = 1.1;
        requestAnimationFrame(() => requestAnimationFrame(() => onReady?.()));
      }}
      style={{ touchAction: "pan-y" }}
    >
      <color attach="background" args={["#0b1324"]} />
      <SkyDome mood="night" radius={80} />
      <fog attach="fog" args={[MOODS.night.horizon, 15, 40]} />
      <MoodLights mood="night" fog={false} />
      <directionalLight position={[5, 9, 6]} intensity={0.7} color="#f3dfb0" />
      <MoodEnvironment mood="night" />
      <Tower highlight={highlight} detail={high ? 1 : 0.75} />
      <Site mood="night" />
      <City lights={high ? 1000 : 450} density={high ? 0.8 : 0.45} />
      <OrbitControls
        target={[0, TOWER_CENTER_Y, 0]}
        enableZoom={false}
        enablePan={false}
        enableRotate={canDrag}
        autoRotate={!reduced}
        autoRotateSpeed={0.55}
        minPolarAngle={1.05}
        maxPolarAngle={1.62}
        enableDamping
      />
      {high && <Effects />}
    </Canvas>
  );
}
