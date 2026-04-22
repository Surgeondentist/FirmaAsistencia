"use client";

import { signIn } from "next-auth/react";

export function AdminSignIn() {
  return (
    <div className="mx-auto max-w-md rounded border border-gray-200 bg-white px-6 py-10 text-center shadow-sm">
      <h1 className="text-xl font-semibold text-gray-900">
        Administración
      </h1>
      <p className="mt-2 text-sm text-gray-600">
        Inicia sesión con la cuenta de Google autorizada.
      </p>
      <button
        type="button"
        onClick={() => signIn("google", { callbackUrl: "/admin" })}
        className="mt-8 w-full rounded border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-800 hover:bg-gray-50"
      >
        Continuar con Google
      </button>
    </div>
  );
}
