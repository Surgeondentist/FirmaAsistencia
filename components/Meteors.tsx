"use client";

import { cn } from "@/lib/utils";
import { motion } from "motion/react";
import type { CSSProperties } from "react";
import { useEffect, useMemo, useState } from "react";

/** Pseudoaleatorio estable (evita mismatch SSR/hidración). */
function hash01(i: number, salt: number) {
  const x = Math.sin(i * 12.9898 + salt * 78.233) * 43758.5453;
  return x - Math.floor(x);
}

/** Diagonal única: esquina superior izquierda → inferior derecha (trayectorias paralelas). */
const TL_BR_ROT = "42deg";

export function Meteors({
  number,
  className,
}: {
  number?: number;
  className?: string;
}) {
  const meteorCount = number ?? 20;
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduceMotion(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  const items = useMemo(() => {
    return Array.from({ length: meteorCount }, (_, idx) => {
      const ox = (hash01(idx, 4) - 0.5) * 12;
      const oy = (hash01(idx, 5) - 0.5) * 10;
      const delay = hash01(idx, 1) * 7;
      /* Más lentos: ~16–26 s por ciclo */
      const duration = 16 + hash01(idx, 2) * 10;
      return {
        idx,
        delay,
        duration,
        style: {
          "--mx-start": `calc(-16vw + ${ox}vw)`,
          "--my-start": `calc(-16vh + ${oy}vh)`,
          "--mx-end": `calc(116vw + ${ox}vw)`,
          "--my-end": `calc(118vh + ${oy}vh)`,
          "--m-rot": TL_BR_ROT,
          animationDelay: `${delay}s`,
          animationDuration: `${duration}s`,
        } as CSSProperties,
      };
    });
  }, [meteorCount]);

  if (reduceMotion) {
    return null;
  }

  return (
    <motion.div
      className={cn(
        "pointer-events-none fixed inset-0 z-0 overflow-hidden",
        className,
      )}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      aria-hidden
    >
      {items.map((el) => (
        <span
          key={`meteor-${el.idx}`}
          className={cn(
            "meteor-streak h-0.5 w-0.5 rounded-[9999px]",
            "bg-violet-600/85 shadow-[0_0_0_1px_rgb(255_255_255/0.12)]",
            "dark:bg-violet-300/75 dark:shadow-[0_0_0_1px_rgb(255_255_255/0.08)]",
            "before:absolute before:left-0 before:top-1/2 before:h-[1px] before:w-[min(55vw,260px)] before:-translate-y-1/2 before:transform",
            "before:bg-gradient-to-r before:from-violet-600/90 before:to-transparent",
            "dark:before:from-violet-200/85 dark:before:to-transparent",
            "before:content-['']",
          )}
          style={el.style}
        />
      ))}
    </motion.div>
  );
}
