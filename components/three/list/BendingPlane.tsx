"use client";

import {
  Suspense,
  useEffect,
  useMemo,
  useRef,
  type RefObject,
} from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { useTexture, useVideoTexture } from "@react-three/drei";
import * as THREE from "three";
import type { Project } from "@/data/projects";

// Target on-screen area per image (px²) — calibrated to ≈ two 12-col
// columns squared so each card lands visually the same size regardless of
// its aspect ratio. Max bounds keep extreme aspects in check.
export const LIST_IMG_TARGET_AREA = 280 * 280;
export const LIST_IMG_MAX_WIDTH = 380;
export const LIST_IMG_MAX_HEIGHT = 320;

export function sizeForAspect(aspect: number): { w: number; h: number } {
  const safe = Math.max(0.5, Math.min(3, aspect));
  let h = Math.sqrt(LIST_IMG_TARGET_AREA / safe);
  let w = safe * h;
  if (w > LIST_IMG_MAX_WIDTH) {
    w = LIST_IMG_MAX_WIDTH;
    h = w / safe;
  }
  if (h > LIST_IMG_MAX_HEIGHT) {
    h = LIST_IMG_MAX_HEIGHT;
    w = h * safe;
  }
  return { w, h };
}

type CoreProps = {
  copy: number;
  index: number;
  total: number;
  sectionHeight: number;
  aspect: number;
  velocityRef: RefObject<number>;
};

// Velocity-driven vertical drag on the LEADING edge.
// Scroll down (uVelocity > 0): top edge stretches upward; bottom anchored.
// Scroll up   (uVelocity < 0): bottom edge stretches downward; top anchored.
const vertexShader = /* glsl */ `
  uniform float uVelocity;
  varying vec2 vUv;
  void main() {
    vUv = uv;
    vec3 newPosition = position;
    float velDown = max(uVelocity, 0.0);
    float velUp = max(-uVelocity, 0.0);
    float topMask = pow(uv.y, 1.4);
    float bottomMask = pow(1.0 - uv.y, 1.4);
    float stretch = velDown * topMask - velUp * bottomMask;
    newPosition.y += stretch * 110.0;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition, 1.0);
  }
`;

const fragmentShader = /* glsl */ `
  uniform sampler2D uTexture;
  varying vec2 vUv;
  void main() {
    gl_FragColor = texture2D(uTexture, vUv);
  }
`;


function PlaneCore({
  texture,
  copy,
  index,
  total,
  sectionHeight,
  aspect,
  velocityRef,
}: CoreProps & { texture: THREE.Texture }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const matRef = useRef<THREE.ShaderMaterial>(null);
  const size = useThree((s) => s.size);

  const { w, h } = useMemo(() => sizeForAspect(aspect), [aspect]);

  const uniforms = useMemo(
    () => ({
      uVelocity: { value: 0 },
      uTexture: { value: texture },
    }),
    [texture]
  );

  useEffect(() => {
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.anisotropy = 8;
    texture.minFilter = THREE.LinearFilter;
    texture.magFilter = THREE.LinearFilter;
    texture.generateMipmaps = false;
    if (matRef.current) {
      matRef.current.uniforms.uTexture.value = texture;
      matRef.current.uniforms.uTexture.value.needsUpdate = true;
    }
  }, [texture]);

  useFrame(() => {
    if (!meshRef.current) return;
    const cycleH = total * sectionHeight;
    const yInDOM =
      copy * cycleH + index * sectionHeight + sectionHeight / 2;
    const screenY = yInDOM - window.scrollY;
    meshRef.current.position.x = 0;
    meshRef.current.position.y = size.height / 2 - screenY;

    if (matRef.current) {
      matRef.current.uniforms.uVelocity.value = velocityRef.current ?? 0;
    }
  });

  return (
    <mesh ref={meshRef}>
      <planeGeometry args={[w, h, 32, 32]} />
      <shaderMaterial
        ref={matRef}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
        transparent={false}
        toneMapped={false}
      />
    </mesh>
  );
}

function ImagePlane({ src, ...rest }: CoreProps & { src: string }) {
  const texture = useTexture(src) as THREE.Texture;
  return <PlaneCore {...rest} texture={texture} />;
}

function VideoPlane({ src, ...rest }: CoreProps & { src: string }) {
  const texture = useVideoTexture(src, {
    muted: true,
    loop: true,
    start: true,
    playsInline: true,
    crossOrigin: "anonymous",
  });
  return <PlaneCore {...rest} texture={texture as unknown as THREE.Texture} />;
}

export type BendingPlaneProps = CoreProps & { project: Project };

export function BendingPlane({ project, ...rest }: BendingPlaneProps) {
  if (project.video) {
    return (
      <Suspense fallback={null}>
        <VideoPlane {...rest} src={project.video} />
      </Suspense>
    );
  }
  return (
    <Suspense fallback={null}>
      <ImagePlane {...rest} src={project.image.src} />
    </Suspense>
  );
}
