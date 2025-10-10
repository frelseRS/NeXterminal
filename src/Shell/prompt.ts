import { tokenize } from "../utils";
import type { Suggestion } from "../types/Suggestion"; 
import type { VirtualFS } from "../FileSystem/types";
import { getNode } from "../FileSystem/Controller";
import { REGISTRY } from "./commands";

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