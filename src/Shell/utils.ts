export const clamp = (n: number, min: number, max: number) => Math.max(min, Math.min(max, n));
export const isMac = typeof navigator !== "undefined" && /Mac|iPhone|iPad/.test((navigator.platform || ""));
export const nowStr = (): string => new Date().toLocaleString();

export function fmtMs(ms: number, digits: number = 2): string {
  return `${ms.toFixed(digits)} ms`;
}