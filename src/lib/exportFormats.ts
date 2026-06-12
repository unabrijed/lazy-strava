/**
 * Export format presets. Frames are laid out in CSS pixels at roughly preview
 * scale and rasterized up to the target output width by html2canvas's `scale`
 * — keeping export proportions identical to the on-screen preview and the
 * final canvas safely under iOS Safari's ~4096px limit.
 */

export type ExportFormatId = "sticker" | "story" | "square";

export interface ExportFormat {
  id: ExportFormatId;
  label: string;
  /** Tighter label for the mobile bottom bar. */
  shortLabel: string;
  /** Frame size in CSS px; null height = content-sized (sticker). */
  frameWidth: number;
  frameHeight: number | null;
  /** Painted in-DOM background + fixed frame (story/square) vs content-only. */
  framed: boolean;
  /** Keep content clear of platform UI chrome (story: IG top/bottom bars). */
  safeTop: number;
  safeBottom: number;
}

export const EXPORT_FORMATS: Record<ExportFormatId, ExportFormat> = {
  sticker: {
    id: "sticker",
    label: "Sticker",
    shortLabel: "Sticker",
    frameWidth: 380,
    frameHeight: null,
    framed: false,
    safeTop: 0,
    safeBottom: 0,
  },
  story: {
    id: "story",
    label: "Story 9:16",
    shortLabel: "9:16",
    frameWidth: 360,
    frameHeight: 640,
    framed: true,
    safeTop: 84,
    safeBottom: 84,
  },
  square: {
    id: "square",
    label: "Square 1:1",
    shortLabel: "1:1",
    frameWidth: 360,
    frameHeight: 360,
    framed: true,
    safeTop: 24,
    safeBottom: 24,
  },
};

export const EXPORT_FORMAT_LIST: ExportFormat[] = [
  EXPORT_FORMATS.sticker,
  EXPORT_FORMATS.story,
  EXPORT_FORMATS.square,
];

/** Target output width in device px (1080 = IG-native). */
export const EXPORT_TARGET_WIDTH = 1080;

/** Max canvas edge that's reliable on iOS Safari. */
export const MAX_CANVAS_EDGE = 4096;
