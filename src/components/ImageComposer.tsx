"use client";

import { useRef, useState, useCallback, useEffect } from "react";
import type { StravaActivity } from "@/lib/constants";
import { StravaCard } from "./StravaCard";
import { StravaCardCompact } from "./StravaCardCompact";
import { RouteMap } from "./RouteMap";

const STORY_WIDTH = 1080;
const STORY_HEIGHT = 1920;

const SCALE_MIN = 0.4;
const SCALE_MAX = 1.5;
const SCALE_STEP = 0.1;
const ROTATE_STEP = 15;

type PositionPreset =
  | "top-left"
  | "top-center"
  | "top-right"
  | "center"
  | "bottom-left"
  | "bottom-center"
  | "bottom-right";

const PRESETS: { id: PositionPreset; label: string; x: number; y: number }[] = [
  { id: "top-left", label: "Top Left", x: 0.05, y: 0.08 },
  { id: "top-center", label: "Top Center", x: 0.5, y: 0.08 },
  { id: "top-right", label: "Top Right", x: 0.95, y: 0.08 },
  { id: "center", label: "Center", x: 0.5, y: 0.5 },
  { id: "bottom-left", label: "Bottom Left", x: 0.05, y: 0.92 },
  { id: "bottom-center", label: "Bottom Center", x: 0.5, y: 0.92 },
  { id: "bottom-right", label: "Bottom Right", x: 0.95, y: 0.92 },
];

type LayerId = "card" | "route" | "stats";

interface ImageComposerProps {
  activity: StravaActivity;
  backgroundImage: string | null;
  cardStyle: "map" | "compact";
  statsLayout: "horizontal" | "vertical";
  statsTheme: "light" | "dark";
  exportRef?: React.RefObject<HTMLDivElement | null>;
}

function SizeRotateControls({
  label,
  scale,
  rotation,
  onScaleChange,
  onRotateChange,
}: {
  label: string;
  scale: number;
  rotation: number;
  onScaleChange: (delta: number) => void;
  onRotateChange: (delta: number) => void;
}) {
  return (
    <div className="flex items-center gap-1 sm:gap-2 flex-wrap">
      <span className="text-xs text-zinc-500 w-14 sm:w-16 truncate">{label}</span>
      <div className="flex items-center rounded-full bg-zinc-100 border border-zinc-200 overflow-hidden">
        <button
          type="button"
          aria-label="Decrease size"
          onClick={() => onScaleChange(-SCALE_STEP)}
          className="min-w-[44px] min-h-[44px] sm:min-w-[40px] sm:min-h-[40px] flex items-center justify-center text-zinc-600 hover:bg-zinc-200 active:bg-zinc-300 transition-colors text-lg font-medium"
        >
          −
        </button>
        <button
          type="button"
          aria-label="Increase size"
          onClick={() => onScaleChange(SCALE_STEP)}
          className="min-w-[44px] min-h-[44px] sm:min-w-[40px] sm:min-h-[40px] flex items-center justify-center text-zinc-600 hover:bg-zinc-200 active:bg-zinc-300 transition-colors text-lg font-medium"
        >
          +
        </button>
      </div>
      <button
        type="button"
        aria-label="Rotate"
        onClick={() => onRotateChange(ROTATE_STEP)}
        className="min-w-[44px] min-h-[44px] sm:min-w-[40px] sm:min-h-[40px] flex items-center justify-center rounded-full bg-zinc-100 border border-zinc-200 text-zinc-600 hover:bg-zinc-200 active:bg-zinc-300 transition-colors"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
      </button>
    </div>
  );
}

