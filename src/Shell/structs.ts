import type { VirtualFS } from "../FileSystem/types";

export type CommandHandler = (ctx: {
  fs: VirtualFS;
  argv: string[];
  clearScreen: () => void;
}) => string | void | Promise<string | void>;

export interface CommandArg { name: string; optional?: boolean; variadic?: boolean }
export interface CommandOption { flag: string; desc: string }

export interface CommandDef {
    name: string;
    description: string;
    usage?: string;
    options?: CommandOption[];
    args?: CommandArg[];
    handler: CommandHandler;
}

export interface HistoryItem {
  cmd: string;
  out: string;
  ts: number;           // Date.now() in ms
  exit: 0 | 1 | 130;    // 130 se registri SIGINT
  durationMs: number;   // float (es. 2.37)
  paintMs?: number;     // opzionale, tempo fino al paint del blocco
}