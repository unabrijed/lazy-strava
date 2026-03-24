"use client";

import { useRef, useState, useCallback, useEffect } from "react";
import type { StravaActivity } from "@/lib/constants";
import { StravaCard } from "./StravaCard";
import { StravaCardCompact } from "./StravaCardCompact";
import { RouteMap } from "./RouteMap";

const STORY_WIDTH = 1080;
const STORY_HEIGHT = 1920;

const SCALE_MIN = 0.4;
const clampScale = (s: number) => Math.max(SCALE_MIN, s);

type LayerId = "card" | "route" | "stats";

interface ImageComposerProps {
  activity: StravaActivity;
  backgroundMedia?: { url: string; width: number; height: number } | null;
  cardStyle: "map" | "compact";
  statsLayout: "horizontal" | "vertical";
  statsTheme: "light" | "dark";
  exportRef?: React.RefObject<HTMLDivElement | null>;
  gradientRef?: React.RefObject<HTMLDivElement | null>;
}

const LAYER_DIMS: Record<LayerId, { w: number | string; h: number | string }> = {
  card: { w: 320, h: 220 },
  route: { w: "max-content", h: "max-content" },
  stats: { w: "max-content", h: "max-content" },
};

function TransformableLayer({
  pos,
  scale,
  rotation,
  dims,
  layerId,
  selected,
  onPointerDown,
  onResizeDown,
  onRotateDown,
  onPointerMove,
  onPointerUp,
  className = "",
  children,
}: {
  pos: { x: number; y: number };
  scale: number;
  rotation: number;
  dims: { w: number | string; h: number | string };
  layerId: LayerId;
  selected: boolean;
  onPointerDown: (e: React.PointerEvent) => void;
  onResizeDown: (e: React.PointerEvent) => void;
  onRotateDown: (e: React.PointerEvent) => void;
  onPointerMove: (e: React.PointerEvent) => void;
  onPointerUp: (e: React.PointerEvent) => void;
  className?: string;
  children: React.ReactNode;
}) {
  const { w, h } = dims;
  return (
    <div
      className={`absolute select-none z-10 ${className}`}
      data-layer={layerId}
      style={{
        left: `${pos.x * 100}%`,
        top: `${pos.y * 100}%`,
        width: w,
        minHeight: h,
        transform: `translate(-50%, -50%) scale(${scale}) rotate(${rotation}deg)`,
        transformOrigin: "center center",
      }}
    >
      <div
        className={`cursor-move touch-none ${selected ? "ring-2 ring-[#FC4C02] ring-offset-2 rounded-2xl" : ""}`}
        onPointerDown={onPointerDown}
      >
        {children}
      </div>
      {selected && (
        <>
          <div
            data-html2canvas-ignore="true"
            className="absolute right-0 bottom-0 w-8 h-8 -mr-2 -mb-2 rounded-full bg-white border-2 border-[#FC4C02] cursor-nwse-resize touch-none flex items-center justify-center"
            style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.2)", transform: `scale(${1 / Math.max(0.1, scale)})` }}
            onPointerDown={onResizeDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerCancel={onPointerUp}
            aria-label="Drag to resize"
          >
            <svg className="w-4 h-4 text-[#FC4C02]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
            </svg>
          </div>
          <div
            data-html2canvas-ignore="true"
            className="absolute left-1/2 -top-10 w-8 h-8 -translate-x-1/2 rounded-full bg-white border-2 border-[#FC4C02] cursor-grab touch-none flex items-center justify-center active:cursor-grabbing"
            style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.2)", transform: `scale(${1 / Math.max(0.1, scale)})` }}
            onPointerDown={onRotateDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerCancel={onPointerUp}
            aria-label="Drag to rotate"
          >
            <svg className="w-4 h-4 text-[#FC4C02]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </div>
        </>
      )}
    </div>
  );
}

