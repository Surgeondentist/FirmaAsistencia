"use client";

import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
} from "react";

const OUT_W = 300;
const OUT_H = 100;
const MAX_DATA_URL_CHARS = 20000;
const STROKE = "#111827";

export type SignatureCanvasHandle = {
  /** PNG data URL listo para enviar, o null si está vacío o no cumple límites */
  getSignatureDataUrl: () => string | null;
  clear: () => void;
};

/** Considera en blanco si no hay trazo oscuro (fondo blanco u homogéneo). */
function isCanvasBlank(ctx: CanvasRenderingContext2D, w: number, h: number) {
  const { data } = ctx.getImageData(0, 0, w, h);
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    const a = data[i + 3];
    if (a === 0) continue;
    if (r + g + b < 720) return false;
  }
  return true;
}

function buildCompressedPng(
  source: HTMLCanvasElement,
  sw: number,
  sh: number
): string | null {
  let w = OUT_W;
  let h = OUT_H;

  for (let attempt = 0; attempt < 12; attempt++) {
    const out = document.createElement("canvas");
    out.width = w;
    out.height = h;
    const octx = out.getContext("2d");
    if (!octx) return null;
    octx.fillStyle = "#ffffff";
    octx.fillRect(0, 0, w, h);
    octx.drawImage(source, 0, 0, sw, sh, 0, 0, w, h);

    if (isCanvasBlank(octx, w, h)) {
      return null;
    }

    const dataUrl = out.toDataURL("image/png", 0.7);
    if (dataUrl.length <= MAX_DATA_URL_CHARS) {
      return dataUrl;
    }

    w = Math.max(160, Math.floor(w * 0.88));
    h = Math.max(56, Math.floor(h * 0.88));
  }

  return null;
}

export const SignatureCanvas = forwardRef<SignatureCanvasHandle>(
  function SignatureCanvas(_props, ref) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawingRef = useRef(false);
  const lastRef = useRef<{ x: number; y: number } | null>(null);

  const getCtx = useCallback(() => {
    const el = canvasRef.current;
    if (!el) return null;
    return el.getContext("2d");
  }, []);

  const setupCanvas = useCallback(() => {
    const el = canvasRef.current;
    const ctx = getCtx();
    if (!el || !ctx) return;
    const dpr = typeof window !== "undefined" ? window.devicePixelRatio || 1 : 1;
    const cssW = el.clientWidth;
    const cssH = el.clientHeight;
    if (cssW === 0 || cssH === 0) return;
    el.width = Math.floor(cssW * dpr);
    el.height = Math.floor(cssH * dpr);
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.scale(dpr, dpr);
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, cssW, cssH);
    ctx.lineWidth = 2;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.strokeStyle = STROKE;
  }, [getCtx]);

  useEffect(() => {
    setupCanvas();
    const ro = new ResizeObserver(() => setupCanvas());
    if (canvasRef.current?.parentElement) {
      ro.observe(canvasRef.current.parentElement);
    }
    return () => ro.disconnect();
  }, [setupCanvas]);

  const pos = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const el = canvasRef.current;
    if (!el) return { x: 0, y: 0 };
    const r = el.getBoundingClientRect();
    return { x: e.clientX - r.left, y: e.clientY - r.top };
  };

  const onPointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    drawingRef.current = true;
    lastRef.current = pos(e);
  };

  const onPointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!drawingRef.current) return;
    const ctx = getCtx();
    if (!ctx) return;
    const p = pos(e);
    const last = lastRef.current;
    if (last) {
      ctx.beginPath();
      ctx.moveTo(last.x, last.y);
      ctx.lineTo(p.x, p.y);
      ctx.stroke();
    }
    lastRef.current = p;
  };

  const endStroke = () => {
    drawingRef.current = false;
    lastRef.current = null;
  };

  const clear = useCallback(() => {
    setupCanvas();
  }, [setupCanvas]);

  useImperativeHandle(ref, () => ({
    clear,
    getSignatureDataUrl: () => {
      const el = canvasRef.current;
      const ctx = getCtx();
      if (!el || !ctx) return null;
      const dpr = window.devicePixelRatio || 1;
      const sw = el.width;
      const sh = el.height;
      if (sw === 0 || sh === 0) return null;
      const full = document.createElement("canvas");
      full.width = sw;
      full.height = sh;
      const fctx = full.getContext("2d");
      if (!fctx) return null;
      fctx.drawImage(el, 0, 0);
      return buildCompressedPng(full, sw / dpr, sh / dpr);
    },
  }));

  return (
    <div className="space-y-2">
      <div className="rounded border border-gray-300 bg-white touch-none">
        <canvas
          ref={canvasRef}
          className="block h-40 w-full cursor-crosshair"
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={endStroke}
          onPointerCancel={endStroke}
          onPointerLeave={endStroke}
        />
      </div>
      <button
        type="button"
        onClick={clear}
        className="rounded border border-gray-300 bg-white px-3 py-1.5 text-sm text-gray-800 hover:bg-gray-50"
      >
        Limpiar
      </button>
    </div>
  );
});
