export interface HistoryItem {
  cmd: string;
  out: string;
  ts: number;           // epoch ms (Date.now())
  exit: 0 | 1;          // exit code del comando
  durationMs: number;   // durata del comando in millisecondi
}