
export type Suggestion = { kind: "command" | "flag" | "file" | "dir"; label: string; hint?: string };