export function ImageComposer({
  activity,
  backgroundMedia,
  cardStyle,
  statsLayout,
  statsTheme,
  exportRef,
  gradientRef,
}: ImageComposerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.3);

  const canvasWidth = backgroundMedia ? backgroundMedia.width : STORY_WIDTH;
  const canvasHeight = backgroundMedia ? backgroundMedia.height : STORY_HEIGHT;

  const setRef = useCallback(
    (el: HTMLDivElement | null) => {
      const cRef = containerRef as React.MutableRefObject<HTMLDivElement | null>;
      cRef.current = el;
      const eRef = exportRef as React.MutableRefObject<HTMLDivElement | null> | undefined;
      if (eRef) {
        eRef.current = el;
      }
    },
    [exportRef]
  );

  useEffect(() => {
    const wrapper = wrapperRef.current;
    if (!wrapper) return;
    const updateScale = () => {
      const padding = 8;
      const w = Math.max(0, wrapper.clientWidth - padding);
      const h = Math.max(0, wrapper.clientHeight - padding);
      const s = w > 0 && h > 0 ? Math.min(w / canvasWidth, h / canvasHeight) : 0.3;
      setScale(Math.max(0.1, Math.min(1, s)));
    };
    updateScale();
    const ro = new ResizeObserver(updateScale);
    ro.observe(wrapper);
    return () => ro.disconnect();
  }, [canvasWidth, canvasHeight]);

  const [position, setPosition] = useState({ x: 0.5, y: 0.92 });
  const [routePos, setRoutePos] = useState({ x: 0.5, y: 0.3 });
  const [statsPos, setStatsPos] = useState({ x: 0.5, y: 0.7 });

  const [cardScale, setCardScale] = useState(1.2);
  const [cardRotation, setCardRotation] = useState(0);
  const [routeScale, setRouteScale] = useState(3.0);
  const [routeRotation, setRouteRotation] = useState(0);
  const [statsScale, setStatsScale] = useState(3.6);
  const [statsRotation, setStatsRotation] = useState(0);

  // Ref-mirrors so native touch handlers always read current state (no stale closures)
  const cardScaleRef = useRef(1.2);
  const routeScaleRef = useRef(3.0);
  const statsScaleRef = useRef(3.6);
  const cardRotRef = useRef(0);
  const routeRotRef = useRef(0);
  const statsRotRef = useRef(0);
  // Keep refs in sync with state
  cardScaleRef.current = cardScale;
  routeScaleRef.current = routeScale;
  statsScaleRef.current = statsScale;
  cardRotRef.current = cardRotation;
  routeRotRef.current = routeRotation;
  statsRotRef.current = statsRotation;

  const [dragging, setDragging] = useState<LayerId | null>(null);
  const [resizing, setResizing] = useState<LayerId | null>(null);
  const [rotating, setRotating] = useState<LayerId | null>(null);
  const [selectedLayer, setSelectedLayer] = useState<LayerId | null>(null);
  const selectedLayerRef = useRef<LayerId | null>(null);
  const setSelectedLayerAndRef = useCallback((layer: LayerId | null) => {
    selectedLayerRef.current = layer;
    setSelectedLayer(layer);
  }, []);
  const dragStartRef = useRef<{
    posX: number;
    posY: number;
    clientX: number;
    clientY: number;
    target: LayerId;
  } | null>(null);
  const resizeStartRef = useRef<{
    scale0: number;
    dist0: number;
    cx: number;
    cy: number;
    target: LayerId;
  } | null>(null);
  const rotateStartRef = useRef<{
    rot0: number;
    angle0: number;
    cx: number;
    cy: number;
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

  const startDrag = useCallback(
    (clientX: number, clientY: number, target: LayerId) => {
      setDragging(target);
      setSelectedLayerAndRef(target);
      const pos = target === "card" ? position : target === "route" ? routePos : statsPos;
      dragStartRef.current = { posX: pos.x, posY: pos.y, clientX, clientY, target };
    },
    [position, routePos, statsPos, setSelectedLayerAndRef]
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
    setResizing(null);
    setRotating(null);
    dragStartRef.current = null;
    resizeStartRef.current = null;
    rotateStartRef.current = null;
  }, []);

  const startResize = useCallback(
    (e: React.PointerEvent, target: LayerId) => {
      e.preventDefault();
      e.stopPropagation();
      (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
      const rect = containerRef.current?.getBoundingClientRect();
      if (!rect) return;
      const pos = target === "card" ? position : target === "route" ? routePos : statsPos;
      const cx = rect.left + pos.x * rect.width;
      const cy = rect.top + pos.y * rect.height;
      const dist = Math.hypot(e.clientX - cx, e.clientY - cy);
      const scale0 = target === "card" ? cardScale : target === "route" ? routeScale : statsScale;
      setResizing(target);
      setSelectedLayerAndRef(target);
      resizeStartRef.current = { scale0, dist0: Math.max(dist, 20), cx, cy, target };
    },
    [position, routePos, statsPos, cardScale, routeScale, statsScale, setSelectedLayerAndRef]
  );

  const startRotate = useCallback(
    (e: React.PointerEvent, target: LayerId) => {
      e.preventDefault();
      e.stopPropagation();
      (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
      const rect = containerRef.current?.getBoundingClientRect();
      if (!rect) return;
      const pos = target === "card" ? position : target === "route" ? routePos : statsPos;
      const cx = rect.left + pos.x * rect.width;
      const cy = rect.top + pos.y * rect.height;
      const angle0 = Math.atan2(e.clientY - cy, e.clientX - cx);
      const rot0 = target === "card" ? cardRotation : target === "route" ? routeRotation : statsRotation;
      setRotating(target);
      setSelectedLayerAndRef(target);
      rotateStartRef.current = { rot0, angle0, cx, cy, target };
    },
    [position, routePos, statsPos, cardRotation, routeRotation, statsRotation, setSelectedLayerAndRef]
  );

  const handlePointerDown = useCallback(
    (e: React.PointerEvent, target: LayerId) => {
      e.preventDefault();
      (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
      touchStartRef.current = { x: e.clientX, y: e.clientY, target };
      setSelectedLayerAndRef(target);
      startDrag(e.clientX, e.clientY, target);
    },
    [startDrag, setSelectedLayerAndRef]
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (dragging) {
        updateDrag(e.clientX, e.clientY);
      } else if (resizeStartRef.current) {
        const { scale0, dist0, cx, cy, target } = resizeStartRef.current;
        const dist = Math.hypot(e.clientX - cx, e.clientY - cy);
        const ratio = dist / dist0;
        const newScale = clampScale(scale0 * ratio);
        if (target === "card") setCardScale(newScale);
        else if (target === "route") setRouteScale(newScale);
        else setStatsScale(newScale);
      } else if (rotateStartRef.current) {
        const { rot0, angle0, cx, cy, target } = rotateStartRef.current;
        const angle = Math.atan2(e.clientY - cy, e.clientX - cx);
        const delta = (angle - angle0) * (180 / Math.PI);
        const newRot = rot0 + delta;
        if (target === "card") setCardRotation(newRot);
        else if (target === "route") setRouteRotation(newRot);
        else setStatsRotation(newRot);
      }
    },
    [dragging, updateDrag]
  );


  // No React touch handlers — all touch logic handled natively in wrapperRefCallback

  useEffect(() => {
    if (!dragging && !resizing && !rotating) return;
    const onUp = () => endDrag();
    window.addEventListener("mouseup", onUp);
    window.addEventListener("touchend", onUp);
    return () => {
      window.removeEventListener("mouseup", onUp);
      window.removeEventListener("touchend", onUp);
    };
  }, [dragging, resizing, rotating, endDrag]);

  const nativeTouchHandlersRef = useRef<{
    start: (e: TouchEvent) => void;
    move: (e: TouchEvent) => void;
    end: (e: TouchEvent) => void;
  } | null>(null);

  const wrapperRefCallback = useCallback((el: HTMLDivElement | null) => {
    const prev = wrapperRef.current;
    if (prev && nativeTouchHandlersRef.current) {
      prev.removeEventListener("touchstart", nativeTouchHandlersRef.current.start);
      prev.removeEventListener("touchmove", nativeTouchHandlersRef.current.move);
      prev.removeEventListener("touchend", nativeTouchHandlersRef.current.end);
      prev.removeEventListener("touchcancel", nativeTouchHandlersRef.current.end);
      nativeTouchHandlersRef.current = null;
    }
    wrapperRef.current = el;
    if (el) {
      const onStart = (e: TouchEvent) => {
        if (e.touches.length === 2) {
          // Two-finger pinch: determine which layer to manipulate
          const t0 = e.touches[0]!;
          const t1 = e.touches[1]!;
          // Try hit-testing at each finger position, then midpoint
          const candidates = [
            document.elementFromPoint(t0.clientX, t0.clientY),
            document.elementFromPoint(t1.clientX, t1.clientY),
            document.elementFromPoint(
              (t0.clientX + t1.clientX) / 2,
              (t0.clientY + t1.clientY) / 2
            ),
          ];
          let layer: LayerId | null = null;
          for (const el of candidates) {
            const found = el?.closest("[data-layer]")?.getAttribute("data-layer") as LayerId | null;
            if (found && (found === "card" || found === "route" || found === "stats")) {
              layer = found;
              break;
            }
          }
          // Fall back to the currently selected layer
          if (!layer) layer = selectedLayerRef.current;
          if (layer) {
            e.preventDefault();
            // Cancel any ongoing drag
            dragStartRef.current = null;
            setDragging(null);
            const dist = Math.hypot(t1.clientX - t0.clientX, t1.clientY - t0.clientY);
            const angle = Math.atan2(t1.clientY - t0.clientY, t1.clientX - t0.clientX);
            const scale0 = layer === "card" ? cardScaleRef.current : layer === "route" ? routeScaleRef.current : statsScaleRef.current;
            const rot0 = layer === "card" ? cardRotRef.current : layer === "route" ? routeRotRef.current : statsRotRef.current;
            pinchRef.current = { layer, dist0: Math.max(dist, 10), angle0: angle, scale0, rot0 };
          }
        } else if (e.touches.length === 1) {
          // Single finger — handled by pointer events on layers; just clear pinch
          pinchRef.current = null;
        }
      };

      const onMove = (e: TouchEvent) => {
        if (pinchRef.current && e.touches.length === 2) {
          e.preventDefault();
          const t0 = e.touches[0]!;
          const t1 = e.touches[1]!;
          const dist = Math.hypot(t1.clientX - t0.clientX, t1.clientY - t0.clientY);
          const angle = Math.atan2(t1.clientY - t0.clientY, t1.clientX - t0.clientX);
          const { layer, dist0, angle0, scale0, rot0 } = pinchRef.current;
          const scaleDelta = dist / dist0;
          const rotDelta = (angle - angle0) * (180 / Math.PI);
          const newScale = Math.max(SCALE_MIN, scale0 * scaleDelta);
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
        } else if (e.touches.length === 1 && dragStartRef.current && e.touches[0]) {
          updateDrag(e.touches[0].clientX, e.touches[0].clientY);
        }
      };

      const onEnd = (e: TouchEvent) => {
        if (e.touches.length < 2) pinchRef.current = null;
        if (e.touches.length === 0) endDrag();
      };

      nativeTouchHandlersRef.current = { start: onStart, move: onMove, end: onEnd };
      el.addEventListener("touchstart", onStart, { passive: false });
      el.addEventListener("touchmove", onMove, { passive: false });
      el.addEventListener("touchend", onEnd);
      el.addEventListener("touchcancel", onEnd);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

      <p className="text-xs text-zinc-500">
        Pinch directly on any element to resize and rotate. Or tap to select, then drag the handles.
      </p>

      <div
        ref={wrapperRefCallback}
        className="mx-auto w-full max-w-full sm:max-w-[420px] rounded-xl border border-zinc-200 bg-zinc-100 p-1.5"
        style={{ aspectRatio: `${canvasWidth} / ${canvasHeight}` }}
      >
        <div className="relative h-full w-full overflow-hidden rounded-lg">
          <div
            className="absolute left-0 top-0 overflow-hidden rounded-lg"
            style={{
              width: canvasWidth,
              height: canvasHeight,
              transform: `scale(${scale})`,
              transformOrigin: "top left",
            }}
          >
            <div
              ref={setRef}
              className="relative h-full w-full overflow-hidden"
              style={{ width: canvasWidth, height: canvasHeight }}
              data-export-state={JSON.stringify({
                canvasWidth,
                canvasHeight,
                cardStyle,
                layers: cardStyle === "map"
                  ? [{ id: "card", pos: position, scale: cardScale, rotation: cardRotation }]
                  : [
                      { id: "route", pos: routePos, scale: routeScale, rotation: routeRotation },
                      { id: "stats", pos: statsPos, scale: statsScale, rotation: statsRotation },
                    ],
              })}
            >
              {backgroundMedia ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src={backgroundMedia.url}
                  alt="Background"
                  width={canvasWidth}
                  height={canvasHeight}
                  className="absolute inset-0 w-full h-full object-cover object-center pointer-events-none"
                />
              ) : (
                <div
                  ref={gradientRef}
                  className="absolute inset-0 bg-linear-to-b from-zinc-200 to-zinc-300 cursor-default"
                  onClick={() => setSelectedLayer(null)}
                />
              )}
              {backgroundMedia && (
                <div
                  className="absolute inset-0 z-1 cursor-default"
                  onClick={() => setSelectedLayer(null)}
                  aria-hidden
                />
              )}

              {cardStyle === "map" ? (
                <TransformableLayer
                  layerId="card"
                  pos={position}
                  scale={cardScale}
                  rotation={cardRotation}
                  dims={LAYER_DIMS.card}
                  selected={selectedLayer === "card"}
                  onPointerDown={(e) => handlePointerDown(e, "card")}
                  onResizeDown={(e) => startResize(e, "card")}
                  onRotateDown={(e) => startRotate(e, "card")}
                  onPointerMove={handlePointerMove}
                  onPointerUp={endDrag}
                >
                  <div data-layer-content="card">
                    <StravaCard activity={activity} theme={statsTheme} />
                  </div>
                </TransformableLayer>
              ) : (
                <>
                  <TransformableLayer
                    layerId="route"
                    pos={routePos}
                    scale={routeScale}
                    rotation={routeRotation}
                    dims={LAYER_DIMS.route}
                    selected={selectedLayer === "route"}
                    onPointerDown={(e) => handlePointerDown(e, "route")}
                    onResizeDown={(e) => startResize(e, "route")}
                    onRotateDown={(e) => startRotate(e, "route")}
                    onPointerMove={handlePointerMove}
                    onPointerUp={endDrag}
                    className="p-2"
                  >
                    <div data-layer-content="route">
                      <RouteMap seed={routeSeed} width={200} height={80} />
                    </div>
                  </TransformableLayer>
                  <TransformableLayer
                    layerId="stats"
                    pos={statsPos}
                    scale={statsScale}
                    rotation={statsRotation}
                    dims={LAYER_DIMS.stats}
                    selected={selectedLayer === "stats"}
                    onPointerDown={(e) => handlePointerDown(e, "stats")}
                    onResizeDown={(e) => startResize(e, "stats")}
                    onRotateDown={(e) => startRotate(e, "stats")}
                    onPointerMove={handlePointerMove}
                    onPointerUp={endDrag}
                  >
                    <div data-layer-content="stats">
                      <StravaCardCompact activity={activity} layout={statsLayout} theme={statsTheme} />
                    </div>
                  </TransformableLayer>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
