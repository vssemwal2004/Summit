"use client";

import { useEffect, useMemo, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import Tower, { TOWER_CENTER_Y } from "./Tower";
import { City, Effects, Site } from "./Surroundings";
import { MOODS, MoodEnvironment, MoodLights, SkyDome } from "./Sky";

export type SceneProps = { active: boolean; reduced: boolean; quality: "low" | "high"; onReady?: () => void };

const ease = (t: number) => 1 - Math.pow(1 - t, 3);

/**
 * Cinematic camera: glides in on load, drifts with the pointer, and the tower turns as you scroll.
 * Composition: tower in the right ~third on wide screens, behind the copy (dimmed by CSS) on portrait.
 */
function Rig({ reduced, quality }: { reduced: boolean; quality: "low" | "high" }) {
  const { camera, size } = useThree();
  const pointer = useRef({ x: 0, y: 0 });
  const smooth = useRef({ x: 0, y: 0 });
  const group = useRef<THREE.Group>(null);
  const start = useRef<number | null>(null);
  const tmp = useMemo(() => ({ from: new THREE.Vector3(), to: new THREE.Vector3(), look: new THREE.Vector3() }), []);

  useEffect(() => {
    const move = (e: PointerEvent) => {
      pointer.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      pointer.current.y = (e.clientY / window.innerHeight) * 2 - 1;
    };
    window.addEventListener("pointermove", move, { passive: true });
    return () => window.removeEventListener("pointermove", move);
  }, []);

  const aspect = size.width / size.height;
  const wide = aspect > 1.05;
  // Keep the tower a consistent size: pull back further on narrow screens
  // Portrait (phones): smaller, lower-right, so the headline sits on clear sky
  const dist = wide ? 17 : 27;
  const towerX = wide ? Math.min(4.2, 2.2 * aspect) : 2.2;
  const lookLift = wide ? 0 : 2.6;

  useFrame((state, dt) => {
    const now = state.clock.elapsedTime;
    if (start.current === null) start.current = now;
    const intro = reduced ? 1 : ease(Math.min(1, (now - start.current) / 3.4));
    const scroll = Math.min(1, window.scrollY / window.innerHeight);
    const k = 1 - Math.pow(0.02, Math.min(dt, 0.1));
    smooth.current.x += (pointer.current.x - smooth.current.x) * k;
    smooth.current.y += (pointer.current.y - smooth.current.y) * k;

    tmp.from.set(towerX * 0.5, 0.6, dist + 9);
    tmp.to.set(-0.8 + smooth.current.x * 0.7, 2.3 - smooth.current.y * 0.35 + scroll * 1.6, dist - scroll * 2.5);
    camera.position.lerpVectors(tmp.from, tmp.to, intro);
    tmp.look.set(0, TOWER_CENTER_Y - 0.2 + lookLift + scroll * 0.8, 0);
    camera.lookAt(tmp.look);

    if (group.current) {
      group.current.position.x = towerX;
      group.current.rotation.y = -0.7 + (1 - intro) * 0.6 + scroll * 1.2 + (reduced ? 0 : now * 0.03);
    }
  });

  return (
    <group ref={group}>
      <Tower mood="night" detail={quality === "high" ? 1 : 0.75} />
      <Site mood="night" />
      <City mood="night" lights={quality === "high" ? 1800 : 800} density={quality === "high" ? 1 : 0.6} />
    </group>
  );
}

export default function HeroScene({ active, reduced, quality, onReady }: SceneProps) {
  const high = quality === "high";
  return (
    <Canvas
      dpr={high ? [1, 1.75] : [1, 1.25]}
      gl={{ antialias: !high, powerPreference: "high-performance" }}
      camera={{ fov: 34, near: 0.1, far: 120, position: [0, 0.6, 26] }}
      frameloop={active && !reduced ? "always" : "demand"}
      onCreated={({ gl }) => {
        gl.toneMapping = THREE.ACESFilmicToneMapping;
        gl.toneMappingExposure = 1.1;
        requestAnimationFrame(() => requestAnimationFrame(() => onReady?.()));
      }}
      style={{ pointerEvents: "none" }}
      aria-hidden
    >
      <color attach="background" args={["#0b1324"]} />
      <SkyDome mood="night" radius={85} />
      {/* fog colour = sky horizon, so the ground melts into a warm city-glow haze (no hard horizon line) */}
      <fog attach="fog" args={[MOODS.night.horizon, 16, 46]} />
      <MoodLights mood="night" fog={false} />
      <directionalLight position={[6, 10, 4]} intensity={0.6} color="#f3dfb0" />
      <MoodEnvironment mood="night" />
      <Rig reduced={reduced} quality={quality} />
      {high && <Effects />}
    </Canvas>
  );
}
