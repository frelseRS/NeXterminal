import type { CommandDef } from "./structs";
import { COMMANDS } from "./commands";

const fmtArgs = (cmd: CommandDef): string => (cmd.args || [])
  .map(a => a.variadic ? a.name + "..." : a.optional ? "[" + a.name + "]" : "<" + a.name + ">")
  .join(" ");

export function formatHelp(cmd: CommandDef): string {
  const opts = (cmd.options || []).map(o => "  " + o.flag.padEnd(6) + " " + o.desc).join("\n");
  const args = fmtArgs(cmd);
  return (
    cmd.name + " — " + cmd.description +
    "\n" + "Usage: " + (cmd.usage || (cmd.name + (args ? " " + args : ""))) +
    (opts ? "\n\nOptions:\n" + opts : "")
  ).trim();
}

export function formatMan(cmd: CommandDef): string {
  const opts = (cmd.options || []).map(o => "  " + o.flag.padEnd(6) + " " + o.desc).join("\n");
  const args = fmtArgs(cmd);
  const parts: string[] = [];
  parts.push("NAME\n    " + cmd.name + " — " + cmd.description);
  parts.push("SYNOPSIS\n    " + (cmd.usage || (cmd.name + (args ? " " + args : ""))));
  if (opts) parts.push("OPTIONS\n" + opts);
  parts.push("DESCRIPTION\n    Demo manual entry. Extend as needed.");
  return parts.join("\n\n");
}

export const REGISTRY = {
  list: COMMANDS,
  all(): CommandDef[] { return this.list; },
  byName(n: string): CommandDef | undefined { return this.list.find(c => c.name === n); },
  names(): string[] { return this.list.map(c => c.name); }
};