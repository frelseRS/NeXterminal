import type {CommandDef} from "./types";
import { formatHelp, formatMan } from "./helper";
import { nowStr } from "../utils";
import { getNode } from "../FileSystem/Controller";

export const COMMANDS: CommandDef[] = [
  {
    name: "help",
    description: "Show help for commands",
    usage: "help [command]",
    options: [],
    args: [{ name: "command", optional: true }],
    handler: ({ argv }) => {
      if (argv[1]) {
        const cmd = REGISTRY.byName(argv[1]);
        return cmd ? formatHelp(cmd) : "No such command: " + argv[1];
      }
      const lines = REGISTRY.all().map(c => "  " + c.name.padEnd(12) + " " + c.description).join("\n");
      return "Available commands:\n" + lines + "\n\nType 'help <command>' for details.";
    }
  },
  {
    name: "clear",
    description: "Clear the screen",
    usage: "clear",
    handler: ({ clearScreen }) => { clearScreen(); return ""; }
  },
  {
    name: "echo",
    description: "Print arguments",
    usage: "echo [args...]",
    options: [{ flag: "-n", desc: "no trailing newline" }],
    args: [{ name: "text", variadic: true, optional: true }],
    handler: ({ argv }) => {
      const noNl = argv.includes("-n");
      const out = argv.filter(a => a !== "echo" && a !== "-n").join(" ");
      return noNl ? out : out + "\n";
    }
  },
  { name: "date", description: "Print current date & time", usage: "date", handler: () => nowStr() },
  { name: "pwd", description: "Print working directory", usage: "pwd", handler: ({ fs }) => fs.cwd },
  {
    name: "ls",
    description: "List directory contents",
    usage: "ls [path]",
    options: [{ flag: "-l", desc: "long format" }],
    args: [{ name: "path", optional: true }],
    handler: ({ fs, argv }) => {
      const long = argv.includes("-l");
      const p = argv.find(a => a !== "ls" && a !== "-l");
      const res = getNode(fs, p || fs.cwd);
      if (!res) return "ls: cannot access '" + (p || "") + "': No such file or directory";
      const node = res.node;
      const full = res.full;
      if ((node as any).type === "file") return p || full;
      const children = (node as any).children as Record<string, any>;
      const names = Object.keys(children);
      if (!long) return names.join("  ");
      return names.map(n => {
        const ch = children[n];
        const type = ch.type === "dir" ? "d" : "-";
        const size = ch.type === "file" ? (ch.content as string).length : 0;
        return type + "rwxr-xr-x  dev  dev  " + size.toString().padStart(5) + "  " + n;
      }).join("\n");
    }
  },
  {
    name: "cd",
    description: "Change directory",
    usage: "cd [path]",
    args: [{ name: "path", optional: true }],
    handler: ({ fs, argv }) => {
      const p = argv[1] || "/home/dev";
      const res = getNode(fs, p);
      if (!res || (res.node as any).type !== "dir") return "cd: no such directory: " + p;
      fs.cwd = res.full; return "";
    }
  },
  {
    name: "cat",
    description: "Concatenate and print files",
    usage: "cat <file>",
    args: [{ name: "file" }],
    handler: ({ fs, argv }) => {
      const file = argv[1];
      const res = getNode(fs, file);
      if (!res || (res.node as any).type !== "file") return "cat: " + file + ": No such file";
      return (res.node as any).content as string;
    }
  },
  {
    name: "grep",
    description: "Search for PATTERN in files (demo)",
    usage: "grep <pattern> <file>",
    options: [{ flag: "-i", desc: "ignore case" }],
    args: [{ name: "pattern" }, { name: "file" }],
    handler: ({ fs, argv }) => {
      const ignore = argv.includes("-i");
      const args = argv.filter(a => !a.startsWith("-"));
      const pattern = args[1];
      const file = args[2];
      const res = getNode(fs, file);
      if (!res || (res.node as any).type !== "file") return "grep: " + file + ": No such file";
      const rx = new RegExp(pattern, ignore ? "i" : undefined);
      return ((res.node as any).content as string).split("\n").filter(l => rx.test(l)).join("\n");
    }
  },
  {
    name: "man",
    description: "Show detailed help (demo)",
    usage: "man <command>",
    args: [{ name: "command" }],
    handler: ({ argv }) => {
      // REGISTRY used below is defined after export
      const cmd = REGISTRY.byName(argv[1]);
      return cmd ? formatMan(cmd) : "No manual entry for " + argv[1];
    }
  },
];

export const REGISTRY = {
  list: COMMANDS,
  all(): CommandDef[] { return this.list; },
  byName(n: string): CommandDef | undefined { return this.list.find(c => c.name === n); },
  names(): string[] { return this.list.map(c => c.name); }
};