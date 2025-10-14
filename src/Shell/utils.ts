export const clamp = (n: number, min: number, max: number) => Math.max(min, Math.min(max, n));
export const isMac = typeof navigator !== "undefined" && /Mac|iPhone|iPad/.test((navigator.platform || ""));
export const nowStr = (): string => new Date().toLocaleString();

export function tokenize(input: string): string[] {
  const tokens: string[] = [];
  let i = 0;
  while (i < input.length) {
    while (i < input.length && /\s/.test(input[i])) i++;
    if (i >= input.length) break;
    let buf = "";
    if (input[i] === '"' || input[i] === "'") {
      const quote = input[i++] as '"' | "'";
      while (i < input.length) {
        if (input[i] === "\\" && i + 1 < input.length) { buf += input[i + 1]; i += 2; continue; }
        if (input[i] === quote) { i++; break; }
        buf += input[i++];
      }
      tokens.push(buf);
      continue;
    }
    while (i < input.length && !/\s/.test(input[i])) {
      if (input[i] === "\\" && i + 1 < input.length) { buf += input[i + 1]; i += 2; continue; }
      buf += input[i++];
    }
    tokens.push(buf);
  }
  return tokens;
}

export function fmtDuration(ms: number): string {
  if (ms < 1000) return `${ms} ms`;
  if (ms < 60_000) return `${(ms / 1000).toFixed(1)} s`;
  const m = Math.floor(ms / 60_000);
  const s = Math.round((ms % 60_000) / 1000);
  return `${m}m ${s}s`;
}

export function fmtMs(ms: number, digits: number = 2): string {
  // mostra “0.00 ms” invece di 0 se è minuscolo
  return `${ms.toFixed(digits)} ms`;
}