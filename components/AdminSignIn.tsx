"use client";

import { signIn } from "next-auth/react";

export function AdminSignIn() {
  return (
    <div className="glass-panel w-full max-w-md text-center">
      <div
          className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-violet-200/80 bg-gradient-to-br from-violet-500/20 to-fuchsia-500/15 shadow-inner dark:border-white/20 dark:from-violet-500/30 dark:to-fuchsia-500/20"
        aria-hidden
      >
        <svg
          className="h-8 w-8 text-violet-600 dark:text-violet-200"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1.5}
        >
          <title>Administración</title>
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z"
          />
        </svg>
      </div>
      <h1 className="theme-heading mt-8 text-2xl font-semibold tracking-tight">
        Administración
      </h1>
      <p className="theme-sub mt-3 text-sm leading-relaxed">
        Inicia sesión con Google para crear eventos y ver solo los tuyos.
      </p>
      <button
        type="button"
        onClick={() => signIn("google", { callbackUrl: "/admin" })}
        className="btn-primary mt-10 touch-manipulation"
      >
        Continuar con Google
      </button>
    </div>
  );
}
