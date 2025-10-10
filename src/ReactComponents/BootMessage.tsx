export default function BootMessage() {
  return (
    <div className="mb-6 text-[13px] leading-relaxed text-slate-300/90">
      <div>Welcome to <span className="text-cyan-300">web-terminal</span>. Type <code className="px-1 bg-white/10 rounded">help</code> to see commands.</div>
      <div className="opacity-80">This is a demo shell with Bash/Zsh-like autocomplete and hints. Extend the registry to add real commands or wire to a backend.</div>
    </div>
  );
}