export type FSNodeFile = { type: "file"; content: string };
export type FSNodeDir  = { type: "dir"; children: Record<string, FSNode> };

export type FSNode     = FSNodeFile | FSNodeDir; // union type

export interface VirtualFS {
  cwd: string;
  tree: { "/": FSNodeDir };
}