"use client";

import { Canvas } from "@react-three/fiber";
import * as THREE from "three";
import { Experience } from "./Experience";
import type { Project } from "@/data/projects";

type HoverPayload = { x: number; y: number; index: number } | null;

type Props = {
  projects: Project[];
  cyclePx: number;
  initialOffset?: number;
  onHoverChange?: (h: HoverPayload) => void;
  onSelect?: (project: Project) => void;
};

export function Scene({
  projects,
  cyclePx,
  initialOffset = 0,
  onHoverChange,
  onSelect,
}: Props) {
  return (
    <Canvas
      dpr={[1, 1.75]}
      gl={{
        antialias: true,
        alpha: true,
        powerPreference: "high-performance",
      }}
      camera={{ position: [0, 0, 4.6], fov: 38, near: 0.1, far: 60 }}
      onCreated={({ gl }) => {
        gl.outputColorSpace = THREE.SRGBColorSpace;
        gl.setClearColor(0x000000, 0);
      }}
      style={{
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        background: "transparent",
      }}
    >
      <Experience
        projects={projects}
        cyclePx={cyclePx}
        initialOffset={initialOffset}
        onHoverChange={onHoverChange}
        onSelect={onSelect}
      />
    </Canvas>
  );
}
