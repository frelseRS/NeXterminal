import type { VirtualFS } from "../FileSystem/types";

export type CommandHandler = (ctx: {
  fs: VirtualFS;
  argv: string[];
  clearScreen: () => void;
}) => string | void;

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
