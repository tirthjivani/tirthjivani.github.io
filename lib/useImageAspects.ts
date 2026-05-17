"use client";

import { useEffect, useState } from "react";
import type { Project } from "@/data/projects";

// Loads each project's natural width/height ratio (image natural size for
// images, videoWidth/videoHeight for videos). Empty until each item resolves;
// callers should fall back to a default aspect while entries are missing.
export function useImageAspects(projects: Project[]): Record<string, number> {
  const [map, setMap] = useState<Record<string, number>>({});

  useEffect(() => {
    let cancelled = false;
    projects.forEach((p) => {
      if (p.video) {
        const v = document.createElement("video");
        v.src = p.video;
        v.preload = "metadata";
        v.muted = true;
        v.addEventListener(
          "loadedmetadata",
          () => {
            if (!cancelled && v.videoWidth && v.videoHeight) {
              setMap((prev) =>
                prev[p.id]
                  ? prev
                  : { ...prev, [p.id]: v.videoWidth / v.videoHeight }
              );
            }
          },
          { once: true }
        );
      } else {
        const img = new window.Image();
        if (p.image.src.startsWith("http")) img.crossOrigin = "anonymous";
        img.src = p.image.src;
        img.onload = () => {
          if (!cancelled && img.naturalWidth && img.naturalHeight) {
            setMap((prev) =>
              prev[p.id]
                ? prev
                : { ...prev, [p.id]: img.naturalWidth / img.naturalHeight }
            );
          }
        };
      }
    });
    return () => {
      cancelled = true;
    };
  }, [projects]);

  return map;
}
