'use client';

import { useEffect, useState } from 'react';

/**
 * Highlights the navigation entry for the section currently filling the
 * viewport. Uses a single IntersectionObserver with a band near the top of the
 * screen rather than a scroll listener, so it costs nothing while idle.
 */
export function useScrollSpy(ids: string[], offset = 96) {
  const [activeId, setActiveId] = useState<string | null>(ids[0] ?? null);

  useEffect(() => {
    if (ids.length === 0 || typeof IntersectionObserver === 'undefined') return;

    const visible = new Map<string, number>();

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) visible.set(entry.target.id, entry.intersectionRatio);
          else visible.delete(entry.target.id);
        }

        if (visible.size === 0) return;
        // Prefer the section that is closest to the top of the reading band.
        const ordered = ids.filter((id) => visible.has(id));
        setActiveId(ordered[0] ?? null);
      },
      {
        rootMargin: `-${offset}px 0px -55% 0px`,
        threshold: [0, 0.15, 0.35],
      },
    );

    const elements = ids
      .map((id) => document.getElementById(id))
      .filter((element): element is HTMLElement => element !== null);

    elements.forEach((element) => observer.observe(element));
    return () => observer.disconnect();
  }, [ids, offset]);

  return activeId;
}
