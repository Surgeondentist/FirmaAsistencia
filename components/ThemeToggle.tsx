"use client";

import { useTheme } from "@/components/ThemeProvider";

function SunIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      aria-hidden
    >
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
    </svg>
  );
}

function MoonIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      aria-hidden
    >
      <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
    </svg>
  );
}

/** Interruptor tipo píldora con rebote y iconos sol/luna. */
export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className="theme-toggle-track group relative z-[100] inline-flex h-11 w-[4.25rem] shrink-0 items-center rounded-full border border-slate-300/90 bg-gradient-to-b from-white to-slate-100 p-1 shadow-md shadow-slate-900/10 transition-[box-shadow,transform] duration-200 hover:shadow-lg hover:shadow-violet-500/15 active:scale-[0.97] dark:border-white/15 dark:from-slate-800 dark:to-slate-900 dark:shadow-black/40 dark:hover:shadow-violet-400/10 touch-manipulation"
      aria-label={isDark ? "Activar modo claro" : "Activar modo oscuro"}
      title={isDark ? "Modo claro" : "Modo oscuro"}
    >
      <span className="pointer-events-none absolute inset-x-2 top-1/2 flex -translate-y-1/2 justify-between text-[11px] opacity-40 dark:opacity-35">
        <SunIcon className="h-3.5 w-3.5 text-amber-500" />
        <MoonIcon className="h-3.5 w-3.5 text-violet-600 dark:text-violet-300" />
      </span>
      <span
        className={`theme-toggle-knob relative z-[1] flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-600 text-white shadow-inner shadow-violet-950/30 ring-2 ring-white/80 transition-[transform,box-shadow] duration-300 ease-[cubic-bezier(0.34,1.45,0.64,1)] will-change-transform dark:from-violet-400 dark:to-fuchsia-500 dark:ring-white/10 ${
          isDark ? "translate-x-6" : "translate-x-0"
        } group-active:scale-95 motion-reduce:transition-none motion-reduce:group-active:scale-100`}
      >
        {isDark ? (
          <MoonIcon className="h-4 w-4" />
        ) : (
          <SunIcon className="h-4 w-4 text-amber-50" />
        )}
      </span>
    </button>
  );
}
