import type { Suggestion } from "../ReactComponents/ContextSuggest";
import type { VirtualFS } from "../FileSystem/types";
import type { HistoryItem } from "./structs";
import { getNode } from "../FileSystem/Controller";
import { REGISTRY } from "./helper";

export function buildSuggestions(input: string, fs: VirtualFS): Suggestion[] {
  const tokens = tokenize(input);
  if (tokens.length === 0 || (tokens.length === 1 && !input.endsWith(" "))) {
    const prefix = (tokens[0] || "").toLowerCase();
    return REGISTRY.all()
      .filter(c => c.name.startsWith(prefix))
      .map<Suggestion>(c => ({ kind: "command", label: c.name, hint: c.description }))
      .slice(0, 8);
  }
  const cmd = REGISTRY.byName(tokens[0]);
  if (!cmd) return [];
  const last = tokens[tokens.length - 1];
  const enteringNewToken = input.endsWith(" ");

  const options = (cmd.options || []).map(o => o.flag);
  const flagCandidates: Suggestion[] = options
    .filter(f => enteringNewToken || f.startsWith(last))
    .map(f => ({ kind: "flag", label: f, hint: "option" }));

  const wantPath = !last?.startsWith("-");
  const pathItems: Suggestion[] = [];
  if (wantPath) {
    const base = enteringNewToken ? "." : last || ".";
    const until = base.endsWith("/") ? base : base.split("/").slice(0, -1).join("/");
    const dirRes = getNode(fs, base.endsWith("/") ? base : until || ".");
    if (dirRes && (dirRes.node as any).type === "dir") {
      const names = Object.keys((dirRes.node as any).children as Record<string, any>);
      const prefix = base.endsWith("/") ? "" : (base.split("/").pop() || "");
      for (const n of names) {
        if (!prefix || n.startsWith(prefix)) {
          const child = (dirRes.node as any).children[n];
          const label = base.endsWith("/") ? (base + n + (child.type === "dir" ? "/" : "")) : ((until ? until + "/" : "") + n + (child.type === "dir" ? "/" : ""));
          pathItems.push({ kind: child.type, label, hint: child.type });
        }
      }
    }
  }
  const uniq: Suggestion[] = [];
  const seen = new Set<string>();
  for (const it of [...flagCandidates, ...pathItems]) {
    const key = it.kind + "|" + it.label; if (!seen.has(key)) { seen.add(key); uniq.push(it); }
  }
  return uniq.slice(0, 10);
}

export function inlineHelp(input: string): string {
  const t = tokenize(input);
  if (t.length === 0) return "Type a command. Try 'help' or 'ls -l'.";
  const cmd = REGISTRY.byName(t[0]);
  if (!cmd) return "Unknown command. Type 'help'.";
  return (cmd.usage || cmd.name);
}

export async function runCommand(line: string, fs: VirtualFS, clearScreen: () => void, setHistory: React.Dispatch<React.SetStateAction<HistoryItem[]>>, setLastExit: React.Dispatch<React.SetStateAction<HistoryItem["exit"]>>, pendingIndexRef: React.MutableRefObject<number | null>, focusInputSoon: () => void): Promise<void> {
  const argv = tokenize(line);
  if (argv.length === 0) return;

  const start = performance.now(); // inizio misurazione
  const name = argv[0];
  const cmd = REGISTRY.byName(name);

  let out = "";
  let exit: 0 | 1 = 0;

  if (!cmd) {
    out = `${name}: command not found`;
    exit = 1;
  } else {
    try {
      // Supporta sia handler sync che async senza cambiare signature di CommandHandler
      const maybe = cmd.handler({ fs, argv, clearScreen }) as unknown;
      out = (await Promise.resolve(maybe)) as string | undefined || "";
    } catch (e: any) {
      out = "Error: " + (e?.message || String(e));
      exit = 1;
    }
  }

  const durationMs = performance.now() - start;

  // push nello storico + marca l’indice per il paint measurement
  setHistory(h => {
    const next = [
      ...h,
      { cmd: line, out, ts: Date.now(), exit, durationMs }
    ];
    pendingIndexRef.current = next.length - 1;
    return next;
  });

  setLastExit(exit);

  // Misura (approssimata) del tempo fino al primo paint visibile del blocco
  const t0 = performance.now();
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      const paintMs = performance.now() - t0;
      const idx = pendingIndexRef.current;
      if (idx != null) {
        setHistory(h => h.map((it, i) => i === idx ? { ...it, paintMs } : it));
        pendingIndexRef.current = null;
      }
    });
  });
  focusInputSoon();
}

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

export function applySuggestionToInput(input: string, suggestionLabel: string): string {
  const t = tokenize(input);
  if (t.length === 0 || (t.length === 1 && !input.endsWith(" "))) {
    return suggestionLabel + " ";
  }
  if (input.endsWith(" ")) return input + suggestionLabel;
  const idx = input.lastIndexOf(" ");
  return input.slice(0, idx + 1) + suggestionLabel;
}