import type { Suggestion } from "../types/Suggestion";

interface ContextSuggestProps {
  suggestions: Suggestion[];
  activeIndex: number;
  onHover: (index: number) => void;
  onAccept: (index: number) => void;
}

/**
 * Warp-like suggestion dropdown for the terminal prompt.
 */
export default function ContextSuggest({
  suggestions,
  activeIndex,
  onHover,
  onAccept,
}: ContextSuggestProps) {
  if (!suggestions.length) return null;

  return (
    <div className="absolute left-3 right-3 top-[calc(100%+6px)] z-20">
      <div className="rounded-xl border border-white/10 bg-[#0b0f15]/95 backdrop-blur-md shadow-2xl">
        <ul className="max-h-64 overflow-auto text-sm divide-y divide-white/5">
          {suggestions.map((s, i) => (
            <li
              key={s.kind + s.label + i}
              onMouseDown={(e) => {
                e.preventDefault();
                onHover(i);
              }}
              onDoubleClick={(e) => {
                e.preventDefault();
                onAccept(i);
              }}
              className={
                (i === activeIndex ? "bg-white/10 " : "") +
                "px-3 py-2 flex items-center gap-2 cursor-default select-none"
              }
            >
              <span className="text-[10px] px-1.5 py-0.5 rounded-full border border-white/10 text-slate-300 capitalize">
                {s.kind}
              </span>
              <span className="text-slate-100">{s.label}</span>
              {s.hint && (
                <span className="ml-auto text-xs text-slate-400">{s.hint}</span>
              )}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}