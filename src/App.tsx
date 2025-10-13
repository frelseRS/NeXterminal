import React, { useEffect, useMemo, useRef, useState, type JSX } from "react";
import { clamp, isMac, nowStr, tokenize } from "./utils";
import type { HistoryItem } from "./interfaces/HistoryItem";
import type { VirtualFS } from "./FileSystem/types";
import makeFS from "./FileSystem/Controller";
import { buildSuggestions, inlineHelp } from "./Shell/prompt";
import { REGISTRY } from "./Shell/commands";
import PromptLine from "./ReactComponents/PromptLine";
import BootMessage from "./ReactComponents/BootMessage";

// --- Warp-like helper block ---
function Block({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={
      "rounded-2xl border border-white/10 bg-white/[0.04] backdrop-blur-xl " +
      "shadow-[0_10px_40px_-10px_rgba(0,0,0,0.6)] ring-1 ring-black/5 " + className
    }>
      {children}
    </div>
  );
}

export default function App(): JSX.Element {
  const [fs] = useState<VirtualFS>(() => makeFS());
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [input, setInput] = useState<string>("");
  const [histIdx, setHistIdx] = useState<number>(-1);
  const [suggest, setSuggest] = useState<{ items: ReturnType<typeof buildSuggestions>; index: number }>({ items: [], index: 0 });
  const [lastExit, setLastExit] = useState<0 | 1>(0);
  const endRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const focusInputSoon = () => requestAnimationFrame(() => inputRef.current?.focus());

  // Focus input when clicking anywhere on the main container (except on interactive elements)
  function handleContainerMouseDown(e: React.MouseEvent<HTMLDivElement>) {
    // Only focus if the click target is not an input, textarea, or contenteditable
    const target = e.target as HTMLElement;
    if (
      target.tagName !== "INPUT" &&
      target.tagName !== "TEXTAREA" &&
      target.getAttribute("contenteditable") !== "true"
    ) {
      focusInputSoon();
    }
  }

  const suggestions = useMemo(() => buildSuggestions(input, fs), [input, fs]);
  const miniHelp = useMemo(() => inlineHelp(input), [input]);

  useEffect(() => { setSuggest(s => ({ ...s, items: suggestions, index: 0 })); }, [suggestions]);
  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); focusInputSoon(); }, [history.length]);
  useEffect(() => { inputRef.current?.focus(); }, []);

  function clearScreen() { setHistory([]); focusInputSoon(); }

  function runCommand(line: string) {
    const argv = tokenize(line);
    if (argv.length === 0) return;
    const name = argv[0];
    const cmd = REGISTRY.byName(name);
    let out = ""; let exit: 0 | 1 = 0;
    if (!cmd) { out = name + ": command not found"; exit = 1; }
    else {
      try { out = (cmd.handler({ fs, argv, clearScreen }) as string) || ""; }
      catch (e: any) { out = "Error: " + (e?.message || String(e)); exit = 1; }
    }
    setHistory(h => [...h, { cmd: line, out, ts: new Date() }]);
    setLastExit(exit);
    focusInputSoon();
  }

  function acceptSuggestion() {
    if (!suggestions.length) return;
    const s = suggestions[suggest.index] || suggestions[0];
    const t = tokenize(input);
    if (t.length === 0 || (t.length === 1 && !input.endsWith(" "))) {
      setInput(s.label + " "); return;
    }
    if (input.endsWith(" ")) setInput(input + s.label);
    else {
      const idx = input.lastIndexOf(" ");
      setInput(input.slice(0, idx + 1) + s.label);
    }
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "c" && (e.ctrlKey || (isMac && e.metaKey))) {
      e.preventDefault(); setHistory(h => [...h, { cmd: input, out: "", ts: new Date() }]); setInput(""); setSuggest(s => ({ ...s, index: 0 })); return;
    }
    if (e.key === "l" && (e.ctrlKey || (isMac && e.metaKey))) { e.preventDefault(); clearScreen(); return; }
    if (e.key === "u" && (e.ctrlKey || (isMac && e.metaKey))) { e.preventDefault(); setInput(""); return; }

    if (e.key === "Tab") { e.preventDefault(); acceptSuggestion(); return; }

    if (e.key === "ArrowDown" && suggestions.length) { e.preventDefault(); setSuggest(s => ({ ...s, index: clamp(s.index + 1, 0, suggestions.length - 1) })); return; }
    if (e.key === "ArrowUp" && suggestions.length) { e.preventDefault(); setSuggest(s => ({ ...s, index: clamp(s.index - 1, 0, suggestions.length - 1) })); return; }

    if (e.key === "Enter") {
      e.preventDefault(); const line = input.trim();
      if (line.length) { runCommand(line); setInput(""); setHistIdx(-1); setSuggest(s => ({ ...s, index: 0 })); }
      else { setHistory(h => [...h, { cmd: "", out: "", ts: new Date() }]); }
      return;
    }

    // History navigation when no suggestions list is open
    if (e.key === "ArrowUp" && !suggestions.length) {
      if (history.length) { e.preventDefault(); const next = histIdx < 0 ? history.length - 1 : Math.max(0, histIdx - 1); setHistIdx(next); setInput(history[next].cmd); }
    }
    if (e.key === "ArrowDown" && !suggestions.length) {
      if (history.length) { e.preventDefault(); const next = histIdx < 0 ? -1 : Math.min(history.length - 1, histIdx + 1); setHistIdx(next); setInput(next === -1 ? "" : history[next].cmd); }
    }
  }

  return (
    <div className="min-h-dvh w-full bg-[#0a0d12] text-slate-100 px-3 sm:px-6 py-6 sm:py-10 font-mono"
      onMouseDown={handleContainerMouseDown}>
      <div className="mx-auto w-full max-w-5xl space-y-4">
        {/* Toolbar */}
        <Block>
          <div className="flex items-center gap-2 px-4 py-3 border-b border-white/10">
            <div className="flex items-center gap-1.5">
              <span className="h-3 w-3 rounded-full bg-[#ff5f56]" />
              <span className="h-3 w-3 rounded-full bg-[#ffbd2e]" />
              <span className="h-3 w-3 rounded-full bg-[#27c93f]" />
            </div>
            <div className="ml-3 text-sm text-slate-300/90 tracking-tight">Web Terminal — Demo</div>
            <div className="ml-auto text-[11px] text-slate-400">{isMac ? '⌘' : 'Ctrl'}+L clear · Tab autocomplete</div>
          </div>

          {/* Output blocks */}
          <div className="px-3 sm:px-6 py-4 sm:py-6 space-y-3">
            <div className="text-[13px] text-slate-300/90"><BootMessage /></div>

            {history.map((h, idx) => (
              <div key={idx} className="group">
                {/* meta */}
                <div className="flex items-center gap-2 text-[11px] text-slate-400/80 mb-1.5">
                  <span className="px-1.5 py-0.5 rounded bg-white/5 border border-white/10">{fs.cwd}</span>
                  <span>•</span>
                  <span>{new Date(h.ts).toLocaleTimeString()}</span>
                  <span>•</span>
                  <span className={"px-1.5 py-0.5 rounded border " + (lastExit === 0 ? "border-emerald-400/30 text-emerald-300/90 bg-emerald-500/5" : "border-rose-400/30 text-rose-300/90 bg-rose-500/5")}>exit {lastExit}</span>
                </div>
                <Block>
                  <div className="px-4 py-2.5 border-b border-white/10 flex items-center gap-2">
                    <span className="text-cyan-300">❯</span>
                    <span className="text-slate-200">{h.cmd || <span className="text-slate-500"># empty</span>}</span>
                  </div>
                  {h.out ? (
                    <pre className="px-4 py-3 whitespace-pre-wrap break-words text-[13px] leading-relaxed text-slate-200">{h.out}</pre>
                  ) : (
                    <div className="px-4 py-2 text-[12px] text-slate-500"># no output</div>
                  )}
                </Block>
              </div>
            ))}

            {/* Live prompt */}
            <div className="group">
              <div className="flex items-center gap-2 text-[11px] text-slate-400/80 mb-1.5">
                <span className="px-1.5 py-0.5 rounded bg-white/5 border border-white/10">{fs.cwd}</span>
                <span>•</span>
                <span>{nowStr()}</span>
              </div>
              <Block>
                <div className="px-3 sm:px-4 py-3 relative">
                  <div className="flex items-center gap-3">
                    <span className="text-cyan-300 text-lg leading-none">❯</span>
                    <div className="flex-1 min-w-0">
                      <PromptLine cwd={fs.cwd} inputRef={inputRef} onKeyDown={onKeyDown} input={input} setInput={setInput} />
                      <div className="mt-1 text-[11px] text-slate-500">{miniHelp}</div>
                    </div>
                  </div>

                  {suggestions.length > 0 && input.length > 0 && (
                    <div className="absolute left-3 right-3 top-[calc(100%+6px)] z-20">
                      <div className="rounded-xl border border-white/10 bg-[#0b0f15]/95 backdrop-blur-md shadow-2xl">
                        <ul className="max-h-64 overflow-auto text-sm divide-y divide-white/5">
                          {suggestions.map((s, i) => (
                            <li
                              key={s.kind + s.label + i}
                              onMouseDown={(e) => { e.preventDefault(); setSuggest(prev => ({ ...prev, index: i })); }}
                              onDoubleClick={(e) => { e.preventDefault(); setSuggest(prev => ({ ...prev, index: i })); acceptSuggestion(); }}
                              className={(i === suggest.index ? "bg-white/10 " : "") + "px-3 py-2 flex items-center gap-2 cursor-default select-none"}
                            >
                              <span className="text-[10px] px-1.5 py-0.5 rounded-full border border-white/10 text-slate-300 capitalize">{s.kind}</span>
                              <span className="text-slate-100">{s.label}</span>
                              {s.hint && <span className="ml-auto text-xs text-slate-400">{s.hint}</span>}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  )}
                </div>
              </Block>
            </div>
          </div>

          {/* Status bar */}
          <div className="flex items-center gap-3 px-4 py-2 border-t border-white/10 text-[11px] text-slate-400/80">
            <span className="truncate">{fs.cwd}</span>
            <span className="mx-1">•</span>
            <span>Tips: ↑/↓ history · Tab accept · {isMac ? '⌘' : 'Ctrl'}+U clear line · {isMac ? '⌘' : 'Ctrl'}+C cancel</span>
          </div>
        </Block>
      </div>
      <div ref={endRef} />
    </div>
  );
}