"use client";

import { useEffect, useRef, useState } from "react";
import jsQR from "jsqr";

// Lee códigos QR con la cámara (trasera en celulares). Llama a onCodigo(texto) por cada lectura,
// ignorando el mismo código durante unos segundos para no registrar dos veces.
export default function EscanerQR({ onCodigo, activo }) {
  const video = useRef(null);
  const canvas = useRef(null);
  const ultimo = useRef({ texto: "", t: 0 });
  const callback = useRef(onCodigo);
  const [error, setError] = useState("");

  useEffect(() => {
    callback.current = onCodigo;
  }, [onCodigo]);

  useEffect(() => {
    if (!activo) return;
    let stream;
    let frame;
    let vivo = true;

    const leer = () => {
      if (!vivo) return;
      const v = video.current;
      if (v && v.readyState === v.HAVE_ENOUGH_DATA) {
        const c = canvas.current;
        c.width = v.videoWidth;
        c.height = v.videoHeight;
        const ctx = c.getContext("2d", { willReadFrequently: true });
        ctx.drawImage(v, 0, 0, c.width, c.height);
        const img = ctx.getImageData(0, 0, c.width, c.height);
        const qr = jsQR(img.data, img.width, img.height, { inversionAttempts: "dontInvert" });
        const ahora = Date.now();
        if (qr?.data && (qr.data !== ultimo.current.texto || ahora - ultimo.current.t > 4000)) {
          ultimo.current = { texto: qr.data, t: ahora };
          callback.current(qr.data);
        }
      }
      frame = requestAnimationFrame(leer);
    };

    navigator.mediaDevices
      ?.getUserMedia({ video: { facingMode: "environment" }, audio: false })
      .then((s) => {
        if (!vivo) return s.getTracks().forEach((t) => t.stop());
        stream = s;
        video.current.srcObject = s;
        video.current.play();
        frame = requestAnimationFrame(leer);
      })
      .catch(() => setError("No se pudo acceder a la cámara. Revisa los permisos del navegador o usa el lector/teclado."));

    return () => {
      vivo = false;
      cancelAnimationFrame(frame);
      stream?.getTracks().forEach((t) => t.stop());
    };
  }, [activo]);

  return (
    <div className="relative rounded-xl overflow-hidden bg-black aspect-video">
      <video ref={video} className="w-full h-full object-cover" playsInline muted />
      <canvas ref={canvas} className="hidden" />
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-48 h-48 border-4 border-oro/80 rounded-2xl shadow-[0_0_0_9999px_rgba(0,0,0,0.35)]" />
      </div>
      {error && <p className="absolute bottom-0 inset-x-0 bg-red-600 text-white text-sm p-2 text-center">{error}</p>}
    </div>
  );
}
