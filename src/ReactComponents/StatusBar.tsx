import { isMac } from "../Shell/utils";

export default function StatusBar({ fs }: { fs: { cwd: string } }) {
    return (
        <div className="flex items-center gap-3 px-4 py-2 border-t border-white/10 text-[11px] text-slate-400/80">
            <span className="truncate">{fs.cwd}</span>
            <span className="mx-1">•</span>
            <span>Tips: ↑/↓ history · Tab accept · {isMac ? '⌘' : 'Ctrl'}+U clear line · {isMac ? '⌘' : 'Ctrl'}+C cancel</span>
        </div>
    );
}