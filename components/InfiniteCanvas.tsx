"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { getLenis } from "@/lib/lenis";

type Props = {
  images?: string[];
  imageRootPath?: string;
  numberOfImages?: number;
  imageSize?: string;
  gap?: string;
  className?: string;
};

const FRICTION = 0.92;
const LERP = 0.12;

function parseLength(value: string): number {
  const v = value.trim();
  if (v.endsWith("vw")) return (parseFloat(v) / 100) * window.innerWidth;
  if (v.endsWith("vh")) return (parseFloat(v) / 100) * window.innerHeight;
  if (v.endsWith("px")) return parseFloat(v);
  const n = parseFloat(v);
  return isNaN(n) ? 0 : n;
}

export function InfiniteCanvas({
  images,
  imageRootPath,
  numberOfImages = 12,
  imageSize = "20vw",
  gap = "8vw",
  className = "",
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const layerRef = useRef<HTMLDivElement>(null);

  const targetRef = useRef({ x: 0, y: 0 });
  const currentRef = useRef({ x: 0, y: 0 });
  const velocityRef = useRef({ x: 0, y: 0 });
  const dragRef = useRef<{
    active: boolean;
    pointerId: number | null;
    startX: number;
    startY: number;
    startTargetX: number;
    startTargetY: number;
    lastX: number;
    lastY: number;
    lastTime: number;
  }>({
    active: false,
    pointerId: null,
    startX: 0,
    startY: 0,
    startTargetX: 0,
    startTargetY: 0,
    lastX: 0,
    lastY: 0,
    lastTime: 0,
  });

  const [tile, setTile] = useState({ size: 0, gap: 0, vw: 0, vh: 0 });
  const [base, setBase] = useState({ col: 0, row: 0 });

  const imageList = useMemo(() => {
    if (images && images.length > 0) return images;
    if (imageRootPath) {
      return Array.from(
        { length: numberOfImages },
        (_, i) => `${imageRootPath}/img${i + 1}.png`
      );
    }
    return Array.from(
      { length: numberOfImages },
      (_, i) => `https://picsum.photos/seed/photo${i + 1}/800/800`
    );
  }, [images, imageRootPath, numberOfImages]);

  useEffect(() => {
    const compute = () => {
      setTile({
        size: parseLength(imageSize),
        gap: parseLength(gap),
        vw: window.innerWidth,
        vh: window.innerHeight,
      });
    };
    compute();
    window.addEventListener("resize", compute);
    return () => window.removeEventListener("resize", compute);
  }, [imageSize, gap]);

  useEffect(() => {
    const lenis = getLenis();
    lenis?.stop();
    return () => {
      lenis?.start();
    };
  }, []);

  useEffect(() => {
    if (tile.size === 0) return;
    const cell = tile.size + tile.gap;

    let raf = 0;
    const tick = () => {
      const t = targetRef.current;
      const c = currentRef.current;
      const v = velocityRef.current;

      if (!dragRef.current.active) {
        t.x += v.x;
        t.y += v.y;
        v.x *= FRICTION;
        v.y *= FRICTION;
        if (Math.abs(v.x) < 0.01) v.x = 0;
        if (Math.abs(v.y) < 0.01) v.y = 0;
      }

      c.x += (t.x - c.x) * LERP;
      c.y += (t.y - c.y) * LERP;

      const newCol = Math.floor(c.x / cell);
      const newRow = Math.floor(c.y / cell);
      setBase((prev) =>
        prev.col === newCol && prev.row === newRow
          ? prev
          : { col: newCol, row: newRow }
      );

      const wrapX = c.x - newCol * cell;
      const wrapY = c.y - newRow * cell;
      if (layerRef.current) {
        layerRef.current.style.transform = `translate3d(${-wrapX - cell}px, ${-wrapY - cell}px, 0)`;
      }

      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [tile.size, tile.gap]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      targetRef.current.x += e.deltaX;
      targetRef.current.y += e.deltaY;
      velocityRef.current = { x: 0, y: 0 };
    };

    const onPointerDown = (e: PointerEvent) => {
      el.setPointerCapture(e.pointerId);
      dragRef.current = {
        active: true,
        pointerId: e.pointerId,
        startX: e.clientX,
        startY: e.clientY,
        startTargetX: targetRef.current.x,
        startTargetY: targetRef.current.y,
        lastX: e.clientX,
        lastY: e.clientY,
        lastTime: performance.now(),
      };
      velocityRef.current = { x: 0, y: 0 };
    };

    const onPointerMove = (e: PointerEvent) => {
      const d = dragRef.current;
      if (!d.active || d.pointerId !== e.pointerId) return;
      const dx = e.clientX - d.startX;
      const dy = e.clientY - d.startY;
      targetRef.current.x = d.startTargetX - dx;
      targetRef.current.y = d.startTargetY - dy;

      const now = performance.now();
      const dt = Math.max(1, now - d.lastTime);
      velocityRef.current = {
        x: -((e.clientX - d.lastX) / dt) * 16,
        y: -((e.clientY - d.lastY) / dt) * 16,
      };
      d.lastX = e.clientX;
      d.lastY = e.clientY;
      d.lastTime = now;
    };

    const endDrag = (e: PointerEvent) => {
      const d = dragRef.current;
      if (!d.active || d.pointerId !== e.pointerId) return;
      try {
        el.releasePointerCapture(e.pointerId);
      } catch {}
      d.active = false;
      d.pointerId = null;
    };

    el.addEventListener("wheel", onWheel, { passive: false });
    el.addEventListener("pointerdown", onPointerDown);
    el.addEventListener("pointermove", onPointerMove);
    el.addEventListener("pointerup", endDrag);
    el.addEventListener("pointercancel", endDrag);
    return () => {
      el.removeEventListener("wheel", onWheel);
      el.removeEventListener("pointerdown", onPointerDown);
      el.removeEventListener("pointermove", onPointerMove);
      el.removeEventListener("pointerup", endDrag);
      el.removeEventListener("pointercancel", endDrag);
    };
  }, []);

  if (tile.size === 0) {
    return (
      <div
        ref={containerRef}
        className={`relative h-screen w-screen overflow-hidden ${className}`}
      />
    );
  }

  const cell = tile.size + tile.gap;
  const cols = Math.ceil(tile.vw / cell) + 3;
  const rows = Math.ceil(tile.vh / cell) + 3;
  const total = imageList.length;

  const cells: Array<{ key: string; src: string; left: number; top: number }> = [];
  for (let i = 0; i < cols; i++) {
    for (let j = 0; j < rows; j++) {
      const globalCol = base.col - 1 + i;
      const globalRow = base.row - 1 + j;
      const idx = (((globalCol * 7 + globalRow * 13) % total) + total) % total;
      cells.push({
        key: `${globalCol},${globalRow}`,
        src: imageList[idx],
        left: i * cell,
        top: j * cell,
      });
    }
  }

  return (
    <div
      ref={containerRef}
      className={`fixed inset-0 touch-none overflow-hidden ${className}`}
      style={{ cursor: "grab" }}
    >
      <div
        ref={layerRef}
        className="absolute left-0 top-0 will-change-transform"
        style={{ width: 1, height: 1 }}
      >
        {cells.map((c) => (
          <div
            key={c.key}
            className="absolute overflow-hidden"
            style={{
              left: c.left,
              top: c.top,
              width: tile.size,
              height: tile.size,
            }}
          >
            <Image
              src={c.src}
              alt=""
              fill
              sizes="20vw"
              className="object-cover"
              draggable={false}
              unoptimized={c.src.startsWith("http")}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
