"use client";

// JourneyLine (sd-web-design · recipes/scroll/scroll-journey-line.md): ties a
// vertical journey to the reader's scroll instead of a timer. A stage is
// "reached" when an imaginary reading line 65% down the viewport passes its
// marker, and the spine fills to the same point.
//
// Progress only ever moves forward. Scrolling back up to re-read a stage must
// not un-light it or make "places their data now lives" count down - the
// journey you have travelled stays drawn.

import { useCallback, useEffect, useRef, useState, type RefObject } from "react";
import { useMotionValue, useMotionValueEvent, useScroll, useSpring, type MotionValue } from "framer-motion";

interface Options {
  /** Number of stages - re-measures when it changes. */
  count: number;
  /** Distance from an item's top to its marker centre (the tile centre). */
  markerOffset: number;
  /** Off for reduced motion / timer mode: no scroll work at all. */
  enabled: boolean;
}

export interface ScrollJourney {
  /** Stages reached so far (0..count). */
  reached: number;
  /** 0..1 fill of the spine, from the first marker to the last. Spring-smoothed. */
  fill: MotionValue<number>;
  /** Spine geometry in px, relative to the list: top = first marker, height = to last marker. */
  spine: { top: number; height: number };
}

export function useScrollJourney(
  listRef: RefObject<HTMLOListElement | null>,
  { count, markerOffset, enabled }: Options,
): ScrollJourney {
  const { scrollYProgress } = useScroll({ target: listRef, offset: ["start 65%", "end 65%"] });
  const raw = useMotionValue(0);
  const fill = useSpring(raw, { stiffness: 140, damping: 30, restDelta: 0.001 });
  const [reached, setReached] = useState(0);
  const [spine, setSpine] = useState({ top: markerOffset, height: 0 });
  // Marker positions (px from the list top) and list height, kept in a ref so
  // the scroll handler never re-subscribes.
  const geo = useRef({ markers: [] as number[], height: 1 });
  const best = useRef({ reached: 0, fill: 0 });

  const update = useCallback(
    (v: number) => {
      const { markers, height } = geo.current;
      if (!markers.length) return;
      const y = v * height; // reading line, in px from the list top
      let r = 0;
      for (const m of markers) if (y >= m) r += 1;
      const first = markers[0];
      const span = markers[markers.length - 1] - first;
      const f = span > 0 ? Math.min(1, Math.max(0, (y - first) / span)) : r ? 1 : 0;
      if (r > best.current.reached) {
        best.current.reached = r;
        setReached(r);
      }
      if (f > best.current.fill) {
        best.current.fill = f;
        raw.set(f);
      }
    },
    [raw],
  );

  useEffect(() => {
    const ol = listRef.current;
    if (!enabled || !ol) return;
    const measure = () => {
      const markers = Array.from(ol.children).map(
        (li) => (li as HTMLElement).offsetTop + markerOffset,
      );
      geo.current = { markers, height: Math.max(1, ol.offsetHeight) };
      setSpine({ top: markers[0] ?? markerOffset, height: (markers.at(-1) ?? 0) - (markers[0] ?? 0) });
      // A deep link or a reload can land mid-page: settle from the current
      // position without waiting for the first scroll event.
      update(scrollYProgress.get());
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(ol);
    return () => ro.disconnect();
  }, [listRef, enabled, count, markerOffset, scrollYProgress, update]);

  useMotionValueEvent(scrollYProgress, "change", (v) => {
    if (enabled) update(v);
  });

  return { reached, fill, spine };
}
