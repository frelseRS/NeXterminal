export interface HistoryItem {
  cmd: string;
  out: string;
  ts: number;           // Date.now() in ms
  exit: 0 | 1 | 130;    // 130 se registri SIGINT
  durationMs: number;   // float (es. 2.37)
  paintMs?: number;     // opzionale, tempo fino al paint del blocco
}