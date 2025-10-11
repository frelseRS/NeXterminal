import React, { type Dispatch, type RefObject, type SetStateAction } from "react";

interface PromptLineProps {
  cwd: string;
  inputRef?: RefObject<HTMLInputElement | null>;
  input: string;
  setInput: Dispatch<SetStateAction<string>>;
  onKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
}

export default function PromptLine({ cwd, inputRef, input, setInput, onKeyDown }: PromptLineProps) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-cyan-300 hidden sm:inline">dev@browser</span>
      <span className="text-slate-400">:</span>
      <span className="text-emerald-300 truncate max-w-[40vw] sm:max-w-none">{cwd}</span>
      <span className="text-slate-400">$</span>
      <div className="flex-1 min-w-0">
        <input
          ref={inputRef}
          autoFocus
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={onKeyDown}
          spellCheck={false}
          placeholder="Type a command… (try: ls -l, cat readme.txt, grep -i notes notes.md)"
          className="w-full bg-transparent outline-none caret-cyan-300 placeholder:text-slate-500 text-[15px] leading-tight tracking-tight"
        />
      </div>
    </div>
  );
}