export function ImageComposer({
  activity,
  backgroundImage,
  cardStyle,
  statsLayout,
  statsTheme,
  exportRef,
}: ImageComposerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.35);

  const setRef = useCallback(
    (el: HTMLDivElement | null) => {
      (containerRef as React.MutableRefObject<HTMLDivElement | null>).current = el;
      if (exportRef) {
        (exportRef as React.MutableRefObject<HTMLDivElement | null>).current = el;
      }
    },
    [exportRef]
  );

  useEffect(() => {
    const wrapper = wrapperRef.current;
    if (!wrapper) return;
    const updateScale = () => {
      const padding = 16;
      const w = Math.max(0, wrapper.clientWidth - padding);
      const h = Math.max(0, wrapper.clientHeight - padding);
      const s = w > 0 && h > 0 ? Math.min(w / STORY_WIDTH, h / STORY_HEIGHT) : 0.35;
      setScale(Math.max(0.2, Math.min(1, s)));
    };
    updateScale();
    const ro = new ResizeObserver(updateScale);
    ro.observe(wrapper);
    return () => ro.disconnect();
  }, []);

  const [position, setPosition] = useState({ x: 0.5, y: 0.92 });
  const [routePos, setRoutePos] = useState({ x: 0.2, y: 0.25 });
  const [statsPos, setStatsPos] = useState({ x: 0.8, y: 0.75 });

  const [cardScale, setCardScale] = useState(0.85);
  const [cardRotation, setCardRotation] = useState(0);
  const [routeScale, setRouteScale] = useState(1);
  const [routeRotation, setRouteRotation] = useState(0);
  const [statsScale, setStatsScale] = useState(1);
  const [statsRotation, setStatsRotation] = useState(0);

  const [dragging, setDragging] = useState<LayerId | null>(null);
  const [selectedLayer, setSelectedLayer] = useState<LayerId | null>(null);
  const dragStartRef = useRef<{
    posX: number;
    posY: number;
    clientX: number;
    clientY: number;
    target: LayerId;
  } | null>(null);

  const touchStartRef = useRef<{ x: number; y: number; target: LayerId } | null>(null);
  const pinchRef = useRef<{
    layer: LayerId;
    dist0: number;
    angle0: number;
    scale0: number;
    rot0: number;
  } | null>(null);

  const setPositionState = (pos: { x: number; y: number }, target: LayerId) => {
    if (target === "card") setPosition(pos);
    if (target === "route") setRoutePos(pos);
    if (target === "stats") setStatsPos(pos);
  };

  const applyPreset = (preset: PositionPreset) => {
    const p = PRESETS.find((x) => x.id === preset)!;
    if (cardStyle === "map") {
      setPosition({ x: p.x, y: p.y });
    } else {
      setRoutePos({ x: p.x, y: p.y * 0.4 });
      setStatsPos({ x: p.x, y: 0.5 + p.y * 0.4 });
    }
  };

  const startDrag = useCallback(
    (clientX: number, clientY: number, target: LayerId) => {
      setDragging(target);
      setSelectedLayer(target);
      const pos = target === "card" ? position : target === "route" ? routePos : statsPos;
      dragStartRef.current = { posX: pos.x, posY: pos.y, clientX, clientY, target };
    },
    [position, routePos, statsPos]
  );

  const updateDrag = useCallback((clientX: number, clientY: number) => {
    const start = dragStartRef.current;
    if (!start) return;
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    const dx = (clientX - start.clientX) / rect.width;
    const dy = (clientY - start.clientY) / rect.height;
    const pos = {
      x: Math.max(0.05, Math.min(0.95, start.posX + dx)),
      y: Math.max(0.05, Math.min(0.95, start.posY + dy)),
    };
    setPositionState(pos, start.target);
  }, []);

  const endDrag = useCallback(() => {
    setDragging(null);
    dragStartRef.current = null;
  }, []);

  const handlePointerDown = useCallback(
    (e: React.PointerEvent, target: LayerId) => {
      e.preventDefault();
      touchStartRef.current = { x: e.clientX, y: e.clientY, target };
      setSelectedLayer(target);
      startDrag(e.clientX, e.clientY, target);
    },
    [startDrag]
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (dragging) updateDrag(e.clientX, e.clientY);
    },
    [dragging, updateDrag]
  );

  const getScale = (layer: LayerId) =>
    layer === "card" ? cardScale : layer === "route" ? routeScale : statsScale;
  const getRotation = (layer: LayerId) =>
    layer === "card" ? cardRotation : layer === "route" ? routeRotation : statsRotation;

  const handleTouchStart = useCallback(
    (e: React.TouchEvent) => {
      if (e.touches.length === 2 && selectedLayer) {
        e.preventDefault();
        const t0 = e.touches[0]!;
        const t1 = e.touches[1]!;
        const dist = Math.hypot(t1.clientX - t0.clientX, t1.clientY - t0.clientY);
        const angle = Math.atan2(t1.clientY - t0.clientY, t1.clientX - t0.clientX);
        pinchRef.current = {
          layer: selectedLayer,
          dist0: dist,
          angle0: angle,
          scale0: getScale(selectedLayer),
          rot0: getRotation(selectedLayer),
        };
      }
    },
    [selectedLayer, cardScale, routeScale, statsScale, cardRotation, routeRotation, statsRotation]
  );

  const handleTouchMove = useCallback(
    (e: React.TouchEvent) => {
      if (dragging && e.touches[0]) {
        updateDrag(e.touches[0].clientX, e.touches[0].clientY);
      }
    },
    [dragging, updateDrag]
  );

  const handleTouchEnd = useCallback(
    (e: React.TouchEvent) => {
      if (e.touches.length < 2) pinchRef.current = null;
      if (e.touches.length === 0) endDrag();
    },
    [endDrag]
  );

  useEffect(() => {
    if (!dragging) return;
    const onUp = () => endDrag();
    window.addEventListener("mouseup", onUp);
    window.addEventListener("touchend", onUp);
    return () => {
      window.removeEventListener("mouseup", onUp);
      window.removeEventListener("touchend", onUp);
    };
  }, [dragging, endDrag]);

  const touchMoveHandlerRef = useRef<((e: TouchEvent) => void) | null>(null);

  const wrapperRefCallback = useCallback((el: HTMLDivElement | null) => {
    const prev = wrapperRef.current;
    if (prev && touchMoveHandlerRef.current) {
      prev.removeEventListener("touchmove", touchMoveHandlerRef.current);
      touchMoveHandlerRef.current = null;
    }
    wrapperRef.current = el;
    if (el) {
      const handler = (e: TouchEvent) => {
        if (pinchRef.current && e.touches.length === 2) {
          e.preventDefault();
          const t0 = e.touches[0]!;
          const t1 = e.touches[1]!;
          const dist = Math.hypot(t1.clientX - t0.clientX, t1.clientY - t0.clientY);
          const angle = Math.atan2(t1.clientY - t0.clientY, t1.clientX - t0.clientX);
          const { layer, dist0, angle0, scale0, rot0 } = pinchRef.current;
          const scaleDelta = dist / dist0;
          const rotDelta = (angle - angle0) * (180 / Math.PI);
          const newScale = Math.max(SCALE_MIN, Math.min(SCALE_MAX, scale0 * scaleDelta));
          const newRot = rot0 + rotDelta;
          if (layer === "card") {
            setCardScale(newScale);
            setCardRotation(newRot);
          } else if (layer === "route") {
            setRouteScale(newScale);
            setRouteRotation(newRot);
          } else {
            setStatsScale(newScale);
            setStatsRotation(newRot);
          }
        }
      };
      touchMoveHandlerRef.current = handler;
      el.addEventListener("touchmove", handler, { passive: false });
    }
  }, []);

  const clampScale = (s: number) => Math.max(SCALE_MIN, Math.min(SCALE_MAX, s));

  const routeSeed =
    (activity.routeName + activity.distance + activity.duration)
      .split("")
      .reduce((a, c) => a + c.charCodeAt(0), 0);

  return (
    <div
      className="space-y-4"
      onPointerMove={handlePointerMove}
      onPointerUp={endDrag}
      onPointerLeave={endDrag}
    >
      <div className="flex flex-wrap gap-2 items-center">
        <span className="text-sm text-zinc-500">Position:</span>
        {PRESETS.map((p) => (
          <button
            key={p.id}
            type="button"
            onClick={() => applyPreset(p.id)}
            className="rounded-lg bg-zinc-100 px-3 py-2 min-h-[44px] sm:min-h-0 sm:py-1.5 text-xs text-zinc-600 hover:bg-zinc-200 transition-colors border border-zinc-200"
          >
            {p.label}
          </button>
        ))}
      </div>

      <div className="flex flex-col gap-3">
        <p className="text-xs text-zinc-500">Size & rotate — tap the element, then use buttons or pinch on mobile:</p>
        {cardStyle === "map" ? (
          <SizeRotateControls
            label="Card"
            scale={cardScale}
            rotation={cardRotation}
            onScaleChange={(d) => setCardScale((s) => clampScale(s + d))}
            onRotateChange={(d) => setCardRotation((r) => r + d)}
          />
        ) : (
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-6">
            <SizeRotateControls
              label="Route"
              scale={routeScale}
              rotation={routeRotation}
              onScaleChange={(d) => setRouteScale((s) => clampScale(s + d))}
              onRotateChange={(d) => setRouteRotation((r) => r + d)}
            />
            <SizeRotateControls
              label="Stats"
              scale={statsScale}
              rotation={statsRotation}
              onScaleChange={(d) => setStatsScale((s) => clampScale(s + d))}
              onRotateChange={(d) => setStatsRotation((r) => r + d)}
            />
          </div>
        )}
      </div>

      <div
        ref={wrapperRefCallback}
        className="mx-auto w-full max-w-[min(100vw-2rem,400px)] sm:max-w-[400px] rounded-xl border border-zinc-200 bg-zinc-100 p-2 touch-none"
        style={{ aspectRatio: `${STORY_WIDTH} / ${STORY_HEIGHT}` }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onTouchCancel={handleTouchEnd}
      >
        <div className="relative h-full w-full overflow-hidden rounded-lg">
          <div
            className="absolute left-0 top-0 overflow-hidden rounded-lg"
            style={{
              width: STORY_WIDTH,
              height: STORY_HEIGHT,
              transform: `scale(${scale})`,
              transformOrigin: "top left",
            }}
          >
            <div
              ref={setRef}
              className="relative h-full w-full overflow-hidden"
              style={{ width: STORY_WIDTH, height: STORY_HEIGHT }}
            >
              {backgroundImage ? (
                <img
                  src={backgroundImage}
                  alt="Background"
                  width={STORY_WIDTH}
                  height={STORY_HEIGHT}
                  className="absolute inset-0 w-full h-full object-cover object-center pointer-events-none"
                />
              ) : (
                <div className="absolute inset-0 bg-linear-to-b from-zinc-200 to-zinc-300" />
              )}

              {cardStyle === "map" ? (
                <div
                  className="absolute cursor-move select-none"
                  style={{
                    left: `${position.x * 100}%`,
                    top: `${position.y * 100}%`,
                    width: 320,
                    transform: `translate(-50%, -50%) scale(${cardScale}) rotate(${cardRotation}deg)`,
                  }}
                  onPointerDown={(e) => handlePointerDown(e, "card")}
                >
                  <StravaCard activity={activity} isCompact theme={statsTheme} />
                </div>
              ) : (
                <>
                  <div
                    className="absolute cursor-move select-none p-2"
                    style={{
                      left: `${routePos.x * 100}%`,
                      top: `${routePos.y * 100}%`,
                      transform: `translate(-50%, -50%) scale(${routeScale}) rotate(${routeRotation}deg)`,
                    }}
                    onPointerDown={(e) => handlePointerDown(e, "route")}
                  >
                    <RouteMap seed={routeSeed} width={200} height={80} />
                  </div>
                  <div
                    className="absolute cursor-move select-none"
                    style={{
                      left: `${statsPos.x * 100}%`,
                      top: `${statsPos.y * 100}%`,
                      transform: `translate(-50%, -50%) scale(${statsScale}) rotate(${statsRotation}deg)`,
                    }}
                    onPointerDown={(e) => handlePointerDown(e, "stats")}
                  >
                    <StravaCardCompact activity={activity} layout={statsLayout} theme={statsTheme} />
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
