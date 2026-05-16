"use client";

import { useEffect, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { getLenis } from "@/lib/lenis";
import { BendingPlane } from "./BendingPlane";
import type { Project } from "@/data/projects";

type Props = {
  projects: Project[];
  aspects: Record<string, number>;
  sectionHeight: number;
};

function OrthoRig() {
  const camera = useThree((s) => s.camera);
  const size = useThree((s) => s.size);
  useEffect(() => {
    if (!(camera instanceof THREE.OrthographicCamera)) return;
    camera.left = -size.width / 2;
    camera.right = size.width / 2;
    camera.top = size.height / 2;
    camera.bottom = -size.height / 2;
    camera.near = 0.1;
    camera.far = 100;
    camera.position.z = 10;
    camera.updateProjectionMatrix();
  }, [camera, size.width, size.height]);
  return null;
}

function SceneContents({ projects, aspects, sectionHeight }: Props) {
  const velocityRef = useRef(0);
  const lastY = useRef(0);
  const lastTime = useRef(0);

  useEffect(() => {
    lastY.current = window.scrollY;
    lastTime.current = performance.now();
    const onScroll = () => {
      const y = window.scrollY;
      const now = performance.now();
      const dt = Math.max(1, now - lastTime.current);
      const dy = y - lastY.current;
      // px/ms, clamped — pacomepertant-style velocity feel.
      const v = Math.max(-3, Math.min(3, dy / dt));
      velocityRef.current += (v - velocityRef.current) * 0.5;
      lastY.current = y;
      lastTime.current = now;
    };
    const lenis = getLenis();
    if (lenis) lenis.on("scroll", onScroll);
    else window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      const l = getLenis();
      if (l) l.off("scroll", onScroll);
      else window.removeEventListener("scroll", onScroll);
    };
  }, []);

  useFrame((_, dt) => {
    // Slightly slower decay so the stretch lingers through long swipes.
    velocityRef.current *= Math.max(0, 1 - dt * 3.2);
  });

  return (
    <>
      <OrthoRig />
      {[0, 1, 2].flatMap((copy) =>
        projects.map((project, i) => (
          <BendingPlane
            key={`${copy}-${project.id}`}
            project={project}
            copy={copy}
            index={i}
            total={projects.length}
            sectionHeight={sectionHeight}
            aspect={aspects[project.id] ?? 1.6}
            velocityRef={velocityRef}
          />
        ))
      )}
    </>
  );
}

export function ListCanvas(props: Props) {
  return (
    <Canvas
      orthographic
      camera={{ position: [0, 0, 10], near: 0.1, far: 100 }}
      dpr={[1, 1.75]}
      gl={{ alpha: true, antialias: true }}
      style={{
        position: "fixed",
        inset: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
        zIndex: 5,
      }}
    >
      <SceneContents {...props} />
    </Canvas>
  );
}
