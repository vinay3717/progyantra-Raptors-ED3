"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { Float, Stars } from "@react-three/drei";
import { useMemo, useRef } from "react";
import type { Group } from "three";

type OrbConfig = {
  position: [number, number, number];
  scale: number;
  color: string;
  speed: number;
};

function DriftOrbs() {
  const groupRef = useRef<Group | null>(null);

  const orbs = useMemo<OrbConfig[]>(
    () => [
      { position: [-2.8, 1.6, -1.8], scale: 1.1, color: "#9ed8ff", speed: 1.4 },
      { position: [2.5, -1.8, -2.4], scale: 1.45, color: "#d4e8ff", speed: 1.1 },
      { position: [0.6, 0.9, -3.2], scale: 0.9, color: "#bde9ff", speed: 1.65 },
      { position: [-0.4, -2.3, -2.2], scale: 1.2, color: "#d0f0ff", speed: 1.25 },
    ],
    []
  );

  useFrame((state, delta) => {
    if (!groupRef.current) return;
    groupRef.current.rotation.y += delta * 0.04;
    groupRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.12) * 0.08;
    groupRef.current.position.y = Math.sin(state.clock.elapsedTime * 0.2) * 0.15;
  });

  return (
    <group ref={groupRef}>
      {orbs.map((orb) => (
        <Float
          key={`${orb.position.join("-")}-${orb.scale}`}
          speed={orb.speed}
          rotationIntensity={0.8}
          floatIntensity={1.2}
        >
          <mesh position={orb.position} scale={orb.scale}>
            <icosahedronGeometry args={[1, 6]} />
            <meshStandardMaterial
              color={orb.color}
              roughness={0.4}
              metalness={0.1}
              transparent
              opacity={0.35}
            />
          </mesh>
        </Float>
      ))}
    </group>
  );
}

export default function AntigravityBackground3D() {
  return (
    <div className="pointer-events-none fixed inset-0 z-0 opacity-65 [mask-image:radial-gradient(70%_60%_at_50%_45%,black,transparent)]">
      <Canvas
        camera={{ position: [0, 0, 7.2], fov: 52 }}
        dpr={1}
        gl={{ antialias: false, alpha: true, powerPreference: "low-power" }}
      >
        <color attach="background" args={["#000000"]} />
        <ambientLight intensity={0.4} />
        <directionalLight position={[5, 6, 4]} intensity={1.1} color="#bfe9ff" />
        <directionalLight position={[-6, -3, -3]} intensity={0.65} color="#ffffff" />
        <DriftOrbs />
        <Stars
          radius={90}
          depth={40}
          count={900}
          factor={4}
          saturation={0}
          fade
          speed={0.4}
        />
      </Canvas>
    </div>
  );
}

