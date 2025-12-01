# ⚡ Web Terminal — Warp-Style Browser Shell

A modern, Warp-inspired **web terminal emulator** built with **React + TypeScript + Tailwind CSS**.  
It runs entirely in the browser — no backend required — and supports **Bash/Zsh-like autocompletion**,  
**inline help**, and **measurable command execution times**.

---

## ✨ Features

- 🧠 **Autocomplete & Context Suggestions**  
  Context-aware autocompletion for commands, flags, and paths — similar to Warp’s “AI command palette”.

- 💡 **Inline Command Help**  
  Displays quick usage hints below the prompt as you type.

- ⚙️ **Virtual File System (VFS)**  
  Simulates a minimal Linux-like directory tree (`/home/dev`), allowing navigation (`cd`, `ls`, `cat`, etc.).

- 🕒 **Execution & Paint Time Measurement**  
  Each executed command tracks both processing duration (`durationMs`) and UI paint time (`paintMs`).

- 🎨 **Warp-Inspired UI**  
  Uses glassmorphism, gradient accents, and shadowed blocks for a premium, desktop-grade look.

- 🧩 **Modular Architecture**  
  Commands, FS, and Shell utilities are split into independent TypeScript modules.  
  Each piece can be extended or replaced without affecting the rest of the system.

- 🔁 **Keyboard Shortcuts**
  | Shortcut | Action |
  |-----------|--------|
  | <kbd>Tab</kbd> | Accept suggestion |
  | <kbd>↑</kbd> / <kbd>↓</kbd> | Navigate history or suggestions |
  | <kbd>Ctrl/Cmd + L</kbd> | Clear screen |
  | <kbd>Ctrl/Cmd + U</kbd> | Clear current line |
  | <kbd>Ctrl/Cmd + C</kbd> | Cancel / Interrupt command |

---

## 🧱 Architecture Overview

| Module | Purpose |
|:--|:--|
| `Shell/service.ts` | Core shell logic (tokenization, autocompletion, inline help, async command execution) |
| `FileSystem/Controller.ts` | In-memory virtual file system |
| `ReactComponents/PromptLine.tsx` | Command input line UI |
| `ReactComponents/ContextSuggest.tsx` | Dropdown for command suggestions |
| `ReactComponents/StatusBar.tsx` | Footer info bar (cwd, hints, tips) |
| `App.tsx` | Main container handling I/O, history, and orchestration |

---

## 🚀 Running Locally

```bash
# 1. Clone the repository
git clone https://github.com/frelseRS/NeXterminal.git
cd web-terminal

# 2. Install dependencies
npm install

# 3. Start the dev server
npm run dev
```

## Example Commands

**Keyboard Shortcuts**

| Command                      | Description                        |
| ---------------------------|--------------------------------- |
| <kbd>help</kbd>                       | Lists all available commands       |
| <kbd>help </kbd>              | Shows usage for a specific command |
| <kbd>ls [-l] [path]</kbd>              | Lists directory contents           |
| <kbd>cd [path]</kbd>                  | Changes current directory          |
| <kbd>cat <file></kbd>                | Prints file content                |
| <kbd>grep [-i] <pattern> <file></kbd>  | Searches for a pattern in a file   |
| <kbd>date</kbd>                        | Prints current system time         |
| <kbd>clear</kbd>                       | Clears the terminal                |
| <kbd>man <command></kbd>               | Displays a mock manual page        |

## Tech Stack

- React 18

- TypeScript

- Tailwind CSS 3+

- Vite

- Virtual DOM for performance-accurate render timing (via ```performance.now()``` and ```requestAnimationFrame()```)



## 🧮 Performance Measurement

Each command logs:

- durationMs: pure execution time (handler start → handler finish)

- paintMs: render-to-screen latency (tracked via useRef and requestAnimationFrame)

These metrics are shown inline for each command block.

## 🧑‍💻 Extending the Shell

To add a new command, put a similar object inside ```Shell\commands.ts:```

```
typescript

{
  name: "ping",
  description: "Simulate network ping",
  usage: "ping <host>",
  handler: async ({ argv }) => {
    const host = argv[1] || "localhost";
    await new Promise(res => setTimeout(res, 200));
    return `PONG from ${host}`;
  },
};
```

## 🧪 Future Ideas

- Persistent session storage (e.g. localStorage or IndexedDB)

- Real shell piping simulation (|, >, etc.)

- Theme switching (Warp dark/light presets)

- Bridge to real OS commands (sandboxed); who knows

## License

MIT License © 2025 — Built for experimentation and portfolio purposes.
Feel free to ask if you want to contribute.

## Author

**sAlvo**

💻 Full-stack developer | React / .NET / Python | Passionate about operating systems, security, and engineering.

>A skate cruiser, but also someone who is between Bruce Wayne and Tony Stark — because, after all, that’s who I am.
>