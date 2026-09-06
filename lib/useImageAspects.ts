"use client";

import { useEffect, useMemo, useState } from "react";
import type { Project } from "@/data/projects";

// Used when a source fails to load, or never reports a size at all. Consumers
// gate layout on "every id is present in the map" — so every id MUST get a
// terminal value, or that gate never opens and the list is stuck rendering
// every tile at its placeholder aspect. (A `.mov` that the browser refuses to
// decode, or a 404'd image, used to hang it forever.)
const FALLBACK_ASPECT = 1.6;
const RESOLVE_TIMEOUT_MS = 6000;

type Entry = { id: string; src: string; isVideo: boolean };

// Aspect baked into the seed data, when the media's intrinsic size is known
// ahead of time. Local files always have it (see data/projects.seeds.json);
// remote placeholders don't, and have to be measured.
function bakedAspect(p: Project): number | null {
  const { width, height } = p.image;
  if (!width || !height) return null;
  const aspect = width / height;
  return Number.isFinite(aspect) && aspect > 0 ? aspect : null;
}

// Loads each project's natural width/height ratio (natural size for images,
// videoWidth/videoHeight for videos). Entries appear as they resolve; every id
// is guaranteed to land within RESOLVE_TIMEOUT_MS whether or not its media
// loaded.
export function useImageAspects(projects: Project[]): Record<string, number> {
  // Anything with a baked size is known before the first paint — no request,
  // no waiting. This is what lets the list and the intro lay out immediately
  // instead of blocking on ~2MB of images downloading first.
  //
  // Keyed on content rather than array identity, for the same reason as
  // `signature` below: callers pass freshly-built arrays every render.
  const bakedSignature = projects
    .map((p) => `${p.id}:${p.image.width ?? ""}x${p.image.height ?? ""}`)
    .join("\n");
  const baked = useMemo(() => {
    const out: Record<string, number> = {};
    for (const line of bakedSignature ? bakedSignature.split("\n") : []) {
      const [id, dims] = line.split(":");
      const [w, h] = dims.split("x").map(Number);
      if (w > 0 && h > 0) out[id] = w / h;
    }
    return out;
  }, [bakedSignature]);

  // Callers routinely pass a freshly-filtered array (`projects.filter(...)`)
  // straight into this hook, so keying the effect on array identity would
  // restart it on every render. Key on the content instead. Only entries
  // WITHOUT a baked size need measuring.
  const signature = projects
    .filter((p) => bakedAspect(p) === null)
    .map((p) => `${p.id}\t${p.video ?? p.image.src}\t${p.video ? "v" : "i"}`)
    .join("\n");

  const entries = useMemo<Entry[]>(
    () =>
      signature
        ? signature.split("\n").map((line) => {
            const [id, src, kind] = line.split("\t");
            return { id, src, isVideo: kind === "v" };
          })
        : [],
    [signature]
  );

  const [measured, setMeasured] = useState<Record<string, number>>({});

  useEffect(() => {
    if (entries.length === 0) return;
    let cancelled = false;
    let flushHandle = 0;
    const resolved: Record<string, number> = {};
    const cleanups: Array<() => void> = [];

    const flush = () => {
      flushHandle = 0;
      if (cancelled) return;
      setMeasured((prev) => {
        const keys = Object.keys(resolved);
        // Bail when nothing actually changed, so a caller passing an unstable
        // `projects` array can't ping-pong between renders forever.
        if (
          keys.length === Object.keys(prev).length &&
          keys.every((k) => prev[k] === resolved[k])
        ) {
          return prev;
        }
        return { ...resolved };
      });
    };

    // Batch per frame: a dozen images resolving in the same tick should cost
    // one render, not a dozen.
    const scheduleFlush = () => {
      if (cancelled || flushHandle) return;
      flushHandle = requestAnimationFrame(flush);
    };

    const settle = (id: string, aspect: number) => {
      if (cancelled || resolved[id] != null) return;
      resolved[id] =
        Number.isFinite(aspect) && aspect > 0 ? aspect : FALLBACK_ASPECT;
      scheduleFlush();
    };

    for (const entry of entries) {
      if (entry.isVideo) {
        const v = document.createElement("video");
        v.preload = "metadata";
        v.muted = true;
        const onMeta = () => settle(entry.id, v.videoWidth / v.videoHeight);
        const onFail = () => settle(entry.id, 0);
        v.addEventListener("loadedmetadata", onMeta, { once: true });
        v.addEventListener("error", onFail, { once: true });
        v.src = entry.src;
        cleanups.push(() => {
          v.removeEventListener("loadedmetadata", onMeta);
          v.removeEventListener("error", onFail);
          // Detach the source so an in-flight metadata fetch is abandoned
          // instead of running to completion against a discarded element.
          v.removeAttribute("src");
          v.load();
        });
      } else {
        const img = new window.Image();
        if (entry.src.startsWith("http")) img.crossOrigin = "anonymous";
        img.onload = () => settle(entry.id, img.naturalWidth / img.naturalHeight);
        img.onerror = () => settle(entry.id, 0);
        img.src = entry.src;
        cleanups.push(() => {
          img.onload = null;
          img.onerror = null;
        });
      }
    }

    // Backstop: anything still outstanding settles at the fallback aspect so
    // the map always completes.
    const timer = window.setTimeout(() => {
      for (const entry of entries) settle(entry.id, 0);
    }, RESOLVE_TIMEOUT_MS);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
      if (flushHandle) cancelAnimationFrame(flushHandle);
      for (const cleanup of cleanups) cleanup();
    };
  }, [entries]);

  // Baked sizes are exact and never change; measured ones fill in around them.
  return useMemo(
    () => (Object.keys(measured).length === 0 ? baked : { ...baked, ...measured }),
    [baked, measured]
  );
}
