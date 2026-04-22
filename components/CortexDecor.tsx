/**
 * Ornamento fijo tipo “red / conexiones” en los laterales (desktop).
 * En móvil solo un degradado inferior muy suave (sin trazos animados).
 */
export function CortexDecor() {
  return (
    <>
      <div
        className="pointer-events-none fixed inset-y-0 left-0 z-[1] hidden w-[min(24vw,200px)] select-none lg:block"
        aria-hidden
      >
        <CortexSideGraphic className="text-violet-600/[0.22] dark:text-violet-400/[0.28]" />
      </div>
      <div
        className="pointer-events-none fixed inset-y-0 right-0 z-[1] hidden w-[min(24vw,200px)] select-none lg:block"
        aria-hidden
      >
        <CortexSideGraphic className="scale-x-[-1] text-fuchsia-600/[0.2] dark:text-fuchsia-400/[0.24]" />
      </div>
      {/* Móvil: acento inferior + línea punteada muy tenue */}
      <div
        className="pointer-events-none fixed inset-x-0 bottom-0 z-[1] h-28 overflow-hidden lg:hidden"
        aria-hidden
      >
        <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-violet-500/[0.14] via-fuchsia-500/[0.06] to-transparent dark:from-violet-500/20 dark:via-fuchsia-500/10" />
        <svg
          className="cortex-mobile-line absolute bottom-8 left-[12%] right-[12%] h-3 text-violet-500/25 dark:text-violet-400/20"
          viewBox="0 0 400 12"
          preserveAspectRatio="none"
          fill="none"
        >
          <path
            className="cortex-path cortex-path-fast"
            d="M0 6 H400"
            stroke="currentColor"
            strokeWidth="1"
          />
        </svg>
      </div>
    </>
  );
}

function CortexSideGraphic({ className }: { className?: string }) {
  return (
    <svg
      className={`cortex-svg h-full w-full ${className ?? ""}`}
      viewBox="0 0 200 900"
      preserveAspectRatio="xMinYMid slice"
      fill="none"
    >
      <path
        className="cortex-path cortex-path-slow"
        d="M 52 32 L 52 868"
        stroke="currentColor"
        strokeWidth="1.25"
      />
      <path
        className="cortex-path"
        d="M 78 100 L 78 800"
        stroke="currentColor"
        strokeWidth="0.9"
        opacity={0.75}
      />
      <path
        className="cortex-path cortex-path-mid"
        d="M 52 180 L 132 248 L 52 316"
        stroke="currentColor"
        strokeWidth="0.95"
        opacity={0.7}
      />
      <path
        className="cortex-path"
        d="M 52 420 L 118 488 L 52 556"
        stroke="currentColor"
        strokeWidth="0.95"
        opacity={0.65}
      />
      <path
        className="cortex-path cortex-path-slow"
        d="M 52 620 L 145 692 L 52 764"
        stroke="currentColor"
        strokeWidth="0.85"
        opacity={0.6}
      />
      <circle
        className="cortex-node fill-current text-violet-500 dark:text-violet-300"
        cx="52"
        cy="180"
        r="5"
      />
      <circle
        className="cortex-node cortex-node-delay fill-current text-fuchsia-500 dark:text-fuchsia-300"
        cx="132"
        cy="248"
        r="4"
      />
      <circle
        className="cortex-node cortex-node-delay-2 fill-current text-violet-500 dark:text-violet-300"
        cx="52"
        cy="420"
        r="4.5"
      />
      <circle
        className="cortex-node fill-current text-fuchsia-500 dark:text-fuchsia-300"
        cx="118"
        cy="488"
        r="3.5"
      />
      <circle
        className="cortex-node cortex-node-delay fill-current text-violet-500 dark:text-violet-300"
        cx="52"
        cy="620"
        r="4"
      />
      <circle
        className="cortex-node cortex-node-delay-2 fill-current text-fuchsia-500 dark:text-fuchsia-300"
        cx="145"
        cy="692"
        r="3.5"
      />
    </svg>
  );
}
