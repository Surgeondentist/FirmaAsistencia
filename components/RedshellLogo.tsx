import Image from "next/image";

function appBaseUrl() {
  return (
    process.env.NEXTAUTH_URL?.replace(/\/$/, "") ?? "http://localhost:3000"
  );
}

/** Logo Redshell: esquina inferior, ~2× tamaño anterior, enlace al sitio (misma base que `NEXTAUTH_URL`). */
export function RedshellLogo() {
  const href = appBaseUrl();

  return (
    <div className="fixed bottom-4 left-4 z-[50] sm:bottom-6 sm:left-6">
      <a
        href={href}
        className="inline-block rounded-md ring-offset-2 ring-offset-transparent transition-opacity hover:opacity-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500"
        aria-label="Ir al inicio"
      >
        <Image
          src="/redshell-logo.png"
          alt="Redshell"
          width={176}
          height={240}
          className="h-28 w-auto max-h-[7rem] max-w-[11rem] object-contain object-left mix-blend-multiply dark:mix-blend-normal dark:opacity-95"
          priority={false}
        />
      </a>
    </div>
  );
}
