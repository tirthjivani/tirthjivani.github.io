"use client";

import { useEffect, useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { buildGalleryLayout } from "@/lib/three/galleryLayout";
import { GalleryPlane } from "./GalleryPlane";
import { useScrollRig } from "./hooks/useScrollRig";
import { useParallax } from "./hooks/useParallax";
import { RigContext, useRig } from "./rigContext";
import type { Project } from "@/data/projects";

type HoverPayload = { x: number; y: number; index: number } | null;

type Props = {
  projects: Project[];
  cyclePx: number;
  initialOffset?: number;
  onHoverChange?: (h: HoverPayload) => void;
  onSelect?: (project: Project) => void;
};

const CAMERA_Z = 4.6;
const CAMERA_SMOOTH = 0.075;
const PROGRESS_SMOOTH = 6;
const COPIES = [-1, 0, 1] as const;

function wrapPositive(v: number, m: number) {
  if (m <= 0) return v;
  return ((v % m) + m) % m;
}

function CameraRig({
  cycleWidth,
  initialOffset,
}: {
  cycleWidth: number;
  initialOffset: number;
}) {
  const camera = useThree((s) => s.camera);
  const size = useThree((s) => s.size);
  const rig = useRig();

  useEffect(() => {
    camera.position.set(initialOffset * cycleWidth, 0, CAMERA_Z);
    camera.lookAt(initialOffset * cycleWidth, 0, 0);
    camera.userData.surfInit = false;
  }, [camera, cycleWidth, initialOffset]);

  useEffect(() => {
    if (camera instanceof THREE.PerspectiveCamera) {
      camera.aspect = size.width / size.height;
      camera.updateProjectionMatrix();
    }
  }, [camera, size.width, size.height]);

  useFrame((_, dt) => {
    const s = rig.scroll.current;
    s.current += (s.target - s.current) * Math.min(1, dt * PROGRESS_SMOOTH);
    s.velocity = s.target - s.current;

    const p = rig.parallax.current;
    p.currentX += (p.targetX - p.currentX) * Math.min(1, dt * 4);
    p.currentY += (p.targetY - p.currentY) * Math.min(1, dt * 4);

    const worldX = (s.current + initialOffset) * cycleWidth;
    const wrappedX = wrapPositive(worldX, cycleWidth);

    // Cinematic Y wave tied to cycle phase so it loops seamlessly.
    const phase = wrappedX / Math.max(1e-6, cycleWidth);
    const cinematicY = Math.sin(phase * Math.PI * 2) * 0.16;

    const targetX = wrappedX + p.currentX * 0.32;
    const targetY = cinematicY + p.currentY * 0.18;

    // Snap on first frame; smooth thereafter.
    if (camera.userData.surfInit !== true) {
      camera.position.x = targetX;
      camera.position.y = targetY;
      camera.userData.surfInit = true;
    } else {
      // If the wrapped target jumped across the cycle boundary, shift the
      // camera by ±cycleWidth so smoothing only crosses the short distance.
      const diff = targetX - camera.position.x;
      if (Math.abs(diff) > cycleWidth * 0.5) {
        camera.position.x += Math.sign(diff) * cycleWidth;
      }
      camera.position.x += (targetX - camera.position.x) * CAMERA_SMOOTH;
      camera.position.y += (targetY - camera.position.y) * CAMERA_SMOOTH;
    }
    camera.position.z = CAMERA_Z;
    camera.rotation.z = -s.velocity * 0.45;
    camera.rotation.x = -p.currentY * 0.04;
    camera.rotation.y = p.currentX * 0.06;
  });

  return null;
}

export function Experience({
  projects,
  cyclePx,
  initialOffset = 0,
  onHoverChange,
  onSelect,
}: Props) {
  const layout = useMemo(
    () => buildGalleryLayout(projects.length),
    [projects.length]
  );
  const scrollRef = useScrollRig(cyclePx);
  const parallaxRef = useParallax();

  const rigValue = useMemo(
    () => ({ scroll: scrollRef, parallax: parallaxRef }),
    [scrollRef, parallaxRef]
  );

  const hoveredRef = useRef<number | null>(null);

  return (
    <RigContext.Provider value={rigValue}>
      <CameraRig
        cycleWidth={layout.cycleWidth}
        initialOffset={initialOffset}
      />
      <ambientLight intensity={1.1} />
      <hemisphereLight args={["#ffffff", "#222222", 0.5]} />
      {COPIES.flatMap((copy) =>
        layout.slots.map((slot) => {
          const project = projects[slot.projectIndex];
          if (!project) return null;
          const isVideo = !!project.video;
          const src = isVideo ? project.video! : project.image.src;
          const shiftedSlot = {
            ...slot,
            position: [
              slot.position[0] + copy * layout.cycleWidth,
              slot.position[1],
              slot.position[2],
            ] as [number, number, number],
          };
          return (
            <GalleryPlane
              key={`${copy}_${slot.index}`}
              slot={shiftedSlot}
              src={src}
              isVideo={isVideo}
              onPointerOver={(e) => {
                hoveredRef.current = slot.projectIndex;
                const ev = e.nativeEvent as PointerEvent;
                onHoverChange?.({
                  x: ev.clientX,
                  y: ev.clientY,
                  index: slot.projectIndex,
                });
              }}
              onPointerOut={() => {
                if (hoveredRef.current === slot.projectIndex) {
                  hoveredRef.current = null;
                  onHoverChange?.(null);
                }
              }}
              onClick={() => onSelect?.(project)}
            />
          );
        })
      )}
    </RigContext.Provider>
  );
}
