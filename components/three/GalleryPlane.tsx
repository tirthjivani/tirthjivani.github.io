"use client";

import {
  Suspense,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { useFrame, type ThreeEvent } from "@react-three/fiber";
import { useTexture, useVideoTexture } from "@react-three/drei";
import * as THREE from "three";
import { PLANE_AREA, type GallerySlot } from "@/lib/three/galleryLayout";
import { useRig } from "./rigContext";

const HOVER_TZ = 0.4;
const HOVER_SCALE = 1.05;
const HOVER_TILT = 0.07;

type CommonProps = {
  slot: GallerySlot;
  onPointerOver?: (e: ThreeEvent<PointerEvent>) => void;
  onPointerOut?: (e: ThreeEvent<PointerEvent>) => void;
  onClick?: (e: ThreeEvent<MouseEvent>) => void;
};

function getTextureAspect(texture: THREE.Texture): number {
  const img = texture.image as
    | HTMLImageElement
    | HTMLVideoElement
    | undefined;
  if (!img) return 1;
  const w =
    "videoWidth" in img && img.videoWidth
      ? img.videoWidth
      : (img as HTMLImageElement).naturalWidth || img.width || 0;
  const h =
    "videoHeight" in img && img.videoHeight
      ? img.videoHeight
      : (img as HTMLImageElement).naturalHeight || img.height || 0;
  if (!w || !h) return 1;
  return w / h;
}

// Equal-area sizing: w * h = PLANE_AREA, w / h = aspect.
// → h = sqrt(area / aspect), w = aspect * h
function sizeForAspect(aspect: number): { w: number; h: number } {
  const safe = Math.max(0.2, Math.min(4, aspect));
  const h = Math.sqrt(PLANE_AREA / safe);
  const w = safe * h;
  return { w, h };
}

function PlaneCore({
  slot,
  texture,
  onPointerOver,
  onPointerOut,
  onClick,
}: CommonProps & { texture: THREE.Texture }) {
  const group = useRef<THREE.Group>(null);
  const inner = useRef<THREE.Group>(null);
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);
  const [aspect, setAspect] = useState(() => getTextureAspect(texture) || 1);
  const rig = useRig();

  useEffect(() => {
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.anisotropy = 8;
    texture.minFilter = THREE.LinearFilter;
    texture.magFilter = THREE.LinearFilter;
    texture.generateMipmaps = false;
    texture.center.set(0.5, 0.5);
    texture.repeat.set(1, 1);
    texture.offset.set(0, 0);
    const a = getTextureAspect(texture);
    if (a && a !== aspect) setAspect(a);
  }, [texture, aspect]);

  useEffect(() => {
    const img = texture.image as HTMLImageElement | undefined;
    if (!img || !("addEventListener" in img)) return;
    if ("complete" in img && (img as HTMLImageElement).complete) return;
    const handler = () => {
      const a = getTextureAspect(texture);
      if (a) setAspect(a);
    };
    img.addEventListener("load", handler);
    return () => img.removeEventListener("load", handler);
  }, [texture]);

  const { w, h } = useMemo(() => sizeForAspect(aspect), [aspect]);

  useFrame((_, dt) => {
    if (!inner.current || !group.current) return;
    const k = Math.min(1, dt * 8);
    const ts = hovered ? HOVER_SCALE : 1;
    inner.current.scale.x += (ts - inner.current.scale.x) * k;
    inner.current.scale.y += (ts - inner.current.scale.y) * k;
    inner.current.scale.z += (ts - inner.current.scale.z) * k;
    const tz = hovered ? HOVER_TZ : 0;
    inner.current.position.z += (tz - inner.current.position.z) * k;

    const v = rig.scroll.current.velocity;
    const tiltY = hovered ? HOVER_TILT : -v * 6;
    const tiltX = hovered ? -HOVER_TILT * 0.5 : 0;
    inner.current.rotation.y +=
      (tiltY - inner.current.rotation.y) * Math.min(1, dt * 6);
    inner.current.rotation.x +=
      (tiltX - inner.current.rotation.x) * Math.min(1, dt * 6);

    const t = performance.now() * 0.0005 + slot.driftSeed;
    group.current.position.y =
      slot.position[1] + Math.sin(t) * 0.03 * (hovered ? 0.5 : 1);
  });

  return (
    <group
      ref={group}
      position={slot.position}
      rotation={[0, 0, slot.rotationZ]}
    >
      <group ref={inner}>
        <mesh
          ref={meshRef}
          onPointerOver={(e) => {
            e.stopPropagation();
            setHovered(true);
            onPointerOver?.(e);
          }}
          onPointerOut={(e) => {
            setHovered(false);
            onPointerOut?.(e);
          }}
          onClick={(e) => {
            e.stopPropagation();
            onClick?.(e);
          }}
        >
          <planeGeometry args={[w, h, 1, 1]} />
          <meshBasicMaterial map={texture} toneMapped={false} />
        </mesh>
      </group>
    </group>
  );
}

function ImagePlane({ src, ...rest }: CommonProps & { src: string }) {
  const texture = useTexture(src) as THREE.Texture;
  return <PlaneCore {...rest} texture={texture} />;
}

function VideoPlane({ src, ...rest }: CommonProps & { src: string }) {
  const texture = useVideoTexture(src, {
    muted: true,
    loop: true,
    start: true,
    playsInline: true,
    crossOrigin: "anonymous",
  });
  return <PlaneCore {...rest} texture={texture as unknown as THREE.Texture} />;
}

function PlaneFallback({ slot }: { slot: GallerySlot }) {
  const { w, h } = sizeForAspect(1.5);
  return (
    <mesh position={slot.position} rotation={[0, 0, slot.rotationZ]}>
      <planeGeometry args={[w, h]} />
      <meshBasicMaterial color="#1a1a1a" />
    </mesh>
  );
}

function SuspenseLike({
  children,
  fallback,
}: {
  children: ReactNode;
  fallback: ReactNode;
}) {
  return <Suspense fallback={fallback}>{children}</Suspense>;
}

export type GalleryPlaneProps = CommonProps & {
  src: string;
  isVideo?: boolean;
};

export function GalleryPlane(props: GalleryPlaneProps) {
  const fallback = useMemo(
    () => <PlaneFallback slot={props.slot} />,
    [props.slot]
  );
  if (props.isVideo) {
    return (
      <SuspenseLike fallback={fallback}>
        <VideoPlane {...props} />
      </SuspenseLike>
    );
  }
  return (
    <SuspenseLike fallback={fallback}>
      <ImagePlane {...props} />
    </SuspenseLike>
  );
}
