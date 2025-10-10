import type { FSNode } from "./types";
import type { VirtualFS } from "./types";

export default function makeFS(): VirtualFS {
  return {
    cwd: "/home/dev",
    tree: {
      "/": {
        type: "dir",
        children: {
          home: {
            type: "dir",
            children: {
              dev: {
                type: "dir",
                children: {
                  "readme.txt": { type: "file", content: "Welcome to the Web Terminal. Type 'help' to start." },
                  "notes.md": { type: "file", content: "# Notes\n- Tailwind UI\n- Autocomplete\n- Improve FS later" },
                  projects: { type: "dir", children: { "web-terminal": { type: "dir", children: {} } } }
                }
              }
            }
          }
        }
      }
    }
  };
}

export function resolvePath(fs: VirtualFS, inputPath?: string): string {
  let path = inputPath || ".";
  if (!path.startsWith("/")) path = fs.cwd + (fs.cwd.endsWith("/") ? "" : "/") + path;
  const parts = path.split("/").filter(Boolean);
  const stack: string[] = [""];
  for (const p of parts) {
    if (p === ".") continue;
    if (p === "..") { if (stack.length > 1) stack.pop(); continue; }
    stack.push(p);
  }
  return "/" + stack.filter(Boolean).join("/");
}

export function getNode(fs: VirtualFS, path?: string): { node: FSNode; full: string } | null {
  const full = resolvePath(fs, path);
  const parts = full.split("/").filter(Boolean);
  let node: FSNode | null = fs.tree["/"];
  for (const p of parts) {
    if (!node || node.type !== "dir" || !node.children[p]) return null;
    node = node.children[p];
  }
  return { node, full };
}