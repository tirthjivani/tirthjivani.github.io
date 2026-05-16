"use client";

import { useEffect, useState } from "react";
import { PHOTO_PATHS } from "@/data/photos";

// Probes each path and returns the subset that actually loads. Photo files
// may not all be on disk yet — the Three.js Surf scene throws on 404 textures,
// so we filter before handing the list to consumers.
export function useAvailablePhotos(): string[] {
  const [photos, setPhotos] = useState<string[]>([]);

  useEffect(() => {
    let cancelled = false;
    Promise.all(
      PHOTO_PATHS.map(
        (path) =>
          new Promise<string | null>((resolve) => {
            const img = new window.Image();
            img.onload = () => resolve(path);
            img.onerror = () => resolve(null);
            img.src = path;
          })
      )
    ).then((results) => {
      if (cancelled) return;
      const ok = results.filter((p): p is string => p !== null);
      setPhotos(ok);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  return photos;
}
