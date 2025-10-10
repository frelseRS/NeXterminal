import React from "react";

export default function PromptLine({ cwd, children }: { cwd: string; children?: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-cyan-300 hidden sm:inline">dev@browser</span>
      <span className="text-slate-400">:</span>
      <span className="text-emerald-300 truncate max-w-[40vw] sm:max-w-none">{cwd}</span>
      <span className="text-slate-400">$</span>
      <div className="flex-1 min-w-0">{children}</div>
    </div>
  );
}